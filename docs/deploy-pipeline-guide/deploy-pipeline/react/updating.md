---
title: Updating a Deployed App
order: 7
---
# Updating a Deployed App

This page is for an app that is already deployed with this guide: its repo
holds this pipeline's `.github/workflows/deploy.yml`, and the server serves
it. Updates are listed newest first. Apply each one the app does not have
yet, in order from the oldest missing one.

Never redo the first-deploy steps for an update: server setup, CI keys, the
conf and go-live are done once. The pipeline gained a feature; the app keeps
the setup it already has.

## Zero-downtime deploys (2026-11-21) {#zero-downtime}

**Needed only** if users see errors during deploys and you want to remove
the gap. Otherwise skip this update.

**Check**, in the app repo:

::: step level=run where=laptop verify="prints present when the entrypoint is new enough; no output when it needs the update"
```bash
grep -q 'PORT from the environment' docker-entrypoint.sh && echo present
```
:::

`present` means the entrypoint is new enough. No output means it isn't.

**Update:**

1. Re-copy `templates/react/docker-entrypoint.sh` from the new React kit over
   the app's `docker-entrypoint.sh`.
2. Test the image locally:
   [Test the image locally before pushing](./prepare-your-app#test-image-locally).
3. Push to staging.
4. Then switch it on: [Zero-Downtime Deploys](../zero-downtime).
