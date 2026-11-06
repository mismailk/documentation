import container from 'markdown-it-container'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// Step metadata vocabulary. A typo in either list is a build error, never a
// silently unmarked step.
export const LEVELS = ['run', 'ask', 'never']
export const PLACES = ['laptop', 'server', 'github']

// Only pages under this docs/ directory get an agent copy.
export const AGENT_SCOPE = 'deploy-pipeline-guide'

const STEP_KEYS = ['level', 'where', 'verify']

// Parse the text after `step` in a `::: step …` marker. Accepts `key=value`
// and `key="…"`, where `\"` inside quotes becomes `"`. Throws an Error whose
// message names the offending attribute.
export function parseStepAttrs(info) {
  const attrs = {}
  const re = /(\w+)=("(?:[^"\\]|\\.)*"|\S*)/g
  let match
  while ((match = re.exec(info)) !== null) {
    const key = match[1]
    if (!STEP_KEYS.includes(key)) {
      throw new Error(`unknown attribute "${key}" in step marker: ${info.trim()}`)
    }
    let value = match[2]
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"')
    }
    attrs[key] = value
  }

  if (!LEVELS.includes(attrs.level)) {
    throw new Error(`invalid or missing level "${attrs.level ?? ''}" in step marker: ${info.trim()}`)
  }
  if (!PLACES.includes(attrs.where)) {
    throw new Error(`invalid or missing where "${attrs.where ?? ''}" in step marker: ${info.trim()}`)
  }

  const result = { level: attrs.level, where: attrs.where }
  if (attrs.verify !== undefined) result.verify = attrs.verify
  return result
}

// Scan a markdown source line by line. Inside a fenced block (` ``` ` or
// `~~~`) container syntax is ignored; outside, `::: name` opens a container
// and `:::` closes the innermost one. Shared by findUnmarkedCommandBlocks and
// the agent-copy transformer.
function scanSource(source) {
  const lines = source.split('\n')
  const fences = []
  const containers = []
  const inFence = new Array(lines.length).fill(false)
  const stack = []
  let fence = null

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    if (fence) {
      inFence[i] = true
      const close = new RegExp(`^ {0,3}${fence.char}{${fence.length},}\\s*$`)
      if (close.test(line)) {
        fences.push({
          start: fence.start,
          end: i,
          lang: fence.lang,
          inStep: fence.inStep,
          code: lines
            .slice(fence.start + 1, i)
            .map((body) => body.replace(new RegExp(`^ {0,${fence.indent}}`), ''))
            .join('\n'),
        })
        fence = null
      }
      continue
    }

    const fenceOpen = line.match(/^( {0,3})(`{3,}|~{3,})\s*([^\s`]*)/)
    if (fenceOpen) {
      inFence[i] = true
      fence = {
        char: fenceOpen[2][0],
        length: fenceOpen[2].length,
        indent: fenceOpen[1].length,
        start: i,
        lang: fenceOpen[3],
        inStep: stack.some((c) => c.name === 'step'),
      }
      continue
    }

    const containerOpen = line.match(/^:::+\s*(\S+)/)
    if (containerOpen) {
      stack.push({ name: containerOpen[1], start: i })
      continue
    }

    if (/^:::+\s*$/.test(line)) {
      const closed = stack.pop()
      if (closed) containers.push({ name: closed.name, start: closed.start, end: i })
    }
  }

  if (stack.length > 0) {
    const open = stack[stack.length - 1]
    throw new Error(`unclosed ::: ${open.name} container (line ${open.start + 1})`)
  }

  return { lines, fences, containers, inFence }
}

// Every fenced bash/sh/shell block that is not inside a `::: step` container.
// `line` is the 1-based line of the opening fence; `code` is the body.
export function findUnmarkedCommandBlocks(source) {
  const { fences } = scanSource(source)
  return fences
    .filter((f) => !f.inStep && ['bash', 'sh', 'shell'].includes(f.lang))
    .map((f) => ({ line: f.start + 1, code: f.code }))
}

// Register the two invisible containers on a markdown-it instance:
// - `::: step …` renders its content and nothing else (validating attributes).
// - `::: agent` renders nothing at all; its tokens are dropped.
export function useAgentContainers(md) {
  md.use(container, 'step', {
    render(tokens, idx) {
      const token = tokens[idx]
      if (token.nesting === 1) {
        parseStepAttrs(token.info.trim().replace(/^step\b/, '').trim())
      }
      return ''
    },
  })

  md.use(container, 'agent')

  md.core.ruler.after('block', 'agent_containers', (state) => {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'container_agent_open') continue
      let depth = 1
      let j = i + 1
      for (; j < tokens.length; j++) {
        if (tokens[j].type === 'container_agent_open') depth += 1
        else if (tokens[j].type === 'container_agent_close') {
          depth -= 1
          if (depth === 0) break
        }
      }
      if (j === tokens.length || tokens[j].markup === '') {
        const line = tokens[i].map ? tokens[i].map[0] + 1 : '?'
        throw new Error(`unclosed ::: agent container (line ${line})`)
      }
      tokens.splice(i, j - i + 1)
      i -= 1
    }
  })
}

// Join a site base and a target path without doubling or dropping slashes.
function joinBase(base, target) {
  return `${base.replace(/\/+$/, '')}/${target.replace(/^\/+/, '')}`
}

// The website route of an agent page path (without its .md extension).
function siteUrl(base, pagePath) {
  let route = pagePath.replace(/\.md$/, '')
  if (route === 'index') return base
  if (route.endsWith('/index')) route = route.slice(0, -'index'.length)
  return joinBase(base, route)
}

// Rewrite one line of markdown: withBase anchors to plain links, and relative
// page links either to the matching agent copy (.md) or to the website URL.
function rewriteLine(line, { relPath, base, scope }) {
  const dir = path.posix.dirname(relPath)

  let out = line.replace(
    /<a\s+[^>]*:href="withBase\('([^']+)'\)"[^>]*>([\s\S]*?)<\/a>/g,
    (_, target, text) => `[${text}](${joinBase(base, target)})`,
  )

  out = out.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, text, target) => {
    if (/^(?:https?:|mailto:|#)/.test(target)) return whole
    if (!target.startsWith('./') && !target.startsWith('../')) return whole

    const hashIndex = target.indexOf('#')
    const targetPath = hashIndex === -1 ? target : target.slice(0, hashIndex)
    const hash = hashIndex === -1 ? '' : target.slice(hashIndex)

    let pagePath
    if (targetPath.endsWith('/')) {
      const resolved = path.posix.normalize(path.posix.join(dir, targetPath))
      pagePath = resolved === '.' ? 'index.md' : `${resolved}/index.md`
    } else {
      const resolved = path.posix.normalize(path.posix.join(dir, targetPath))
      pagePath = resolved.endsWith('.md') ? resolved : `${resolved}.md`
    }

    if (pagePath.startsWith(`${scope}/`)) {
      let relative = path.posix.relative(dir, pagePath)
      if (!relative.startsWith('.')) relative = `./${relative}`
      return `[${text}](${relative}${hash})`
    }
    return `[${text}](${siteUrl(base, pagePath)}${hash})`
  })

  return out
}

// Turn one guide source page into its agent copy: heading from the title,
// no script/style, agent and v-pre unwrapped, links rewritten for an agent.
export function toAgentCopy(source, { relPath, base, scope = AGENT_SCOPE }) {
  const parsed = matter(source)
  let content = parsed.content

  if (!/^# /m.test(content) && parsed.data.title) {
    content = `# ${parsed.data.title}\n\n${content}`
  }

  content = content
    .replace(/<script\b[\s\S]*?<\/script>\s*/g, '')
    .replace(/<style\b[\s\S]*?<\/style>\s*/g, '')

  let scan = scanSource(content)
  const drop = new Set()
  for (const c of scan.containers) {
    if (c.name === 'v-pre' || c.name === 'agent') {
      drop.add(c.start)
      drop.add(c.end)
    }
  }
  if (drop.size > 0) {
    content = scan.lines.filter((_, i) => !drop.has(i)).join('\n')
    scan = scanSource(content)
  }

  const lines = scan.lines.map((line, i) =>
    scan.inFence[i] ? line : rewriteLine(line, { relPath, base, scope }),
  )
  return lines.join('\n')
}

function collectMarkdown(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectMarkdown(full))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full)
  }
  return files
}

// Write <outDir>/agent/<relPath> for every .md under <srcDir>/<scope>.
// Returns the written relPaths, sorted.
export function writeAgentDocs({ srcDir, outDir, base, scope = AGENT_SCOPE }) {
  const written = []
  for (const file of collectMarkdown(path.join(srcDir, scope))) {
    const relPath = path.relative(srcDir, file).split(path.sep).join('/')
    const dest = path.join(outDir, 'agent', relPath)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, toAgentCopy(fs.readFileSync(file, 'utf8'), { relPath, base, scope }))
    written.push(relPath)
  }
  return written.sort()
}
