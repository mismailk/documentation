---
title: Prepare Your App
order: 3
---
# Prepare Your App

Everything in this step happens in your app repo and on your laptop. Nothing
touches the server yet.

## Pick your values {#pick-your-values}

::: v-pre
| Placeholder | What it is | How to choose it |
|---|---|---|
| `{{APP_NAME}}` | the app name the server knows | short, lowercase, e.g. `orders-api` |
| `{{IMAGE}}` | image repository | `ghcr.io/<org>/<repo>`, **lowercase**; the conf's `IMAGE` on the server is the same |
| `{{STAGING_BRANCH}}` | branch for staging | any branch name, e.g. `staging` or `develop` (see the note below the table) |
| `{{PRODUCTION_BRANCH}}` | branch for production | any branch name, e.g. `main` or `master`; must differ from the staging branch |
| `{{NODE_VERSION}}` | Node version for the image | `engines.node`, e.g. `22.12.0` |
| `{{BUILD_COMMAND}}` | compile step | `npm run build` |
| `{{START_SCRIPT}}` | entry file, relative to `/app`, run by pm2 | `dist/server.js`; pm2 cluster mode needs a script, so `npm start` is not supported |
| `{{INSTANCES}}` | pm2 cluster workers in the one container | start at `1`; before raising it, read [Running more than one worker](./app-readiness#multiple-workers) |
| `{{RUNTIME_COPY_LINES}}` | extra runtime paths ([checklist](./app-readiness) item 7) | one line per path, see below |
| `{{EXTRA_IGNORES}}` | extra paths to keep out of the build | large or irrelevant top-level folders, one per line |
:::

The server-side values (port, `.env` path, memory cap, …) are picked in the
shared [Add an App to the Server](../add-an-app#pick-your-values).

::: warning Branch names
The two branch names must differ, must not contain `'`, `,`, `{` or `}`, and
must not start with `!`. Those characters break the rendered YAML, and a
leading `!` turns the trigger into a negation pattern. The workflow's tag step
fails if both branches are the same.
:::

::: v-pre
**Existing apps.** Re-copy the `Dockerfile` template and refill it: the
container now runs `pm2-runtime start dist/server.js -i 1`, pm2 is installed in
the runtime stage, and `{{INSTANCES}}` starts at `1`. Rebuild the image, and
re-check `MEMORY` after the first deploy.
:::

::: v-pre
`{{RUNTIME_COPY_LINES}}` example, for an app that reads `views/` and
`config/*.yaml` at runtime:
:::

```dockerfile
COPY --from=build --chown=node:node /app/views ./views
COPY --from=build --chown=node:node /app/config ./config
```

Leave it empty if the app only needs `dist/`.

## Fill the templates into your repo {#fill-templates}

::: v-pre
The templates are in the kit's `templates/node-api/` folder. For each one, copy
it to the path below, replace every `{{NAME}}`, and delete the
`# --- placeholders` … `# ---` header block. The `${{ ... }}` expressions in
the workflow are GitHub syntax, not placeholders, so leave them as they are.
:::

| Template | Goes to (in your app repo) |
|---|---|
| `Dockerfile` | `Dockerfile` |
| `dockerignore` | `.dockerignore` |
| `deploy.yml` | `.github/workflows/deploy.yml` |

Two template defaults to review:

- **`npm ci --legacy-peer-deps`.** The first app needed this for a peer
  conflict in its lockfile. If plain `npm ci` works for your app, remove the
  flag from both stages.
- **`node:<version>-alpine`.** If a native dependency fails to build on
  Alpine, change both `FROM` lines to `node:<version>-bookworm-slim`.

If you have no `build` script yet, add one, and declare any package you
import but haven't listed ([checklist](./app-readiness) items 3 and 6):

::: step level=run where=laptop
```bash
npm pkg set scripts.build=tsc
```
:::

## Test the image locally before pushing {#test-image-locally}

::: agent
Create `.env.local-test` yourself, with throwaway values that point at local services. Never copy values from a real `.env`. The `docker run` blocks the terminal, so run it in the background and stop it after the curl check.
:::

Build it:

::: step level=run where=laptop verify="the image builds"
```bash
docker build -t <app>:local .
```
:::

Run it the way the server will. Use a throwaway `.env` that points at local
services, and a free port. Don't use your real secrets:

::: step level=run where=laptop verify="the app starts; the curl check below answers"
```bash
docker run --rm --init --network host -v "$PWD/.env.local-test:/app/.env:ro" <app>:local
```
:::

In another terminal, any HTTP answer means the app is up:

::: step level=run where=laptop verify="any HTTP code, not 000"
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:<PORT>/
```
:::

::: v-pre
An `ENOENT` crash means a runtime file is missing. Add it to
`{{RUNTIME_COPY_LINES}}`.
:::

## What goes in the server `.env` {#server-env}

You create the `.env` on the server in the shared step
[Add an App to the Server](../add-an-app#env-file), which
also covers its owner, mode and the key check. Work out its contents now:

- **`PORT`**, equal to the conf's `PORT`. The app must read it
  ([checklist](./app-readiness) item 1).
- **Every value the app reads** from `process.env`, with its value for this
  environment. If the app runs on the server today, start from the `.env`
  it reads now.
- **Service addresses as the server host sees them.** The container shares
  the host's network, so `localhost:27017` is the host's Mongo
  ([checklist](./app-readiness) item 9).

Format: `KEY=value` and `KEY = value` both work, because the app's own
dotenv reads the file.

If the app runs under pm2 today, also check for
[values set outside `.env` files](../add-an-app#values-outside-env).

## ✅ Checkpoint {#checkpoint}

::: v-pre
- `Dockerfile`, `.dockerignore` and `.github/workflows/deploy.yml` exist, and none contains `{{` (`grep -rn '{{[A-Z_]*}}' Dockerfile .dockerignore .github/` prints nothing).
- The image builds locally, boots with `--network host` and a test `.env`, and answers HTTP on its port.
:::

- You have the list of keys for each environment's server `.env`, with `PORT` first.

Next: [Server Setup](../server-setup) (skip it if the server
already runs the pipeline), then
[Add an App to the Server](../add-an-app).
