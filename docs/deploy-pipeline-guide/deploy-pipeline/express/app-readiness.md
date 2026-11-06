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
| 4 | You know the start command (for example `node dist/server.js`) | it becomes the container's `CMD` | `npm pkg get main scripts.start`, or `pm2 show <name>` today |
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

## ✅ Checkpoint {#checkpoint}

- Every item in the checklist above holds for your app, or you've changed the app so it does.
- A clean install and build passes from a fresh clone: `npm ci && npm run build`.
- You've written down: the start command, the Node version, the port, and the list of non-`dist/` files the app reads at runtime.
