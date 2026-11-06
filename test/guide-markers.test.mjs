import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { findUnmarkedCommandBlocks, writeAgentDocs } from '../scripts/agent-docs.mjs'

const GUIDE = 'docs/deploy-pipeline-guide/deploy-pipeline'

// Pages not marked yet. Tasks remove entries as they mark pages; plan 3 empties it.
export const PENDING = new Set([])

// Bash blocks that are reference text, not commands to run. Match on the exact block body.
export const REFERENCE_BLOCKS = [
  { file: 'add-an-app.md', code: '    backend) ;;' },
  { file: 'add-an-app.md', code: '    backend | <app>) ;;' },
  {
    file: 'reference.md',
    code: [
      'docker run -d --name <CONTAINER> \\',
      '  --init \\',
      '  --network host \\',
      '  --restart unless-stopped \\',
      '  --memory <MEMORY> --memory-swap <MEMORY> \\',
      '  --log-opt max-size=10m --log-opt max-file=3 \\',
      '  -v <ENV_FILE>:/app/.env:ro \\',
      '  --label deploy.app=<app> \\',
      '  --label deploy.env=<env> \\',
      '  --label deploy.tag=<tag> \\',
      '  <IMAGE>:<tag>',
    ].join('\n'),
  },
]

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

test('every link in the agent copies resolves to an agent page', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-links-'))
  writeAgentDocs({ srcDir: 'docs', outDir: out, base: '/' })
  const root = path.join(out, 'agent')
  const broken = []
  for (const page of pages(path.join(root, 'deploy-pipeline-guide/deploy-pipeline'))) {
    const file = path.join(root, 'deploy-pipeline-guide/deploy-pipeline', page)
    const text = fs.readFileSync(file, 'utf8').replace(/^ *```[\s\S]*?^ *```/gm, '')
    for (const [, target] of text.matchAll(/\]\((\.{1,2}\/[^)#\s]*)/g)) {
      if (!fs.existsSync(path.join(path.dirname(file), target))) broken.push(`${page} -> ${target}`)
    }
  }
  fs.rmSync(out, { recursive: true, force: true })
  assert.deepEqual(broken, [])
})

test('the agent index lists the whole route for both paths', () => {
  const src = fs.readFileSync(path.join(GUIDE, 'index.md'), 'utf8')
  const route = src.slice(src.indexOf('**Route.**'), src.indexOf('**Pick the path.**'))
  for (const link of ['./how-it-works', './express/app-readiness', './express/prepare-your-app', './server-setup', './add-an-app', './go-live',
    './nextjs/how-it-works', './nextjs/app-readiness', './nextjs/prepare-your-app', './nextjs/go-live']) {
    assert.ok(route.includes(`](${link})`), `route list is missing ${link}`)
  }
})
