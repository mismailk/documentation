import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { findUnmarkedCommandBlocks } from '../scripts/agent-docs.mjs'

const GUIDE = 'docs/deploy-pipeline-guide/deploy-pipeline'

// Pages not marked yet. Tasks remove entries as they mark pages; plan 3 empties it.
export const PENDING = new Set([
  'server-setup.md', 'add-an-app.md', 'go-live.md', 'everyday-use.md', 'troubleshooting.md', 'reference.md',
  'express/index.md', 'express/prepare-your-app.md',
  'nextjs/index.md', 'nextjs/prepare-your-app.md', 'nextjs/go-live.md', 'nextjs/everyday-use.md',
])

// Bash blocks that are reference text, not commands to run. Match on the exact block body.
export const REFERENCE_BLOCKS = []

const pages = (dir, base = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? pages(path.join(dir, e.name), `${base}${e.name}/`) : e.name.endsWith('.md') ? [`${base}${e.name}`] : [])

test('every command block in the guide is inside a step marker', () => {
  for (const page of pages(GUIDE)) {
    if (PENDING.has(page)) continue
    const src = fs.readFileSync(path.join(GUIDE, page), 'utf8')
    const unmarked = findUnmarkedCommandBlocks(src)
      .filter((b) => !REFERENCE_BLOCKS.some((r) => r.file === page && r.code === b.code))
    assert.deepEqual(unmarked, [], `${page} has command blocks without a ::: step marker`)
  }
})

test('PENDING and REFERENCE_BLOCKS only name real pages', () => {
  const all = new Set(pages(GUIDE))
  for (const p of PENDING) assert.ok(all.has(p), `PENDING names a missing page: ${p}`)
  for (const r of REFERENCE_BLOCKS) assert.ok(all.has(r.file), `REFERENCE_BLOCKS names a missing page: ${r.file}`)
})
