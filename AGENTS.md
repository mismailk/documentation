# AGENTS.md

VitePress 1.6 docs site where the `docs/` filesystem is the single source of truth for the sidebar. `scripts/generate-sidebar.mjs` scans `docs/` recursively and writes `docs/.vitepress/sidebar.gen.json`; `docs/.vitepress/config.mjs` loads that JSON as `themeConfig.sidebar`. There is no hand-maintained navigation config.

## Commands

- `npm run docs:dev` / `npm run docs:build` — regenerate the sidebar, then start the dev server / build to `docs/.vitepress/dist`. Use these, **never** raw `vitepress` commands.
- `npm run generate` — regenerate the sidebar only (run after any docs tree change to check navigation).
- `npm run docs:preview` — preview the built site (no generate step).
- `npm test` — Node built-in test runner over `test/*.test.mjs` (12 tests). Run it after changing anything under `scripts/` or `docs/.vitepress/`.
- CI (`.github/workflows/deploy.yml`) deploys to GitHub Pages on push to `main`: Node 22, `npm ci`, `npm run docs:build`, `VITEPRESS_BASE` sets the base path.

## Contribution workflow

Same as the repo's own contribution guide (`docs/contributing/index.md`) — this is how the site is expected to change:

1. `git checkout main && git pull origin main`
2. `git checkout -b <branch>` — **all changes go on a separate branch**; do not commit to `main` directly
3. `npm install`, then `npm run docs:dev` (regenerates the sidebar automatically)
4. Edit `.md` files under `docs/`, preview, then commit
5. `git push origin <branch>` and open a PR against `main` describing: what changed, why, and any relevant context or issues addressed
6. After the PR is merged, CI builds and deploys to GitHub Pages automatically — no manual deploy step

## High-signal rules

- **Always go through the npm scripts.** A raw `vitepress build docs` (or `dev`) skips the generator: config.mjs then falls back to an *empty* sidebar with a warning.
- **Never hand-edit or commit `docs/.vitepress/sidebar.gen.json`** (nor `docs/.vitepress/cache/`) — gitignored build artifacts.
- **Adding a page** = create `docs/<section>/name.md`; it shows up in the sidebar on the next generate. `index.md` at *any* depth is the parent directory's landing page / section label and is never emitted as its own sidebar item.
- **Frontmatter**: `title` overrides the sidebar label; `order` (must be an integer) pins position. Ordering: `order` ascending → unordered after ordered → directories before loose files → alphabetical. Directories sort by bare name, files by route.
- **humanize() quirk**: every word is Title Cased with the rest lowercased, so `API.md` → `Api` (not "API") and `getting-started` → `Getting Started`. Use an explicit frontmatter `title` when exact casing matters.
- **Routes are extensionless**: `docs/guides/deploy.md` → `/guides/deploy`; `docs/guides/index.md` → `/guides/` (trailing slash). Link between pages with extensionless routes.
- **Malformed frontmatter YAML degrades gracefully** (title/order become `undefined`, no crash) — tests pin this behavior; don't "fix" it.
- **Tests import helpers from `docs/.vitepress/config.mjs`** (`normalizeBase`, `loadSidebar`) as well as the script — keep those named exports when refactoring the config.
- README and CI require **Node 22** even though `package.json` `engines` says `>=18`.
- `.superpowers/` holds historical dev plans/specs from this project's own development — not part of the site; ignore it.