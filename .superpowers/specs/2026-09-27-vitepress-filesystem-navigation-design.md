# VitePress Filesystem-Driven Navigation — Design Spec

- **Date:** 2026-09-27
- **Status:** Approved for implementation planning
- **Scope:** New subsystem — automatic sidebar/navigation generation for a VitePress 1.6 docs site, plus GitHub Pages deployment.

---

## 1. Context

`documentation-pages` is a VitePress documentation project. Today it is a bare shell:

- `package.json` — scripts `dev`/`build`/`serve`, devDependencies `vitepress@1.0.0-alpha.28` (Oct 2022), `vue@3.2.44`, npm lockfile
- `docs/index.md` — `# Hello World`
- `docs/.vitepress/config.ts` — empty `defineConfig({})`
- No git repository, no CI, no navigation configuration

The goal is a docs site where **the `docs/` filesystem hierarchy is the single source of truth for navigation**. Documentation authors add, remove, rename, or reorder `.md` files and directories; the sidebar must reflect that automatically with zero hand-maintained VitePress `sidebar` configuration.

## 2. Goals

1. Recursively scan `docs/` and derive the VitePress sidebar from directories + Markdown files.
2. Frontmatter `title` controls display text; missing titles fall back to humanized names.
3. Optional frontmatter `order` controls explicit ordering; otherwise deterministic fallback ordering.
4. Directories with `index.md` get a clickable group landing page; no duplicate nav entries.
5. Generated navigation is a build artifact (not source), regenerated before `docs:dev` and `docs:build`.
6. `.vitepress/config.mjs` contains only global/theme configuration — no hand-written `sidebar:` array.
7. GitHub Actions deploys the built site to GitHub Pages on push to `main`.
8. Upgrade the project to VitePress 1.6.4 (the old alpha is unmaintained and uses a different config API).
9. Keep the implementation minimal, dependency-light, and easy for future developers to understand.

## 3. Non-Goals

- Multi-sidebar layouts (per-section sidebars switched by route). A single top-level sidebar with group objects suffices for this sized site; object-form config is a future extension, not part of this work.
- Custom themes, i18n, multi-language nav, blogs, or content collections.
- Watching for changes during dev — generation runs on `docs:dev`/`docs:build` invocation only.
- A browser-based editor or drag-and-drop reordering UI.

## 4. Architecture & Components

```
documentation-pages/
├── package.json                     # scripts updated; npm kept (existing lockfile)
├── .gitignore                       # + generated artifact, vitepress cache
├── docs/                            # source of truth (VitePress root)
│   ├── index.md                     # landing page (excluded from sidebar)
│   ├── getting-started/…
│   └── .vitepress/
│       ├── config.mjs               # global site config; imports generated sidebar
│       └── sidebar.gen.mjs          # GENERATED artifact (gitignored)
├── scripts/
│   ├── generate-sidebar.mjs         # the scanner/generator (CLI entry)
│   └── (pure helper functions within the same module, exported for tests)
├── test/
│   └── generate-sidebar.test.mjs    # node:test unit tests for pure functions
├── .github/
│   └── workflows/
│       └── deploy.yml               # GitHub Pages deployment
└── .superpowers/                    # (spec/plan documents live here, outside docs/)
```

Notable relocations and decisions:

- `docs/.vitepress/config.ts` → `docs/.vitepress/config.mjs` (plain ESM, consistent with the generator and artifact being `.mjs`).
- Spec/plan documents live in `.superpowers/` at the repo root, **not** `docs/`, because `docs/` is rendered content — a spec file inside it would become a documentation page.
- New dependency: `gray-matter` (devDependency) for frontmatter parsing.
- New devDependencies as required by VitePress 1.6.4 upgrade (Vue is a peer dependency of VitePress and must be bumped to a compatible 3.x).

## 5. Generator Behavior (`scripts/generate-sidebar.mjs`)

Run as a standalone CLI: `node scripts/generate-sidebar.mjs`. Walks `docs/` recursively (depth-first), builds a tree, then emits the sidebar array.

### 5.1 Scanning & exclusions

- Walk `docs/` recursively at arbitrary depth.
- **Excluded:** dot-prefixed entries (`.vitepress`, `.DS_Store`), non-`.md` files, and the root `docs/index.md` (it remains the `/` landing page and never appears in the sidebar).
- Subdirectory `index.md` is the directory's "landing" page and is consumed as metadata + group link — never emitted as its own nav item (no duplicates).

### 5.2 Titles (display text)

- **Directory/group:** `title` from its `index.md` frontmatter; else humanized directory name (`getting-started` → `Getting Started`, `api-reference` → `Api Reference`).
- **File/item:** `title` from its frontmatter; else humanized filename (`installation.md` → `Installation`, `user-management.md` → `User Management`).

Humanization rule: strip the `.md` extension, split on `[-_\s]`, lowercase words except the first, uppercase the first letter of each word (`api-key` → `Api Key`).

### 5.3 Ordering (deterministic comparator, applied per sibling set)

1. Items with explicit integer `order` sort first, ascending; ties between two ordered items fall through to rules 3–4.
2. Items without `order` come after all ordered items.
3. Directories sort before loose Markdown files.
4. Alphabetical by route/link (stable, reflects filesystem names).

A directory's `order` is read from its `index.md` frontmatter. For groups without a link (no `index.md`), the directory name is the sort key for rule 4.

### 5.4 Routes (sidebar `link` values)

- `docs/getting-started/installation.md` → `/getting-started/installation`
- `docs/api/users.md` → `/api/users`
- `docs/getting-started/index.md` → `/getting-started/` (this is the group's `link`, not an item)
- Directory **with** `index.md` → group `{ text, link: '/<dir>/', items: [...] }` (link clickable to the section landing page).
- Directory **without** `index.md` → group `{ text, items: [...] }` (no link).
- All links are relative to the site root (with `base` applied by VitePress at runtime).

### 5.5 Output artifact

- Writes `docs/.vitepress/sidebar.gen.mjs`, `export default [ … ]`.
- Human-readable, stable ordering; header comment: `// Generated by scripts/generate-sidebar.mjs — do not edit.`
- Gitignored (build artifact, not source). Resolves to an empty sidebar under a directory containing no eligible Markdown files.

### 5.6 Edge cases

| Case | Behavior |
|---|---|
| Directory with only `index.md` | Group with a single clickable landing item (its link) and no child items. |
| Empty directory | Kept as an empty group (a deliberate authoring signal; easily switched to skip — flag in code comment). |
| Nested directories | Arbitrary recursion depth of groups/items. |
| File with missing frontmatter / no title | Humanized name fallback. |
| Invalid or non-numeric `order` | Treated as absent (falls through ordering rules). |
| Duplicate titles | Allowed; links remain unique by filesystem name, which is what matters. |

## 6. VitePress Config (`docs/.vitepress/config.mjs`)

- `import { defineConfig } from 'vitepress'`.
- Imports `./sidebar.gen.mjs` as `sidebar`. **No hand-written `sidebar:` array anywhere.**
- Graceful fallback: if the artifact import fails (e.g., someone ran `vitepress build docs` directly without generating), warn on stderr and use an empty sidebar rather than crashing.
- `base`: `normalizeBase(process.env.VITEPRESS_BASE || '/')` — forces leading and trailing slash so project-page deployments (`/<repo>/`) work with a single env var.
- Global/theme config only:
  - `title`, `description` (site metadata)
  - `themeConfig.search: { provider: 'local' }` (built-in local search)
  - `themeConfig.lastUpdated`, social links (as configured)
  - `themeConfig.sidebar` = the imported generated sidebar
- `cleanUrls` left default; routes above already assume VitePress default URL mapping.

## 7. package.json Scripts

```json
{
  "scripts": {
    "generate": "node scripts/generate-sidebar.mjs",
    "docs:dev": "npm run generate && vitepress dev docs",
    "docs:build": "npm run generate && vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "test": "node --test test/"
  }
}
```

- The old `dev`/`build`/`serve` scripts are replaced by the `docs:*` family.
- `docs:dev` and `docs:build` are the supported entry points; running `vitepress … docs` directly is supported only via the config's graceful fallback.
- Tests run with Node's built-in `node:test` — no test framework dependency added.

## 8. GitHub Pages Deployment (`.github/workflows/deploy.yml`)

- Triggers: `push` to `main`, plus `workflow_dispatch` for manual runs.
- Concurrency group `pages` with `cancel-in-progress: true`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Node 20 (VitePress 1.6 requires Node ≥ 18).
- Steps (official GitHub Pages flow):

```yaml
- uses: actions/checkout@v7
- uses: actions/setup-node@v7
  with: { node-version: 20, cache: npm }
- run: npm ci
- run: npm run docs:build
  env:
    VITEPRESS_BASE: /${{ github.event.repository.name }}/
- uses: actions/configure-pages@v6
- uses: actions/upload-pages-artifact@v5
  with: { path: docs/.vitepress/dist }
# deploy job:
- uses: actions/deploy-pages@v5
```

- Deployment environment: `github-pages` with `url` from the deploy step output.

## 9. Manual Setup Prerequisites (documented in plan, not code)

1. `git init` the repo (currently not a repository), create remote, push `main`.
2. GitHub → Settings → Pages → Source: **GitHub Actions**.
3. Run `npm install` to upgrade VitePress and Vue on the local machine.

## 10. Testing

- **Unit** (`test/generate-sidebar.test.mjs`, `node:test`):
  - Humanization of filenames and directory names.
  - Ordering comparator: explicit `order`, dirs-before-files, alphabetical fallback, ties.
  - Route building, including `index.md → directory route` and no-duplicate rule.
  - Scan-and-build against a fixture directory tree (temp dir with sample structure incl. hidden files, non-md files, empty dir).
  - Artifact writer output shape (import and assert the emitted ESM exports the expected array).
- **Smoke:** a full `npm run docs:build` succeeded by a developer with the sample tree; verifying a second build after adding/removing a file reflects the change.
- Tests must pass before implementation is considered complete.

## 11. Performance & Reliability Notes

- Generation is a filesystem walk + tiny frontmatter parses per file — sub-second for typical doc sites; no caching needed.
- Deterministic output: same tree always produces byte-identical artifact (stable sort, no dependence on `fs` readdir order without explicit sorting).

## 12. Out of Scope (future, recorded for context)

- Per-section (multi) sidebars via object-form `sidebar`.
- Nav header links derived from filesystem (currently static in config).
- `order` with non-integer semantics (decimal/draft ordering) or group-level `collapsed` defaults toggles.
- Watch mode re-generation on file change.

## 13. Key Decisions (why we chose this)

| Decision | Rationale |
|---|---|
| VitePress 1.6.4 (upgrade) | Old alpha (1.0.0-alpha.28) is unmaintained; 1.x stable has the current config API, local search, and long-term support. |
| Artifact file + pre-hooks | Matches "navigation as build artifact" intent; artifact is inspectable; generation is explicit and predictable. Trade-off (staleness if run outside scripts) mitigated by graceful config fallback. |
| Single top-level sidebar array | Correct size for a section-based docs site; object-form left as a future extension. |
| `gray-matter` for frontmatter | Robust YAML/JSON frontmatter parsing without hand-rolling; tiny, standard dependency. |
| `node:test` for tests | Zero-added-dependency testing on modern Node. |
| `base` from `VITEPRESS_BASE` env | One variable covers both local `/` and project-page `/<repo>/` deployments without editing config per environment. |
| Specs in `.superpowers/` not `docs/` | `docs/` is rendered content; placing docs there would violate the source-of-truth principle this project is built around. |