---
title: Is Your App Ready?
order: 2
---
# Is Your App Ready?

Go through this checklist before touching the server. Each item is something
the container setup depends on.

| # | Requirement | Why | How to check |
|---|---|---|---|
| 1 | The app listens on the port from its `.env` (`PORT`), on all interfaces (`app.listen(port)` with no host, or `0.0.0.0`) | `deploy.sh` checks `http://127.0.0.1:<PORT>/` | `grep -rn "listen(" src` |
| 2 | Config comes from environment variables, loaded with `dotenv` from the working directory (`dotenv.config()`), or from real env vars | the server's `.env` is mounted at `/app/.env`, and `/app` is the working directory | `grep -rn dotenv src` |
| 3 | There is a `build` script that compiles to `dist/` (or your app needs no build) | the image is built from source with `npm run build` | `npm pkg get scripts.build` |
| 4 | You know the entry file pm2 runs (for example `dist/server.js`) | it becomes the container's `CMD`; pm2 cluster mode needs a script, not `npm start` | `npm pkg get main scripts.start`, or `pm2 show <name>` today |
| 5 | `package.json` has `engines.node` with an exact version | both image stages use that Node version | `npm pkg get engines` |
| 6 | Every package the code imports is declared in `package.json`, and the lockfile is committed | the image installs only what `package-lock.json` lists (`npm ci`) | a clean `npm ci && npm run build` passes |
| 7 | You know which **non-compiled files** the running app reads (views, templates, YAML, JSON, certs, static assets) | only `dist/` is copied into the image automatically, so anything else must be listed | `grep -rnE "readFileSync\|path\.join\|views\|static" src` |
| 8 | The app doesn't need to keep files on local disk between deploys (uploads, generated files) | the container is replaced on every deploy, so its disk is thrown away | uploads should go to S3 or a similar store |
| 9 | Services the app talks to (Mongo, Redis, …) are reachable from the server **host** at the address in `.env` | the container shares the host's network, so `localhost:27017` means the host's Mongo | — |
| 10 | The app doesn't log secrets while it boots | a failed deploy prints the last 50 log lines into the GitHub Actions log | read your startup logging |
| 11 | The app doesn't rely on `NODE_ENV` to tell staging from production | the image sets `NODE_ENV=production` for **every** environment, and dotenv won't override it; use another variable such as `APP_ENV` | `grep -rn NODE_ENV src` |
| 12 | Database changes are backward-compatible (expand/contract) | migrations are **not** run by the pipeline; rollback swaps code only, never the schema | — |

::: warning Undeclared dependencies
Item 6 has a known trap: an app can import a package that is only installed
because another dependency pulls it in. It works on your laptop until that
dependency drops it. Declare everything you import.
:::

## Running more than one worker {#multiple-workers}

::: v-pre
> **Warning.** Leave `{{INSTANCES}}` at `1` unless every row below is true for
> your app. Each row is **required when `INSTANCES` is more than 1**; at `1`
> none apply.
:::

::: v-pre
| Requirement | Why | How to check | Required when |
|---|---|---|---|
| Settings and caches held in memory are refreshed in every worker, not only the one that saved them | each worker has its own memory, so a value changed in one process is invisible to the others | read the settings handling in the code; see [Keeping in-memory settings in sync](#settings-in-sync) | `INSTANCES` > 1 |
| Scheduled jobs run once, not once per worker | every worker starts its own timer, so a cron job runs once per worker and duplicates its work | `grep -rnE "setInterval\|cron\|schedule" src` | `INSTANCES` > 1 |
| Sessions, rate limiters and other counters live in a shared store (Redis, the database) | an in-process counter is per worker, so limits and sessions leak or reset when requests switch workers | check where sessions and rate limits are stored | `INSTANCES` > 1 |
| Websocket or sticky-connection logic does not assume the same process | a client can be served by a different worker on its next request | check the websocket setup and any per-process state it keeps | `INSTANCES` > 1 |
| `{{MEMORY}}` in the server conf is raised to about `INSTANCES` times one process, plus pm2's own share | the cap covers the whole container, and each worker has its own heap | compare `docker stats` after the first deploy with the conf's `{{MEMORY}}` | `INSTANCES` > 1 |
:::

### Keeping in-memory settings in sync {#settings-in-sync}

A settings cache loaded at boot goes stale in the other workers the moment one
worker saves a change. Poll a cheap version marker and swap the whole map when
it changes. This needs no replica set, so it works on a single MongoDB:

```js
let settings = new Map();
let settingsVersion = "";

async function loadSettings() {
  const rows = await Settings.find({}, { key: 1, value: 1 }).lean();
  // Build a new Map and swap the reference: callers never see a half-filled map.
  settings = new Map(rows.map((row) => [row.key, row.value]));
}

async function refreshIfChanged() {
  const [latest] = await Settings.find({}, { updatedAt: 1 })
    .sort({ updatedAt: -1 })
    .limit(1)
    .lean();
  const updatedAt = latest ? new Date(latest.updatedAt).getTime() : 0;
  const version = `${updatedAt}:${await Settings.estimatedDocumentCount()}`;
  if (version === settingsVersion) return;
  await loadSettings();
  settingsVersion = version;
}

refreshIfChanged();
setInterval(refreshIfChanged, 10_000).unref();
```

A change saved in one worker reaches every worker within the 10 s interval.
The worker that saved should still call `refreshIfChanged()` right away, so
its own requests see the change at once. Direct edits to the database are
caught only if the collection sets `updatedAt`; if it doesn't, reload on a
plain 10–30 s interval instead of comparing the version.

## ✅ Checkpoint {#checkpoint}

- Every item in the checklist above holds for your app, or you've changed the app so it does.
- A clean install and build passes from a fresh clone: `npm ci && npm run build`.
- You've written down: the entry file, the Node version, the port, and the list of non-`dist/` files the app reads at runtime.
