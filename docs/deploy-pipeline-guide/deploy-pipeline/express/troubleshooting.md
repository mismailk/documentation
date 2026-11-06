---
title: Troubleshooting (Express)
order: 4
---
# Troubleshooting (Express)

For `deploy.sh` messages and exit codes (CI login, whitelist, conf, pull,
port clashes, memory), see the shared
[Troubleshooting](../troubleshooting). This page covers
problems specific to an Express app. Most show as exit **1**,
`verify failed`, with the cause in the 50 log lines CI prints.

::: v-pre
| Symptom | Likely cause | Fix |
|---|---|---|
| `ENOENT` in the logs | a file the app reads at runtime (views, templates, YAML, JSON) isn't in the image; only `dist/` is copied automatically | add it to `{{RUNTIME_COPY_LINES}}` ([Pick your values](./prepare-your-app#pick-your-values)) |
| `Cannot find module ...` | a package is imported but not declared in `package.json`, so `npm ci` didn't install it | declare it ([checklist](./app-readiness) item 6), commit the lockfile, and push |
| `Error: Cannot find module '/app/dist/...'` | `{{START_COMMAND}}` doesn't match where the build writes the entry file | check `npm run build` output and fix the `CMD` |
| `ECONNREFUSED` to a database or other service | the address in `.env` isn't reachable from the server **host** (the container shares the host's network) | use the address the host reaches it on, e.g. `localhost:27017` for a Mongo on the host ([checklist](./app-readiness) item 9) |
| no HTTP answer, the logs show the app listening on another port or the default | the app doesn't read `PORT` from the `.env`, or binds only to a host other than all interfaces | `app.listen(process.env.PORT)` with no host ([checklist](./app-readiness) item 1) |
| a native module fails to load (`Error loading shared library`, `invalid ELF header`) | the dependency doesn't build or load on Alpine | change both `FROM` lines to `node:<version>-bookworm-slim` ([Fill the templates](./prepare-your-app#fill-templates)) |
| staging behaves like production | the app tells environments apart by `NODE_ENV`, which is `production` in every image | use another variable such as `APP_ENV` ([checklist](./app-readiness) item 11) |
:::

To look inside a failed container, see
[Inspect a failed container](../troubleshooting#inspect).
