---
title: Deployment
---
# Deployment

The site deploys to GitHub Pages automatically via a GitHub Actions workflow (`.github/workflows/deploy.yml`). A push to `main` triggers:

1. `actions/checkout` → Node 22 + npm cache
2. `npm ci`
3. `npm run docs:build` — regenerates the sidebar, then builds
4. `actions/upload-pages-artifact` uploads `docs/.vitepress/dist`
5. `actions/deploy-pages` publishes it

## Base path

Project pages live under a sub-path, so the workflow sets the base URL from the repository name:

```yaml
env:
  VITEPRESS_BASE: /${{ github.event.repository.name }}/
```

`docs/.vitepress/config.mjs` reads `VITEPRESS_BASE` (normalized; defaults to `/` locally), so the same build works on your machine and at `https://<user>.github.io/<repo>/`.

## One-time setup

1. Push this repository to GitHub with default branch `main`.
2. Repository **Settings → Pages → Build and deployment → Source**: select **GitHub Actions**.

After that, every push to `main` builds and deploys — no manual deployment steps.