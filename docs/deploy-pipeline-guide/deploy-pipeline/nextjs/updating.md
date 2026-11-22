---
title: Updating a Deployed App
order: 8
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

::: step level=run where=laptop verify="next is 16.2.10 or a version the developer has tested"
```bash
npm ls next
```
:::

::: step level=run where=laptop verify="prints nothing"
```bash
grep -rn NEXT_MANUAL_SIG_HANDLE . --exclude-dir=node_modules --exclude-dir=.next
```
:::

The first prints the Next.js version; it must be 16.2.10 or a version you
have tested. The second must print nothing: with `NEXT_MANUAL_SIG_HANDLE`
set, the server leaves the stop signal to the app.

**Update:**

For Next.js 16.2.10, or a version you have tested, the image needs no change.
To test an older version, run the image locally and send a request to a route
that takes longer than the stop, then stop the container:

::: step level=run where=laptop verify="status 200 and curl exit 0"
```bash
curl -sS -o /dev/null -w 'status %{http_code} in %{time_total}s\n' http://127.0.0.1:3000/<slow-route> &
docker stop <container>
wait $!; echo "curl exit $?"
```
:::

The stop waits up to 10 s. A `200` and `curl exit 0` mean the request
finished; anything else means it was cut off. If it was, upgrade Next.js
before switching zero-downtime deploys on.

Then switch it on: [Zero-Downtime Deploys](../zero-downtime).
