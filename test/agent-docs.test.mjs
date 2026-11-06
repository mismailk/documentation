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
