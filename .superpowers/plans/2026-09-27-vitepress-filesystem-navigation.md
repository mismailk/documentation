# VitePress Filesystem-Driven Navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A VitePress 1.6 docs site whose sidebar is generated automatically from the `docs/` filesystem hierarchy (no hand-written `sidebar` config), deployed to GitHub Pages by CI on push to `main`.

**Architecture:** A standalone build-time generator (`scripts/generate-sidebar.mjs`) scans `docs/`, derives sidebar groups/items from directories and Markdown files (frontmatter `title`/`order` or humanized-name fallbacks, deterministic ordering), and writes `docs/.vitepress/sidebar.gen.json`. `.vitepress/config.mjs` reads that JSON via `fs` (esbuild-proof, with a graceful fallback) and exposes it as `themeConfig.sidebar`. `docs:dev`/`docs:build` regenerate the artifact first; CI builds and deploys `docs/.vitepress/dist` via the official GitHub Pages actions.

**Tech Stack:** Node ≥ 18 (dev/CI on Node 22), npm, VitePress 1.6.4, Vue 3.5, `gray-matter` (frontmatter), Node built-in `node:test` for tests, GitHub Actions.

**Spec:** `.superpowers/specs/2026-09-27-vitepress-filesystem-navigation-design.md` — the plan argues from the spec, so the executor reads both.

## Global Constraints

All verbatim from the spec; every task inherits these.

1. Dependencies: `vitepress` `^1.6.4`, `vue` `^3.5.13` (explicit devDependency — VitePress 1.6.4 depends on `vue@^3.5.13` directly), `gray-matter` `^4.0.3` (devDependencies). `"engines": { "node": ">=18" }`. npm stays (lockfile exists).
2. Generator artifact: `docs/.vitepress/sidebar.gen.json` (JSON, 2-space indent), **gitignored**, generated before every build. Never commit it.
3. Config: `docs/.vitepress/config.mjs` (created; `config.ts` deleted). Reads artifact via `node:fs` with try/catch → warn + `[]`. **No hand-written `sidebar:` array.**
4. Scripts: `generate`, `docs:dev` (`generate && vitepress dev docs`), `docs:build` (`generate && vitepress build docs`), `docs:preview`, `test` (`node --test test/`).
5. Generator exclusions: dot-prefixed entries (`.vitepress`, `.DS_Store`), non-`.md` files, root `docs/index.md`. Subdirectory `index.md` is directory metadata + group link, never its own nav item.
6. Ordering (compareEntries): (1) explicit integer `order` ascending, ties → rules 3–4; (2) unordered after all ordered; (3) directories before loose `.md` files; (4) alphabetical by route/link, for groups without a link the directory name. `order` that is not an integer is treated as absent. Empty directories are kept as `{ text, items: [] }` groups.
7. Links are extensionless routes (`/getting-started/installation`); `cleanUrls` stays off (default) — VitePress resolves these to `.html` in output.
8. `base` = normalized `VITEPRESS_BASE || '/'` (leading+trailing slash forced; `'./'` passed through).
9. CI: Node 22, npm; action pins `checkout@v7`, `setup-node@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`; `VITEPRESS_BASE: /${{ github.event.repository.name }}/`; upload path `docs/.vitepress/dist`.

## Review Focus

Input classes the spec implies but no task's tests exercise directly; the task that owns each input carries its test/verification.

1. **Unusual filenames** (`API.md`, `My Page.md`, camel/mixed case) — humanize must produce deterministic title case, never empty or mangled. → Task 2 test.
2. **Malformed frontmatter** (`order: "two"`, missing title, no frontmatter) — must degrade to fallbacks, never throw. → Task 2 test.
3. **`VITEPRESS_BASE` unset or malformed** — config must default to `/` and normalize; CI's `/<repo>/` value must prefix built links. → Task 6 verification.
4. **`vitepress ... docs` run directly without generating** — must warn and still build (empty sidebar), not crash. → Task 6 verification (the fs-fallback requirement).
5. **Deeply nested dirs with no landing pages** — groups without links must still render and build without dead-link failures. → Task 3 fixture + Task 6/7 build smoke.

---

### Task 1: Upgrade toolchain to VitePress 1.6.4

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (via `npm install`)

**Interfaces:**
- Produces: installable dependencies `vitepress@^1.6.4`, `vue@^3.5.13`, `gray-matter@^4.0.3`; `"engines": { "node": ">=18" }` present.

- [ ] **Step 1: Update `package.json`**

Replace the `devDependencies` block with:

```json
"devDependencies": {
  "vue": "^3.5.13",
  "vitepress": "^1.6.4",
  "gray-matter": "^4.0.3"
}
```

Delete the obsolete `"pnpm": { ... }` block. Add an `engines` field at top level:

```json
"engines": {
  "node": ">=18"
}
```

(Leave `scripts` untouched — replaced in Task 6.)

- [ ] **Step 2: Install and verify**

Run: `npm install`
Then: `npm ls vitepress vue gray-matter`
Expected: `vitepress@1.6.4`, `vue@3.5.x`, `gray-matter@4.0.3`.

- [ ] **Step 3: Legacy smoke build still works with old `config.ts`**

Run: `npm run build`
Expected: command succeeds; `docs/.vitepress/dist/index.html` exists.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: upgrade to VitePress 1.6.4, Vue 3.5, add gray-matter"
```

---

### Task 2: Generator pure helpers — humanize, parseMeta, readMeta, routeFor

**Files:**
- Create: `scripts/generate-sidebar.mjs` (helpers only for now — no `main` yet)
- Create: `test/generate-sidebar.test.mjs`

**Interfaces:**
- Produces (fixed signatures, used by Tasks 3–5):
  - `humanize(name: string): string`
  - `parseMeta(content: string): { title?: string; order?: number }` — always returns both keys (values may be `undefined`); reads only `title` and `order`; `order` kept only when `Number.isInteger(data.order)`.
  - `readMeta(file: string): { title?: string; order?: number }` — `parseMeta(fs.readFileSync(file, 'utf8'))`.
  - `routeFor(relPath: string): string` — `.md`-relative to project root.
- Consumes: `gray-matter` (`import matter from 'gray-matter'`).

- [ ] **Step 1: Write the failing tests**

Append to `test/generate-sidebar.test.mjs`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/` → Expected: FAIL (module `../scripts/generate-sidebar.mjs` cannot be resolved).

- [ ] **Step 3: Implement the four helpers in `scripts/generate-sidebar.mjs`**

- `humanize(name)`: strip trailing `.md`; split on `[-_\s]+`; drop empty tokens; lowercase every token except the first; uppercase the first letter of every token; join with a single space.
- `parseMeta(content)`: `const { data } = matter(content)`; return `{ title: data.title, order: Number.isInteger(data.order) ? data.order : undefined }`.
- `readMeta(file)`: parse the file's contents as above.
- `routeFor(relPath)`: strip `.md`; if the remaining path is `index` or ends with `/index`, map to `/…/` (the directory route); otherwise `/` + path.

Also declare `export {}` helpers only — do not add a `main` or a CLI guard in this task.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/` → Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-sidebar.mjs test/generate-sidebar.test.mjs
git commit -m "feat: add sidebar generator title/meta/route helpers"
```

---

### Task 3: Deterministic ordering — compareEntries

**Files:**
- Modify: `scripts/generate-sidebar.mjs`
- Modify: `test/generate-sidebar.test.mjs`

**Interfaces:**
- Produces: `compareEntries(a: SortableEntry, b: SortableEntry): number` where `SortableEntry = { order?: number; isDir: boolean; sortName: string }`. Returns negative when `a` sorts before `b`.
- Consumes: nothing new.

- [ ] **Step 1: Write the failing tests**

Append:

```js
import { compareEntries } from '../scripts/generate-sidebar.mjs'

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/` → Expected: the `compareEntries` import errors (name not exported).

- [ ] **Step 3: Implement `compareEntries(a, b)` in `scripts/generate-sidebar.mjs`**

Comparator body (this is the exact spec ordering, copied from Global Constraints 6):

```js
export function compareEntries(a, b) {
  const aHas = a.order !== undefined
  const bHas = b.order !== undefined
  if (aHas && bHas && a.order !== b.order) return a.order - b.order
  if (aHas !== bHas) return aHas ? -1 : 1
  if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
  if (a.sortName < b.sortName) return -1
  if (a.sortName > b.sortName) return 1
  return 0
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/` → Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-sidebar.mjs test/generate-sidebar.test.mjs
git commit -m "feat: sidebar ordering comparator (order, dirs-first, alphabetical)"
```

---

### Task 4: Recursive filesystem scan — buildSidebar

**Files:**
- Modify: `scripts/generate-sidebar.mjs`
- Modify: `test/generate-sidebar.test.mjs`

**Interfaces:**
- Produces: `buildSidebar(docsDir: string): SidebarItem[]` where `SidebarItem = { text: string; link?: string; items?: SidebarItem[] }`.
- Consumes: `humanize`, `readMeta`, `routeFor`, `compareEntries` (from Tasks 2–3).

- [ ] **Step 1: Write the failing test**

Append:

```js
import { buildSidebar } from '../scripts/generate-sidebar.mjs'

function makeTree(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const f = path.join(root, rel)
    fs.mkdirSync(path.dirname(f), { recursive: true })
    if (rel !== 'empty-dir/') fs.writeFileSync(f, content ?? '')
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/` → Expected: FAIL (`buildSidebar` not exported).

- [ ] **Step 3: Implement `buildSidebar(docsDir)` in `scripts/generate-sidebar.mjs`**

Recursive algorithm:

1. `readdirSync(dir, { withFileTypes: true })`.
2. Per sibling set, collect descriptors:
   - Skip entries whose name starts with `.`.
   - For a directory: if `index.md` exists inside, read its meta as the group's `order`/`title`; the group's `sortName` is `routeFor(index.md relative path)` when it has one, else the directory name.
   - For a file: only `.md`; skip the root `docs/index.md` (pass an `isRoot` flag); a non-root `index.md` provides the *directory's* meta at the parent level (handled with its parent directory — never emitted as its own item); all other `.md` files are items with `sortName = routeFor(...)`.
3. Sort each sibling set *by raw name first* (bytewise `<`/`>`), then stable-sort with `compareEntries` — guarantee byte-identical output regardless of `readdir` order.
4. Map to output:
   - directory → `{ text: indexMeta.title ?? humanize(dirName), link: indexMeta ? routeFor(rel/index.md) : undefined, items: <recursion> }` (only include `link` when an `index.md` exists).
   - file → `{ text: meta.title ?? humanize(fileName), link: routeFor(rel/file.md) }`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/` → Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-sidebar.mjs test/generate-sidebar.test.mjs
git commit -m "feat: recursive filesystem sidebar scanner"
```

---

### Task 5: Artifact writer and CLI entry

**Files:**
- Modify: `scripts/generate-sidebar.mjs`
- Modify: `test/generate-sidebar.test.mjs`

**Interfaces:**
- Produces:
  - `renderArtifact(sidebar: SidebarItem[]): string` — `JSON.stringify(sidebar, null, 2) + '\n'`
  - `writeArtifact(sidebar: SidebarItem[], outFile: string): void` — `mkdirSync(path.dirname(outFile), { recursive: true })` then write.
  - `main(): void` — CLI: resolve repo root from `import.meta.url` (`../`), `docsDir = root/docs`, `outFile = root/docs/.vitepress/sidebar.gen.json`; log `Generated <outFile> (<topLevel> top-level items)`.
  - Module bottom guard, so importing the module never runs the scan:

```js
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
```

- Consumes: `buildSidebar` (Task 4).

- [ ] **Step 1: Write the failing test**

Append:

```js
import { renderArtifact } from '../scripts/generate-sidebar.mjs'

test('renderArtifact round-trips to JSON', () => {
  const sidebar = [{ text: 'G', link: '/g/', items: [] }]
  assert.deepEqual(JSON.parse(renderArtifact(sidebar)), sidebar)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/` → Expected: FAIL (`renderArtifact` not exported).

- [ ] **Step 3: Implement `renderArtifact`, `writeArtifact`, `main`, and the CLI guard in `scripts/generate-sidebar.mjs`**

Exact guard code from the Interfaces block goes at the end of the module. `main()` uses only `node:fs`, `node:path`, `node:url` and `buildSidebar` — no user input, no flags.

- [ ] **Step 4: Run tests to verify they pass, then exercise the CLI**

Run: `node --test test/` → Expected: PASS (9 tests).

Run: `node scripts/generate-sidebar.mjs`
Expected: prints `Generated .../docs/.vitepress/sidebar.gen.json (0 top-level items)` (the tree currently holds only `docs/index.md`); the file exists and parses as `[]`.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-sidebar.mjs test/generate-sidebar.test.mjs
git commit -m "feat: sidebar artifact writer and CLI entry"
```

---

### Task 6: VitePress config, npm scripts, gitignore

**Files:**
- Create: `docs/.vitepress/config.mjs`
- Delete: `docs/.vitepress/config.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: the `sidebar.gen.json` artifact (Tasks 4–5) via `node:fs`.
- Produces: the site's `.vitepress` config; the `generate`/`docs:dev`/`docs:build`/`docs:preview`/`test` scripts; gitignored artifact.

- [ ] **Step 1: Create `docs/.vitepress/config.mjs` with this exact content**

```js
import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function normalizeBase(base) {
  if (base === './') return base
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base += '/'
  return base
}

function loadSidebar() {
  const file = path.join(__dirname, 'sidebar.gen.json')
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    console.warn('[vitepress] sidebar.gen.json is missing — run `npm run generate` (docs:dev/docs:build do this automatically). Using an empty sidebar.')
    return []
  }
}

export default defineConfig({
  lang: 'en-US',
  title: 'Documentation',
  description: 'A VitePress documentation site with filesystem-driven navigation.',
  base: normalizeBase(process.env.VITEPRESS_BASE || '/'),
  themeConfig: {
    search: { provider: 'local' },
    sidebar: loadSidebar(),
  },
})
```

- [ ] **Step 2: Delete `docs/.vitepress/config.ts`** (superseded; keeps VitePress from resolving two config files). This file is not yet tracked by git, so a plain `rm` is all that is needed.

- [ ] **Step 3: Update `package.json`** — replace `scripts` with exactly:

```json
"scripts": {
  "generate": "node scripts/generate-sidebar.mjs",
  "docs:dev": "npm run generate && vitepress dev docs",
  "docs:build": "npm run generate && vitepress build docs",
  "docs:preview": "vitepress preview docs",
  "test": "node --test test/"
}
```

- [ ] **Step 4: Update `.gitignore`** — append:

```gitignore
# VitePress generated navigation artifact + cache
docs/.vitepress/sidebar.gen.json
docs/.vitepress/cache/
```

(`dist` already covers `docs/.vitepress/dist`.)

- [ ] **Step 5: Verify generate + tests + build**

Run: `npm run generate` → Expected: creates `docs/.vitepress/sidebar.gen.json` containing `[]`.
Run: `npm run test` → Expected: all 9 tests PASS.
Run: `npm run docs:build` → Expected: succeeds; `docs/.vitepress/dist/index.html` exists; no dead-link errors.

- [ ] **Step 6: Verify the graceful fallback (build without artifact)**

Run:
```bash
mv docs/.vitepress/sidebar.gen.json /tmp/sidebar.gen.json.bak
vitepress build docs
mv /tmp/sidebar.gen.json.bak docs/.vitepress/sidebar.gen.json
```
Expected: build succeeds; stderr contains the `sidebar.gen.json is missing` warning.

- [ ] **Step 7: Verify `base` from env**

Run:
```bash
VITEPRESS_BASE=/doc-site/ npm run docs:build
grep -oE "/doc-site/[^\"]*" docs/.vitepress/dist/index.html | head -3
npm run docs:build
```
Expected: grep prints asset hrefs prefixed with `/doc-site/`; the final rebuild (default base) runs clean.

- [ ] **Step 8: Commit**

```bash
git add docs/.vitepress/config.mjs package.json .gitignore
git commit -m "feat: vitepress config reads generated sidebar; docs scripts; gitignore"
```

---

### Task 7: Sample docs content and regeneration proof

**Files:**
- Create: `docs/index.md` (replace `# Hello World`)
- Create: `docs/getting-started/index.md`, `docs/getting-started/installation.md`, `docs/getting-started/configuration.md`
- Create: `docs/guides/authentication.md`, `docs/guides/deployment.md`
- Create: `docs/api/users.md`, `docs/api/projects.md`
- Create: `docs/tutorials/index.md`, `docs/tutorials/beginner.md`, `docs/tutorials/advanced.md` (added in Step 4, kept)
- Test: assertions read `docs/.vitepress/sidebar.gen.json` after each `npm run generate`

**Interfaces:**
- Consumes: `npm run generate` (Task 5 CLI) and the build (Task 6).
- Produces: a real docs tree demonstrating titles, `order`, groups-with and without landing pages, and auto-regeneration on add/rename/remove.

- [ ] **Step 1: Write the content files**

`docs/index.md`:

```markdown
# Docs

Welcome to the documentation site. The sidebar is generated from this directory.
```

`docs/getting-started/index.md`:

```markdown
---
title: Getting Started
order: 1
---
# Getting Started
```

`docs/getting-started/installation.md`:

```markdown
---
title: Installation
order: 1
---
# Installation
```

`docs/getting-started/configuration.md`:

```markdown
---
title: Configuration
---
# Configuration
```

`docs/guides/authentication.md`:

```markdown
---
title: Authentication
---
# Authentication
```

`docs/guides/deployment.md`:

```markdown
---
title: Deployment
---
# Deployment
```

`docs/api/users.md`:

```markdown
---
title: Users
order: 1
---
# Users
```

`docs/api/projects.md`:

```markdown
---
title: Projects
order: 0
---
# Projects
```

- [ ] **Step 2: Regenerate and assert the derived sidebar**

Run: `npm run generate`
Then:
```bash
node -e "const s=JSON.parse(require('fs').readFileSync('docs/.vitepress/sidebar.gen.json','utf8')); console.log(s.map(g=>g.text).join(', '))"
```
Expected: `Getting Started, Api, Guides` — and inside `getting-started`: `Installation, Configuration` (ordered `Installation` first via `order: 1`); inside `api`: `Projects, Users` (Projects `order: 0` first); `api` group is `{ text: 'Api', items: [...] }` with no `link` (no `index.md`); `getting-started` group has `"link": "/getting-started/"`.

- [ ] **Step 3: Build smoke**

Run: `npm run docs:build` → Expected: succeeds, no dead links.

- [ ] **Step 4: Add `tutorials/` — it must appear with no config change**

Create `docs/tutorials/index.md` (`title: Tutorials`), `docs/tutorials/beginner.md` (`title: Beginner`), `docs/tutorials/advanced.md` (`title: Advanced`). Run `npm run generate`, then the `node -e` line from Step 2.
Expected: `Getting Started, Api, Guides, Tutorials`; `tutorials` group has `"link": "/tutorials/"` and items `Advanced, Beginner` (alphabetical; `Index` not duplicated).

- [ ] **Step 5: Rename `docs/api/users.md` → proving renames propagate**

Run:
```bash
mv docs/api/users.md docs/api/accounts.md
```
Edit `docs/api/accounts.md` frontmatter `title: Accounts`. Run `npm run generate`, then:
```bash
node -e "const s=JSON.parse(require('fs').readFileSync('docs/.vitepress/sidebar.gen.json','utf8').toString()); const api=s.find(g=>g.text==='Api'); console.log(api.items.map(i=>i.link).join(' '))"
```
Expected: `/api/accounts /api/projects` (Accounts after ordered Projects; `users` gone).
Then revert: `mv docs/api/accounts.md docs/api/users.md` and restore `title: Users` in `docs/api/users.md`.

- [ ] **Step 6: Delete `docs/guides/authentication.md` → proving removals propagate**

Run: `rm docs/guides/authentication.md`, then `npm run generate`, then:
```bash
node -e "const s=JSON.parse(require('fs').readFileSync('docs/.vitepress/sidebar.gen.json','utf8')); console.log(s.find(g=>g.text==='Guides').items.map(i=>i.text).join(','))"
```
Expected: `Deployment` only.
Then restore: recreate `docs/guides/authentication.md` with its Step 1 content.

- [ ] **Step 7: Final generate + build + tests, commit**

Run: `npm run generate`, `npm run docs:build`, `npm run test` → all succeed (9 tests).
Note: `docs/.vitepress/sidebar.gen.json` must NOT be committed (gitignored).

```bash
git add docs/
git commit -m "docs: sample content demonstrating filesystem-driven sidebar"
```

---

### Task 8: GitHub Pages workflow and README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

**Interfaces:**
- Produces: CI that regenerates the sidebar, builds, and publishes `docs/.vitepress/dist`; usage documentation.

- [ ] **Step 1: Create `.github/workflows/deploy.yml` with this exact content**

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - name: Setup Pages
        uses: actions/configure-pages@v6
      - name: Install dependencies
        run: npm ci
      - name: Build with VitePress
        run: npm run docs:build
        env:
          VITEPRESS_BASE: /${{ github.event.repository.name }}/
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Create `README.md`** with sections: what this is (filesystem-driven sidebar), prerequisites (Node 22, npm), commands (`npm install`, `npm run docs:dev`, `npm run docs:build`, `npm run generate`, `npm run test`), how the sidebar works (scan → `sidebar.gen.json` → config), and one-time GitHub setup: enable Pages with Source **GitHub Actions** and push to `main`.

- [ ] **Step 3: Validate the workflow YAML parses**

Run:
```bash
node -e "const y=require('js-yaml'); const d=y.load(require('fs').readFileSync('.github/workflows/deploy.yml','utf8')); console.log('ok', d.name, Object.keys(d.permissions).join(','))"
```
Expected: `ok Deploy VitePress site to Pages contents,pages,id-token` (`js-yaml` is a transitive dependency of `gray-matter`).

- [ ] **Step 4: Final verification and commit**

Run: `npm run test` then `npm run docs:build` → all green.
Confirm the workflow uploads a real output: `test -f docs/.vitepress/dist/index.html`.

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: deploy docs to GitHub Pages on push to main"
```

---

## After All Tasks

- All 9 tests pass; `npm run docs:build` succeeds with the sample tree; artifact is gitignored and regenerated on every `docs:dev`/`docs:build`.
- One-time manual setup (documented in README): repository pushed to GitHub with `main`, Pages source set to **GitHub Actions**.