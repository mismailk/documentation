---
title: Commands
---
# Commands

All commands run from the repository root with npm.

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node 22 recommended; see `engines`). |
| `npm run docs:dev` | Generate the sidebar, then start the VitePress dev server. |
| `npm run docs:build` | Generate the sidebar, then build the site to `docs/.vitepress/dist`. |
| `npm run docs:preview` | Serve the built site from `docs/.vitepress/dist` locally. |
| `npm run generate` | Regenerate `docs/.vitepress/sidebar.gen.json` from `docs/` only. |
| `npm run test` | Run the generator's unit tests (`node --test`). |

`docs:dev` and `docs:build` both run the generator first, so the sidebar is always up to date. The generated file `docs/.vitepress/sidebar.gen.json` is a gitignored build artifact — never edit it by hand.