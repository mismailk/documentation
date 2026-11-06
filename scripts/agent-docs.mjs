import container from 'markdown-it-container'

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
      const close = new RegExp(`^${fence.char}{${fence.length},}\\s*$`)
      if (close.test(line)) {
        fences.push({
          start: fence.start,
          end: i,
          lang: fence.lang,
          inStep: fence.inStep,
          code: lines.slice(fence.start + 1, i).join('\n'),
        })
        fence = null
      }
      continue
    }

    const fenceOpen = line.match(/^(`{3,}|~{3,})\s*([^\s`]*)/)
    if (fenceOpen) {
      inFence[i] = true
      fence = {
        char: fenceOpen[1][0],
        length: fenceOpen[1].length,
        start: i,
        lang: fenceOpen[2],
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
      tokens.splice(i, j - i + 1)
      i -= 1
    }
  })
}
