import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { humanize, parseMeta, readMeta, routeFor, compareEntries, buildSidebar } from '../scripts/generate-sidebar.mjs'

test('humanize produces readable titles', () => {
  assert.equal(humanize('installation.md'), 'Installation')
  assert.equal(humanize('user-management.md'), 'User Management')
  assert.equal(humanize('getting-started'), 'Getting Started')
  assert.equal(humanize('api-reference'), 'Api Reference')
  assert.equal(humanize('index.md'), 'Index')
  assert.equal(humanize('API.md'), 'Api')
  assert.equal(humanize('My Page.md'), 'My Page')
})

test('parseMeta extracts title and integer order only', () => {
  assert.deepEqual(parseMeta('---\ntitle: Getting Started\norder: 2\n---\n# H'), { title: 'Getting Started', order: 2 })
  assert.deepEqual(parseMeta('# no frontmatter'), { title: undefined, order: undefined })
  assert.deepEqual(parseMeta('---\ntitle: X\norder: "two"\n---\n'), { title: 'X', order: undefined })
})

test('readMeta reads frontmatter from a file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-meta-'))
  const file = path.join(dir, 'x.md')
  fs.writeFileSync(file, '---\ntitle: Zed\norder: 5\n---\n# Zed')
  assert.deepEqual(readMeta(file), { title: 'Zed', order: 5 })
  fs.rmSync(dir, { recursive: true, force: true })
})

test('routeFor maps markdown paths to extensionless routes', () => {
  assert.equal(routeFor('getting-started/installation.md'), '/getting-started/installation')
  assert.equal(routeFor('api/users.md'), '/api/users')
  assert.equal(routeFor('getting-started/index.md'), '/getting-started/')
  assert.equal(routeFor('index.md'), '/')
})

const e = (order, isDir, sortName) => ({ order, isDir, sortName })

test('compareEntries: ordered entries sort first, ascending', () => {
  assert.equal(compareEntries(e(2, false, 'b'), e(1, true, 'a')), 1)
  assert.equal(compareEntries(e(1, true, 'a'), e(undefined, false, 'z')), -1)
  assert.equal(compareEntries(e(undefined, true, 'a'), e(1, false, 'z')), 1)
})

test('compareEntries: dirs before files, then alphabetical', () => {
  assert.equal(compareEntries(e(undefined, true, 'docs'), e(undefined, false, 'api')), -1)
  assert.equal(compareEntries(e(undefined, false, 'api'), e(undefined, false, 'users')), -1)
})

test('compareEntries: equal explicit orders fall through to dir/file then name', () => {
  assert.equal(compareEntries(e(1, true, 'z'), e(1, false, 'a')), -1)
  assert.equal(compareEntries(e(5, false, 'b'), e(5, false, 'a')), 1)
})

function makeTree(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    // '/'-suffixed keys are bare directories (e.g. 'empty-dir/')
    if (rel.endsWith('/')) {
      fs.mkdirSync(path.join(root, rel), { recursive: true })
      continue
    }
    const f = path.join(root, rel)
    fs.mkdirSync(path.dirname(f), { recursive: true })
    fs.writeFileSync(f, content ?? '')
  }
}

test('buildSidebar derives groups and items from the filesystem', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-side-'))
  makeTree(root, {
    'index.md': '# Home',
    '.hidden.md': '',
    'notes.txt': '',
    'getting-started/index.md': '---\ntitle: Getting Started\norder: 1\n---\n# GS',
    'getting-started/installation.md': '---\ntitle: Installation\n---\n# I',
    'getting-started/configuration.md': '---\ntitle: Configuring the SDK\n---\n# C',
    'api/users.md': '---\ntitle: Users\n---\n# U',
    'api/projects.md': '# Projects',
    'guides/deployment.md': '# Deployment',
    'only-index/index.md': '# Only Index',
    'empty-dir/': '',
    'deep/nested/docs/detail.md': '# Detail',
  })
  const sidebar = buildSidebar(root)
  assert.deepEqual(sidebar, [
    { text: 'Getting Started', link: '/getting-started/', items: [
      { text: 'Configuring the SDK', link: '/getting-started/configuration' },
      { text: 'Installation', link: '/getting-started/installation' },
    ] },
    { text: 'Api', items: [
      { text: 'Projects', link: '/api/projects' },
      { text: 'Users', link: '/api/users' },
    ] },
    { text: 'Deep', items: [
      { text: 'Nested', items: [
        { text: 'Docs', items: [
          { text: 'Detail', link: '/deep/nested/docs/detail' },
        ] },
      ] },
    ] },
    { text: 'Empty Dir', items: [] },
    { text: 'Guides', items: [{ text: 'Deployment', link: '/guides/deployment' }] },
    { text: 'Only Index', link: '/only-index/', items: [] },
  ])
  fs.rmSync(root, { recursive: true, force: true })
})