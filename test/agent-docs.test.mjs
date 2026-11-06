import { test } from 'node:test'
import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import { parseStepAttrs, useAgentContainers } from '../scripts/agent-docs.mjs'

test('parseStepAttrs reads level, where and a quoted verify with escaped quotes', () => {
  assert.deepEqual(parseStepAttrs('level=run where=laptop'), { level: 'run', where: 'laptop' })
  assert.deepEqual(
    parseStepAttrs(`level=ask where=server verify="grep -A1 'case \\"$2\\" in' /opt/deploy/deploy.sh"`),
    { level: 'ask', where: 'server', verify: `grep -A1 'case "$2" in' /opt/deploy/deploy.sh` },
  )
})

test('parseStepAttrs rejects missing, invalid and unknown attributes', () => {
  assert.throws(() => parseStepAttrs('where=laptop'), /level/)
  assert.throws(() => parseStepAttrs('level=mayb where=laptop'), /level/)
  assert.throws(() => parseStepAttrs('level=run'), /where/)
  assert.throws(() => parseStepAttrs('level=run where=moon'), /where/)
  assert.throws(() => parseStepAttrs('level=run wehre=server'), /wehre/)
})

const md = () => { const m = new MarkdownIt(); useAgentContainers(m); return m }
const fence = '```bash\nnpm ci\n```\n'

test('a step container renders exactly its content', () => {
  assert.equal(md().render(`::: step level=run where=laptop\n${fence}:::\n`), md().render(fence))
})

test('an agent container renders nothing', () => {
  assert.equal(md().render(`Before.\n\n::: agent\nAgent-only **text**.\n\n${fence}:::\n\nAfter.\n`), md().render('Before.\n\nAfter.\n'))
})

test('a step container with bad attributes fails the render', () => {
  assert.throws(() => md().render(`::: step level=maybe where=laptop\n${fence}:::\n`), /level/)
})

import { findUnmarkedCommandBlocks } from '../scripts/agent-docs.mjs'

test('findUnmarkedCommandBlocks reports bash blocks outside steps only', () => {
  const src = [
    '# T',                                  // 1
    '```bash', 'npm ci', '```',             // 2-4  unmarked
    '::: step level=run where=laptop',      // 5
    '```bash', 'npm test', '```',           // 6-8  marked
    ':::',                                  // 9
    '::: tip',                              // 10
    '```sh', 'ls', '```',                   // 11-13 unmarked (tip is not a step)
    ':::',                                  // 14
    '```text', 'tree', '```',               // 15-17 not a command language
  ].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(src), [{ line: 2, code: 'npm ci' }, { line: 11, code: 'ls' }])
})

test('findUnmarkedCommandBlocks ignores ::: inside code fences', () => {
  const src = ['::: step level=run where=laptop', '````md', ':::', '````', '```bash', 'echo hi', '```', ':::'].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(src), [])
})

test('findUnmarkedCommandBlocks sees steps nested in v-pre', () => {
  const src = ['::: v-pre', '::: step level=run where=laptop', '```bash', 'grep -rn x .', '```', ':::', ':::'].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(src), [])
})

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { toAgentCopy, writeAgentDocs } from '../scripts/agent-docs.mjs'

const rel = 'deploy-pipeline-guide/deploy-pipeline/express/index.md'
const opts = { relPath: rel, base: '/documentation/' }

test('toAgentCopy turns the frontmatter title into a heading and drops script and style', () => {
  const out = toAgentCopy('---\ntitle: Express\norder: 0\n---\n<script setup>\nimport { withBase } from "vitepress"\n</script>\n\nBody.\n', opts)
  assert.match(out, /^# Express\n/)
  assert.doesNotMatch(out, /script|order:/)
  assert.match(out, /Body\./)
})

test('toAgentCopy keeps step markers, unwraps agent and v-pre, keeps tip', () => {
  const src = '# T\n\n::: agent\nAgent text.\n:::\n\n::: v-pre\n{{X}}\n:::\n\n::: step level=run where=laptop\n```bash\nnpm ci\n```\n:::\n\n::: tip\nHi\n:::\n'
  const out = toAgentCopy(src, opts)
  assert.match(out, /Agent text\./)
  assert.doesNotMatch(out, /::: agent|::: v-pre/)
  assert.match(out, /::: step level=run where=laptop\n```bash\nnpm ci\n```\n:::/)
  assert.match(out, /::: tip\nHi\n:::/)
})

test('toAgentCopy rewrites links to agent copies, downloads and out-of-guide pages', () => {
  const src = [
    '# T',
    '[a](./prepare-your-app#pick-your-values) [b](../) [c](../add-an-app#env-file) [d](../#download-the-kit)',
    '[e](../../../reference/commands) [f](https://x.y/z) [g](#steps)',
    `**<a :href="withBase('/downloads/express-deploy-kit.zip')" download>⬇ express-deploy-kit.zip</a>**`,
    '```bash', 'echo "[not](./a-link)"', '```',
  ].join('\n')
  const out = toAgentCopy(src, opts)
  assert.match(out, /\[a\]\(\.\/prepare-your-app\.md#pick-your-values\)/)
  assert.match(out, /\[b\]\(\.\.\/index\.md\)/)
  assert.match(out, /\[c\]\(\.\.\/add-an-app\.md#env-file\)/)
  assert.match(out, /\[d\]\(\.\.\/index\.md#download-the-kit\)/)
  assert.match(out, /\[e\]\(\/documentation\/reference\/commands\)/)
  assert.match(out, /\[f\]\(https:\/\/x\.y\/z\) \[g\]\(#steps\)/)
  assert.match(out, /\*\*\[⬇ express-deploy-kit\.zip\]\(\/documentation\/downloads\/express-deploy-kit\.zip\)\*\*/)
  assert.match(out, /echo "\[not\]\(\.\/a-link\)"/)
})

test('writeAgentDocs mirrors the scoped tree under agent/ and skips other sections', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-docs-'))
  const src = path.join(root, 'docs'), out = path.join(root, 'dist')
  for (const [f, c] of Object.entries({
    'deploy-pipeline-guide/deploy-pipeline/index.md': '# Index\n',
    'deploy-pipeline-guide/deploy-pipeline/express/index.md': '# Express\n',
    'reference/commands.md': '# Commands\n',
  })) { fs.mkdirSync(path.dirname(path.join(src, f)), { recursive: true }); fs.writeFileSync(path.join(src, f), c) }
  assert.deepEqual(writeAgentDocs({ srcDir: src, outDir: out, base: '/' }), [
    'deploy-pipeline-guide/deploy-pipeline/express/index.md',
    'deploy-pipeline-guide/deploy-pipeline/index.md',
  ])
  assert.ok(fs.existsSync(path.join(out, 'agent/deploy-pipeline-guide/deploy-pipeline/express/index.md')))
  assert.ok(!fs.existsSync(path.join(out, 'agent/reference')))
  fs.rmSync(root, { recursive: true, force: true })
})
