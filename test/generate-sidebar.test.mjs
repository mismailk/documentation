import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { humanize, parseMeta, readMeta, routeFor } from '../scripts/generate-sidebar.mjs'

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