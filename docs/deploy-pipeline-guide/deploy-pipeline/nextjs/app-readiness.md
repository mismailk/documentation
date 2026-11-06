---
title: Is Your App Ready?
order: 2
---
# Is Your App Ready?

Go through this checklist before touching the server. Each item is something
the container setup depends on. Run the checks from the root of your app
repo.

## Checklist {#checklist}

| # | Requirement | Why | How to check |
|---|---|---|---|
| 1 | The app runs on the Next.js Node server (App Router or Pages Router, started with `next start`), not a static export (`output: 'export'`) and not a custom server file | the container runs the standalone `server.js` that `next build` writes | `grep -n output next.config.*` and `npm pkg get scripts.start` |
| 2 | `next.config` sets `output: "standalone"` (you can add it in [Prepare Your App](./prepare-your-app#standalone-output)) | the image copies only `.next/standalone`, `.next/static` and `public/` | after a build, `ls .next/standalone/server.js` |
| 3 | You have a list of every `NEXT_PUBLIC_*` value, for staging and for production, and **none of them is a secret** | they are baked into the browser JavaScript at build time and come from the `PUBLIC_ENV_STAGING` / `PUBLIC_ENV_PRODUCTION` repository variables ([public build values](./prepare-your-app#public-build-values)); anyone can read them | `grep -rhoE 'NEXT_PUBLIC_[A-Z0-9_]+' --exclude-dir=node_modules --exclude-dir=.next . \| sort -u` |
| 4 | Server values (API keys, backend URLs, …) are read from `process.env` **at request time**, in code that runs per request (route handlers, dynamic pages, server actions) | the server's `.env` exists only in the running container. Pages that are pre-rendered during the build, and everything `next.config` reads from `process.env` (`rewrites`, `env`, `images`), get the build's values, and the build has no server `.env` | `npm run build` prints each route as static (○) or dynamic (ƒ); `grep -n process.env next.config.*` |
| 5 | No value the app needs is kept in a committed `.env*` file | `.dockerignore` keeps every `.env*` file out of the image. Public values go in the repository variables; server values go in the server's `.env` | `git ls-files '.env*'` |
| 6 | Files the app reads from disk at runtime (content, JSON data, templates, fonts read with `fs`) are found by the build's file tracer, or listed in `outputFileTracingIncludes` in `next.config` | `.next/standalone` holds only the files the tracer finds; a file read through a computed path is missed | after a build, look for each file under `.next/standalone/` |
| 7 | A `public/` folder exists (an empty one with a `.gitkeep` file is fine) | the Dockerfile copies `public/`, and the image build fails if it is missing | `ls -d public` |
| 8 | The app doesn't need to keep files on local disk between deploys (uploads, generated files) | the container is replaced on every deploy, so its disk is thrown away. That includes Next's own cache (`.next/cache`: optimised images, regenerated pages), which simply starts empty | uploads should go to S3 or a similar store |
| 9 | Services the app talks to (its API backend, databases, …) are reachable from the server **host** at the address in `.env` | the container shares the host's network, so `localhost:4000` means port 4000 on the host | — |
| 10 | `package.json` has `engines.node` with an exact version | both image stages use that Node version (`node:<version>-alpine`) | `npm pkg get engines` |
| 11 | The app uses **npm**: `package-lock.json` is committed, there is no `pnpm-lock.yaml`, `yarn.lock` or `bun.lockb`, and every package the code imports is declared in `package.json` | the image installs exactly what `package-lock.json` lists (`npm ci`) | `ls package-lock.json pnpm-lock.yaml yarn.lock bun.lockb`, then a clean `npm ci && npm run build` |
| 12 | The app fits in its memory cap (the default is `384m`) | `deploy.sh` runs the container with that limit and no extra swap; above it, the app is killed | `docker stats` during [the local test](./prepare-your-app#test-image-locally); a mid-size app idles around 115 MiB |
| 13 | The app doesn't rely on `NODE_ENV` to tell staging from production | the image sets `NODE_ENV=production` for **every** environment, and the server's `.env` can't override it; use another variable such as `APP_ENV` | `grep -rn NODE_ENV --exclude-dir=node_modules --exclude-dir=.next .` |
| 14 | The app doesn't log secrets while it boots | a failed deploy prints the last 50 log lines into the GitHub Actions log | read your startup logging |

::: warning Undeclared dependencies
Item 11 has a known trap: an app can import a package that is only installed
because another dependency pulls it in. It works on your laptop until that
dependency drops it. Declare everything you import.
:::

::: tip Moving from pnpm or yarn
Delete the other lockfile, run `npm install` to create `package-lock.json`,
and commit it. Then check that `npm ci && npm run build` and your tests still
pass.
:::

## ✅ Checkpoint {#checkpoint}

- Every item in the checklist above holds for your app, or you've changed the app so it does (items 2 and 7 can wait for [Prepare Your App](./prepare-your-app#standalone-output)).
- A clean install and build passes from a fresh clone: `npm ci && npm run build`.
- You've written down: the Node version, the port the app uses today, the `NEXT_PUBLIC_*` names and their staging and production values, the server values the app needs, and any runtime files the tracer must include.
