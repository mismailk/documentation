---
title: How to Contribute
---
# How to Contribute

Thank you for contributing to the documentation! This page is the documentation's own contribution guide — the site documents itself.

Contributing is a filesystem operation: you add, edit, rename, or remove Markdown files under `docs/`, and the sidebar follows. There is no config to maintain and no build step to run manually while developing.

Start here:

- [Writing Documentation](./writing-docs) — add, edit, reorder, and delete pages
- [Commands](/reference/commands) — the npm scripts you will use
- [Deployment](/reference/deployment) — how the site ships to GitHub Pages

## Quick workflow

1. Install dependencies: `npm install`
2. Start the dev server: `npm run docs:dev` (it regenerates the sidebar automatically)
3. Write or edit `.md` files under `docs/`
4. Preview your changes, then commit — CI builds and deploys on every push to `main`