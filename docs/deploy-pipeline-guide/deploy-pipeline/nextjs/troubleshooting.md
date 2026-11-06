---
title: Troubleshooting (Next.js)
order: 6
---
# Troubleshooting (Next.js)

For `deploy.sh` messages and exit codes (CI login, whitelist, conf, pull,
port clashes, memory), see the shared
[Troubleshooting](../troubleshooting). This page covers
problems specific to Next.js and its public build values. To look inside a
failed container, see [Inspect a failed container](../troubleshooting#inspect).

## Next.js app problems {#nextjs-problems}

| Symptom | Likely cause | Fix |
|---|---|---|
| exit **1**, `no HTTP answer on port 4100 within 30s`, and the logs show the server started on port 3000 | the server's `.env` has no `PORT`, so Next uses its default | add `PORT=` with the conf's port to the `.env` ([What goes in the server `.env`](./prepare-your-app#server-env)) and deploy again |
| `no HTTP answer`, the logs show the right port but a host name or address other than `0.0.0.0` | `HOSTNAME=0.0.0.0` was removed from the Dockerfile's `ENV` line. Docker sets `HOSTNAME` in every container to the machine name (with host networking, the server's host name), and an `ENV HOSTNAME` in the image replaces that. Without it, `server.js` binds to the machine name's address only. `node --env-file` never overrides a variable that is already set, so `HOSTNAME` in the `.env` can't fix it | put `ENV NODE_ENV=production HOSTNAME=0.0.0.0` back ([Fill the templates](./prepare-your-app#fill-templates)) |
| the app listens on 3000 even though the `.env` has `PORT` | the `CMD` was changed and no longer starts `node --env-file=/app/.env server.js`; `server.js` reads `PORT` before Next loads any `.env` | restore the template's `CMD` |
| pages load without styles or scripts; requests to `/_next/static/...` return 404 | the Dockerfile's `COPY` of `.next/static` was removed or changed, or Nginx serves `/_next/static` from a folder on disk (left over from the old setup) | restore the template's three `COPY` lines; let Nginx proxy every path, including `/_next/`, to the container. Check with the asset `curl` from [the local test](./prepare-your-app#test-image-locally) |
| `/_next/static` 404s only in a browser tab opened before a deploy | that tab still asks for the previous build's files, which the new image doesn't have | reload the page |
| files in `public/` return 404 | the file isn't committed, or it is excluded by `.dockerignore` (`EXTRA_IGNORES`) | check `git ls-files public` and the `.dockerignore` |
| a page returns 500 and the logs show `ENOENT` for a file the app reads | that file isn't in `.next/standalone`: the build's tracer couldn't see it | add it to `outputFileTracingIncludes` ([Standalone output](./prepare-your-app#standalone-output)), rebuild, and check with `docker run --rm --entrypoint ls <IMAGE>:staging-<sha7> /app/...` |
| `Cannot find module ...` at start or on a page | a package is imported but not declared, or only loaded through a path the tracer can't follow | declare it in `package.json` ([checklist](./app-readiness#checklist) item 11); if it is declared, add its folder under `node_modules` to `outputFileTracingIncludes` |
| errors that mention `sharp` (image optimisation fails, `next/image` URLs return 500) | `next/image` needs `sharp` in the standalone server and it isn't installed, or its native binary doesn't load on Alpine | `npm install sharp` and commit the lockfile; if it still fails to load, switch both `FROM` lines to `node:<version>-bookworm-slim` ([Fill the templates](./prepare-your-app#fill-templates)) |
| server values are `undefined`, or a page shows the build's value instead of the server's | the value is read in `next.config` or in a page pre-rendered at build time, where the server `.env` doesn't exist | read it at request time ([checklist](./app-readiness#checklist) item 4) |
| staging behaves like production | the app tells environments apart by `NODE_ENV`, which is `production` in every image | use another variable such as `APP_ENV` ([checklist](./app-readiness#checklist) item 13) |

## Public build values {#public-values}

| Symptom | Likely cause | Fix |
|---|---|---|
| "Public build values" step fails with `PUBLIC_ENV_STAGING line 3 must be blank, a # comment or NEXT_PUBLIC_<NAME>=<value>` (or `PUBLIC_ENV_PRODUCTION`) | that line of the variable isn't a public value: `export` in front, a space before the name or before `=`, lowercase letters or `-` in the name, a name without `NEXT_PUBLIC_`, or a value split over two lines | fix that line. Line numbers count from 1, blank lines included. Every bad line gets its own error. The message never repeats the line, but the run log shows both variables in full in the step's `env:` block. Rules: [Public build values](./prepare-your-app#public-build-values) |
| a server value (key, token) is reported as a bad line | someone pasted a server value into the public variable | remove it. It never reached an image (the step stops before the build), but repository variables aren't masked: the value is in the step's `env:` block in the build log of every run since it was added. Delete those run logs (Actions → the run → ⋯ → Delete all logs) and rotate the secret |
| a public value is unchanged after editing the variable | no new build ran: the variable is read only when the build job runs | push a commit to that branch, an empty one if needed ([Change a public value](./everyday-use#change-public-value)) |
| still unchanged after a new build | the value was edited in a GitHub **environment** (`staging` / `production`), not in the **repository** variables, or in the other environment's variable | edit `PUBLIC_ENV_STAGING` / `PUBLIC_ENV_PRODUCTION` under Settings → Secrets and variables → Actions → Variables ([Public build values on GitHub](./prepare-your-app#public-env-variables)) |
| an old public value is back | a rollback, or a re-run of an older deploy job, deployed an image built with the old value | expected: a rollback restores that image's values ([What a rollback brings back](./everyday-use#rollback)) |
| the value was set in the server's `.env` and nothing changed | `NEXT_PUBLIC_*` values are fixed at build time; the server's `.env` can't change them | put it in the repository variable and push |
| part of a value is missing, or a `$` disappeared | Next.js expands `$NAME` and `${NAME}` in the value, to nothing if no such variable exists | write `\$` for a literal dollar sign |
| the end of a value is missing from a `#` on | an unquoted `#` anywhere in the value starts a comment | quote the value |

