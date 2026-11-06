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
