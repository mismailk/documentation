---
title: Updating a Deployed App
order: 6
---
# Updating a Deployed App

This page is for an app that is already deployed with this guide: its repo
holds this pipeline's `.github/workflows/deploy.yml`, and the server serves
it. Updates are listed newest first. Apply each one the app does not have
yet, in order from the oldest missing one.

Never redo the first-deploy steps for an update: server setup, CI keys, the
conf and go-live are done once. The pipeline gained a feature; the app keeps
the setup it already has.

## Database migrations (2026-11-17) {#migrations}

**Needed only** when a release has data migrations. An app that never runs
one skips this update.

**Check**, in the app repo:

::: step level=run where=laptop verify="prints present when the app has the update; no output when it needs it"
```bash
test -f .github/workflows/migrate.yml && grep -q 'name: Migration gate' .github/workflows/deploy.yml && echo present
```
:::

`present` means the app has it. No output means it doesn't.

**Update:**

::: v-pre
1. Update the server's `deploy.sh` first:
   [Update the server first](./database-migrations#update-server).
2. Re-copy `templates/node-api/deploy.yml` from the new Express kit and fill
   it with the same values the current workflow uses (app name, image,
   branch names). Copy `templates/node-api/migrate.yml` to
   `.github/workflows/migrate.yml` and fill `{{APP_NAME}}`.
3. Push to staging with `RUN_MIGRATION` unset. The deploy job must stay
   green, with the migration steps skipped.
4. Then follow [Database Migrations](./database-migrations).
:::

## pm2 cluster mode (2026-11-08) {#cluster-mode}

**Needed by every app** whose `Dockerfile` predates cluster mode: the image
starts the app directly (for example `CMD ["node", "dist/server.js"]`) instead
of under `pm2-runtime`.

**Check**, in the app repo:

::: step level=run where=laptop verify="prints present when the app has the update; no output when it needs it"
```bash
grep -q 'pm2-runtime' Dockerfile && echo present
```
:::

`present` means the app has it. No output means it doesn't.

**Update:**

1. Re-copy the `Dockerfile` template, and fill it with `START_SCRIPT` (the
   entry file, e.g. `dist/server.js`, replacing the old start command) and
   `INSTANCES` = `1`.
2. Test the image locally:
   [Test the image locally before pushing](./prepare-your-app#test-image-locally).
3. Push to staging.
4. Check the memory after the first deploy. Read
   [Running more than one worker](./app-readiness#multiple-workers) before
   ever raising `INSTANCES`.
