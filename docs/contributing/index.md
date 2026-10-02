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

1. Clone the repository (if not already cloned): `git clone <repository-url>`
2. Pull the latest changes from main: `git checkout main && git pull origin main`
3. Create a new branch: `git checkout -b your-branch-name`
4. Install dependencies: `npm install`
5. Start the dev server: `npm run docs:dev` (it regenerates the sidebar automatically)
6. Write or edit `.md` files under `docs/`
7. Preview your changes, then commit your changes
8. Push your branch: `git push origin your-branch-name`
9. Create a pull request to `main` on GitHub with a clear description documenting:
   - What changes were made
   - Why the changes were made
   - Any relevant context or issues addressed

**Tips for PRs:** Consider using Claude Code or a similar AI agent to help generate a well-structured PR description that clearly documents your changes. This helps reviewers understand the intent and scope of your contribution.

**Note:** All changes should be made on a separate branch. Once your PR is reviewed and merged, CI will automatically build and deploy the changes to GitHub Pages.