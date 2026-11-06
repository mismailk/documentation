# AGENTS.md

Instructions for coding agents working in this repository (Claude Code, opencode and others).

Current status, the next step, decisions and known issues are in [.superpowers/PROGRESS.md](.superpowers/PROGRESS.md).

VitePress 1.6 docs site where the `docs/` filesystem is the single source of truth for the sidebar. `scripts/generate-sidebar.mjs` scans `docs/` recursively and writes `docs/.vitepress/sidebar.gen.json`; `docs/.vitepress/config.mjs` loads that JSON as `themeConfig.sidebar`. There is no hand-maintained navigation config.

## Commands

- `npm run docs:dev` / `npm run docs:build` — regenerate the sidebar, then start the dev server / build to `docs/.vitepress/dist`. Use these, **never** raw `vitepress` commands.
- `npm run generate` — regenerate the sidebar only (run after any docs tree change to check navigation).
- `npm run docs:preview` — preview the built site (no generate step).
- `npm test` — Node built-in test runner over `test/*.test.mjs` (37 tests). Run it after changing anything under `scripts/` or `docs/.vitepress/`.
- CI (`.github/workflows/deploy.yml`) deploys to GitHub Pages on push to `main`: Node 22, `npm ci`, `npm run docs:build`, `VITEPRESS_BASE` sets the base path.

## Contribution workflow

Same as the repo's own contribution guide (`docs/contributing/index.md`) — this is how the site is expected to change:

1. `git checkout main && git pull origin main`
2. `git checkout -b <branch>` — **all changes go on a separate branch**; do not commit to `main` directly
3. `npm install`, then `npm run docs:dev` (regenerates the sidebar automatically)
4. Edit `.md` files under `docs/`, preview, then commit
5. `git push origin <branch>` and open a PR against `main` describing: what changed, why, and any relevant context or issues addressed
6. After the PR is merged, CI builds and deploys to GitHub Pages automatically — no manual deploy step

A change is done only when `npm test` and `npm run docs:build` both pass (VitePress fails the build on dead links).

## Agent workflow

When agents make a change, it goes through these stages. Every stage has one fixed owner:

| Stage | Owner |
| --- | --- |
| Spec and plan | **Claude Code** |
| Implementation | **opencode** |
| Verification and validation | **Claude Code** |

1. **Brainstorm or spec** (Claude Code, only for new behaviour or a new guide). Specs go in `.superpowers/specs/YYYY-MM-DD-<topic>-design.md`.
2. **Plan** (Claude Code). Plans go in `.superpowers/plans/YYYY-MM-DD-<topic>.md`, have **at most 4 tasks**, and include exact files, content, commands and expected output. Each task ends with something that can be checked on its own; bigger work is split into several plans. The user reviews each plan before implementation starts.
3. **Implement** (opencode). When the user says "start implementation", the reviewed plan goes straight to opencode. opencode works on the plan's branch (for example `docs/<topic>`), task by task and test-first where code changes, with one commit per task. It runs every check the plan lists and stops to report anything that fails, rather than working around it. It never writes or changes specs or plans.
4. **Verify and validate** (Claude Code). Claude Code doesn't rely on opencode's report. It reruns every check, reviews the diff against the plan, and previews changed pages with `npm run docs:dev` (sidebar label and position, links, light and dark mode). Failures are reported as they are, and a test is never weakened to make it pass.
5. **Review and PR** (Claude Code) against the plan, before the work counts as done. The branch is pushed and the PR opened (step 5 of the contribution workflow) only when the user asks.

Specs and plans live in `.superpowers/`, never under `docs/`: everything under `docs/` is published to the site.

## Conventions

- **Commits:** Conventional Commits, for example `docs: …`, `fix: …`, `feat: …`, `test: …`, `docs(plan): …`.
- **Git:** never push, force-push or touch `main` without the user's explicit request.

## High-signal rules

- **Always go through the npm scripts.** A raw `vitepress build docs` (or `dev`) skips the generator: config.mjs then falls back to an *empty* sidebar with a warning.
- **Never hand-edit or commit `docs/.vitepress/sidebar.gen.json`** (nor `docs/.vitepress/cache/`) — gitignored build artifacts.
- **Adding a page** = create `docs/<section>/name.md`; it shows up in the sidebar on the next generate. `index.md` at *any* depth is the parent directory's landing page / section label and is never emitted as its own sidebar item.
- **Frontmatter**: `title` overrides the sidebar label; `order` (must be an integer) pins position. Ordering: `order` ascending → unordered after ordered → directories before loose files → alphabetical. Directories sort by bare name, files by route.
- **humanize() quirk**: every word is Title Cased with the rest lowercased, so `API.md` → `Api` (not "API") and `getting-started` → `Getting Started`. Use an explicit frontmatter `title` when exact casing matters.
- **Routes are extensionless**: `docs/guides/deploy.md` → `/guides/deploy`; `docs/guides/index.md` → `/guides/` (trailing slash). Link between pages with extensionless routes.
- **Malformed frontmatter YAML degrades gracefully** (title/order become `undefined`, no crash) — tests pin this behavior; don't "fix" it.
- **Tests import helpers from `docs/.vitepress/config.mjs`** (`normalizeBase`, `loadSidebar`) as well as the script — keep those named exports when refactoring the config.
- **Agent markers (Deploy Pipeline guide).** `::: step level=<run|ask|never> where=<laptop|server|github> verify="…"` wraps each runnable command block, and `::: agent` holds agent-only text. Both render nothing on the site. `npm run docs:build` writes agent copies to `dist/agent/<path>.md`. Never put a `::: step` inside `::: v-pre`: wrap the v-pre block from outside with `:::: step` … `::::` instead. `test/guide-markers.test.mjs` fails on any unmarked `bash`/`sh` block in the guide; file excerpts go in its `REFERENCE_BLOCKS`. To prove the human pages didn't change, build `main` in a temporary worktree and run `node scripts/compare-doc-html.mjs <main dist> <branch dist>`. Only the guide's `index.html` may differ (the copy-link button).
- README and CI require **Node 22** even though `package.json` `engines` says `>=18`.
- `.superpowers/` holds the specs and plans of the agent workflow (above) — not part of the site. The 2026-09-27 files there are historical; don't act on them.