---
title: Go-Live
order: 4
---
# Go-Live

Follow the shared [First Deploy and Go-Live](../go-live).
This page lists what to add for a Next.js app at each point.

## Before you push {#before-push}

- If the app has public values, check that `PUBLIC_ENV_STAGING` holds them
  ([Public build values on GitHub](./prepare-your-app#public-env-variables)).
  The image you are about to build bakes those values in.
- Commit `Dockerfile`, `.dockerignore`, `.github/workflows/deploy.yml`, the
  `next.config` change and `public/` (if you added it).

## In the first build {#first-build}

At [Push with deploys disabled](../go-live#push-disabled),
also check that the **build** job's "Public build values" step passes. If
it fails, a line of `PUBLIC_ENV_STAGING` breaks the rules
([troubleshooting](./troubleshooting#public-values)).

## Next.js checks after the manual deploy {#nextjs-checks}

At [Check it](../go-live#check-it), also check these.

The startup log shows the server listening on the conf's `PORT`, not 3000:

::: step level=ask where=server verify="listening on the conf's PORT, not 3000"
```bash
docker logs --tail 100 <app>-staging
```
:::

If the app has public values, one of the staging values is baked in (use
your own value):

::: step level=ask where=server verify="lists at least one file"
```bash
docker exec <app>-staging grep -rl 'staging-api.example.com' /app/.next
```
:::

Then, in a browser, through Nginx and the app's public URL:

- Pages render, with styles and scripts. In the browser's developer tools,
  no request to `/_next/static/...` fails.
- Pages that read server values (API calls, server actions) work.
- Pages that read files at runtime work (no `ENOENT` in `docker logs`).
- Images that go through `next/image` load.

If something fails, look it up in [Troubleshooting](./troubleshooting).

## Production {#production}

At the shared [Production](../go-live#production) steps:

- Before merging to your production branch, check that
  `PUBLIC_ENV_PRODUCTION` holds the production public values. If it is
  empty, the production image is built without any.
- In the checks, grep for a production public value instead of the staging
  one.

## ✅ Checkpoint {#checkpoint}

The shared checkpoint, plus:

- The build job's "Public build values" step passed.
- The server listens on the conf's `PORT`, and a staging public value is found under `/app/.next` in the container (if the app has public values).
- In a browser: pages, static files, server values and images work.
- Production (when you get there): the same, with `PUBLIC_ENV_PRODUCTION` and a production public value.
