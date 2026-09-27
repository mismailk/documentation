# Documentation Pages

A VitePress documentation site where **the `docs/` filesystem is the single
source of truth for the sidebar** — you add, rename, or remove Markdown
files and directories, and the navigation updates automatically. No
hand-maintained `sidebar` configuration.

## How the sidebar works

1. `npm run generate` scans `docs/` recursively (`scripts/generate-sidebar.mjs`).
2. Directories become sidebar groups; `.md` files become items. Titles come
   from frontmatter (`title`), otherwise a humanized name. Optional
   frontmatter `order` controls ordering (then directories-first, then
   alphabetical).
3. The result is written to `docs/.vitepress/sidebar.gen.json` (gitignored,
   a build artifact).
4. `docs/.vitepress/config.mjs` reads that JSON at build time and uses it as
   the `themeConfig.sidebar`.

`docs:dev` and `docs:build` regenerate the sidebar automatically before
starting.

## Prerequisites

- Node 22 (VitePress 1.6 requires Node ≥ 18)
- npm

## Commands

```bash
npm install          # install dependencies
npm run docs:dev     # generate sidebar, then start the dev server
npm run docs:build   # generate sidebar, then build to docs/.vitepress/dist
npm run docs:preview # preview the built site locally
npm run generate     # regenerate the sidebar only
npm run test         # run the generator unit tests
```

## Deploying to GitHub Pages

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and
publishes the site on every push to `main`.

One-time setup:

1. Push this repository to GitHub (default branch `main`).
2. Repository **Settings → Pages → Build and deployment → Source**:
   select **GitHub Actions**.

The `base` path is set from the CI env var (`VITEPRESS_BASE`) so a
project page (`https://<user>.github.io/<repo>/`) works out of the box.