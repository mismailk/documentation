---
title: Prepare Your App
order: 3
---
# Prepare Your App

Everything in this step happens in your app repo and on your laptop. Nothing
touches the server yet.

## Pick your values {#pick-your-values}

::: v-pre
| Placeholder | Template | What it is | How to choose it |
|---|---|---|---|
| `{{APP_NAME}}` | `deploy.yml` | the app name the server knows | short, lowercase, e.g. `shop-web` |
| `{{IMAGE}}` | `deploy.yml` | image repository | `ghcr.io/<org>/<repo>`, **lowercase**, e.g. `ghcr.io/acme/shop-web`; the conf's `IMAGE` on the server is the same |
| `{{STAGING_BRANCH}}` | `deploy.yml` | branch for staging | any branch name, e.g. `staging` or `develop` (see the note below the table) |
| `{{PRODUCTION_BRANCH}}` | `deploy.yml` | branch for production | any branch name, e.g. `main` or `master`; must differ from the staging branch |
| `{{NODE_VERSION}}` | `Dockerfile` | Node version for both image stages | `engines.node`, e.g. `22.12.0` |
| `{{BUILD_COMMAND}}` | `Dockerfile` | the build step | `npm run build` (it must run `next build`) |
| `{{EXTRA_IGNORES}}` | `dockerignore` | extra paths to keep out of the build | large or irrelevant top-level folders (e.g. `docs`, `e2e`), one per line, no leading slash; may be empty |
:::

The server-side values (port, `.env` path, memory cap, …) are picked in the
shared [Add an App to the Server](../add-an-app#pick-your-values).

::: warning Branch names
The two branch names must differ, must not contain `'`, `,`, `{` or `}`, and
must not start with `!`. Those characters break the rendered YAML, and a
leading `!` turns the trigger into a negation pattern. The workflow's tag step
fails if both branches are the same.
:::

## Standalone output {#standalone-output}

In `next.config.js`, `next.config.mjs` or `next.config.ts`, set
`output: "standalone"`:

```js
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
```

`next build` then writes `.next/standalone/`: a `server.js` plus only the
files and `node_modules` packages the app uses. The image runs that folder.

If the app reads files from disk at runtime through a path the build's
tracer can't follow (for example `path.join(process.cwd(), "content", slug)`),
list them in `outputFileTracingIncludes`, keyed by route
([checklist](./app-readiness#checklist) item 6):

```js
const nextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/blog/[slug]": ["./content/**/*"],
  },
};
```

On Next.js 14 and older this key goes under `experimental`.

If the app has no `public/` folder, add an empty one so the Dockerfile's
`COPY` of it works:

::: step level=run where=laptop
```bash
mkdir -p public && touch public/.gitkeep
```
:::

Check:

::: step level=run where=laptop verify="ls prints .next/standalone/server.js"
```bash
npm ci && npm run build && ls .next/standalone/server.js
```
:::

## Fill the templates into your repo {#fill-templates}

::: v-pre
The templates are in the kit's `templates/nextjs/` folder. For each one, copy
it to the path below, replace every `{{NAME}}`, and delete the
`# --- placeholders` … `# ---` header block. The `${{ ... }}` expressions in
the workflow are GitHub syntax, not placeholders, so leave them as they are.
:::

| Template | Goes to (in your app repo) |
|---|---|
| `Dockerfile` | `Dockerfile` |
| `dockerignore` | `.dockerignore` |
| `deploy.yml` | `.github/workflows/deploy.yml` |

What the templates do:

- **`Dockerfile`**: the build stage runs `npm ci`, writes the environment's
  public values to `.env.production.local` (only when there are any), and
  runs the build command. The runtime stage copies `.next/standalone`,
  `.next/static` and `public/`, sets `NODE_ENV=production` and
  `HOSTNAME=0.0.0.0`, runs as the `node` user (uid 1000) and starts
  `node --env-file=/app/.env server.js`.
- **`.dockerignore`**: keeps `node_modules`, `.next`, `.git`, every `.env*`
  file, test output and your extras out of the build.
- **`deploy.yml`**: builds and pushes the image on a push to either branch,
  then deploys it over SSH. Its "Public build values" step reads the
  repository variables from [Public build values](#public-build-values). Keep that step even
  if your app has no public values; with neither variable set it passes an
  empty value.

Two template defaults to review:

- **Plain `npm ci`.** If your lockfile needs `--legacy-peer-deps`, add the
  flag to the `RUN npm ci` line.
- **`node:<version>-alpine`.** If a native dependency fails to build or load
  on Alpine, change both `FROM` lines to `node:<version>-bookworm-slim`.

## Public build values (`NEXT_PUBLIC_*`) {#public-build-values}

::: agent
Public values are not secrets: they ship to every browser. Write `~/public-env/<app>.staging.env` and `.production.env` yourself (`run`), from values in the repo or that the developer gives you. Refuse any name that isn't `NEXT_PUBLIC_*`.
:::

Skip this section if your app has no `NEXT_PUBLIC_*` values.

Write each environment's public values as a small dotenv file on your
laptop, outside the app repo. You paste them into GitHub
([below](#public-env-variables)) and use them for
[the local test](#test-image-locally):

::: step level=run where=laptop
```bash
mkdir -p ~/public-env
```
:::

`~/public-env/<app>.staging.env`:

```ini
# public values for staging
NEXT_PUBLIC_API_URL=https://staging-api.example.com
NEXT_PUBLIC_SITE_NAME=Shop (staging)
```

`~/public-env/<app>.production.env`:

```ini
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_NAME=Shop
```

Rules. The workflow checks every line and fails the build if any line breaks
them:

- Each line is blank, a `#` comment, or `NEXT_PUBLIC_NAME=value`.
- The name starts at the beginning of the line and uses only `A`–`Z`, `0`–`9` and `_` after `NEXT_PUBLIC_`. No `export`, no spaces before the name or before the `=`.
- Anything else is rejected with `PUBLIC_ENV_STAGING line 3 must be blank, a # comment or NEXT_PUBLIC_<NAME>=<value>` (or `PUBLIC_ENV_PRODUCTION`). The line number counts from 1, blank lines included. The error message never repeats the line. But the step receives both variables in its `env:` block, and GitHub shows that block, unmasked, in the run log: the full content of `PUBLIC_ENV_STAGING` and `PUBLIC_ENV_PRODUCTION` is in every build run's log (public to everyone on a public repository).
- Windows line endings are fine.

::: warning Write literal values
Next.js reads these lines with dotenv-expand, so `$NAME` and `${NAME}` in a
value are replaced with variables from the build environment, or with
nothing. Write the final value; don't refer to other variables. Quote a value
that contains `#`, so it isn't read as a comment.
:::

::: danger Public means public
Every value here ends up in the JavaScript sent to every browser. Never put a
key, token or password in these files. The workflow only accepts
`NEXT_PUBLIC_*` names to stop server values from leaking by mistake, but it
can't tell whether a `NEXT_PUBLIC_*` value is secret.
:::

What follows from baking them in:

- **Changing a public value needs a new build:** change the variable in
  GitHub, then push a commit to that environment's branch.
- **A rollback restores the public values that older image was built with.**
- **Local `.env*` files never reach CI images.** `.dockerignore` excludes
  them; in CI the values come only from the repository variables.

## Test the image locally before pushing {#test-image-locally}

::: agent
Create the test `.env` yourself, with throwaway values that point at local services. Never copy values from a real `.env`. The `docker run` blocks the terminal, so run it in the background and stop it after the checks.
:::

Build it the way CI builds staging, with the staging public values (leave
out `--build-arg` if the app has none):

::: step level=run where=laptop verify="the image builds"
```bash
docker build --build-arg PUBLIC_ENV_B64="$(base64 < ~/public-env/<app>.staging.env | tr -d '\n')" -t <app>:local .
```
:::

Make a throwaway server `.env` outside the repo, with a free port that is
**not** 3000 and server values that point at local or test services. Don't
use your real secrets. For example, `~/<app>-test.env`:

```ini
PORT=4100
API_URL=http://localhost:4000
```

The container's `node` user (uid 1000) must be able to read it; on a laptop,
mode `644` is fine.

Run it the way the server will:

::: step level=run where=laptop verify="the app starts; the curl checks below answer"
```bash
docker run --rm --init --network host --memory 384m --memory-swap 384m -v "$HOME/<app>-test.env:/app/.env:ro" <app>:local
```
:::

::: warning Docker Desktop (macOS, Windows)
Host networking is off by default in Docker Desktop: it needs version 4.34
or later with host networking enabled in Settings -> Resources -> Network.
Without it every `curl` below prints `000`. For this local test you can
instead publish the ports, replacing `--network host` with
`-p 4100:4100 -p 3000:3000` (mapping 3000 too keeps the "not on 3000" check
meaningful; drop it if port 3000 is busy on your laptop). Inside the
container `localhost` is then the container itself, so point server values
at `host.docker.internal` instead of `localhost`.
:::

In another terminal, check each of these.

The app listens on the `.env` port. Any HTTP code (not `000`) means it's up:

::: step level=run where=laptop verify="any HTTP code, not 000"
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4100/
```
:::

It does **not** listen on 3000. This should print `000`, unless something
else on your laptop uses port 3000:

::: step level=run where=laptop verify="prints 000 (nothing listens on 3000), unless another local app uses 3000"
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
```
:::

Static assets are served. This should print `200` (if `/` redirects, use the
path of a page that renders):

::: step level=run where=laptop verify="prints 200"
```bash
asset=$(curl -s http://127.0.0.1:4100/ | grep -o '/_next/static/[^"]*' | head -n1) && curl -s -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:4100$asset"
```
:::

A public value is baked into the build. Use one of your staging values;
this lists at least one file:

::: step level=run where=laptop verify="lists at least one file"
```bash
docker run --rm --entrypoint grep <app>:local -rl 'staging-api.example.com' /app/.next
```
:::

The public values file stayed in the build stage. This prints `ok`:

::: step level=run where=laptop verify="prints ok"
```bash
docker run --rm --entrypoint sh <app>:local -c 'test ! -e /app/.env.production.local && echo ok'
```
:::

Memory use stays well under the cap while you click through the app:

::: step level=run where=laptop verify="memory well under the cap"
```bash
docker stats --no-stream
```
:::

If a page crashes with `ENOENT` in the container's output, a runtime file is
missing from `.next/standalone`. Add it to `outputFileTracingIncludes`
([Standalone output](#standalone-output)).

## What goes in the server `.env` {#server-env}

You create the `.env` on the server in the shared step
[Add an App to the Server](../add-an-app#env-file), which
also covers its owner, mode and the key check. Work out its contents now.

The container sees exactly **one** file: the `.env` at `ENV_FILE`, mounted
at `/app/.env`. Put every server value the app needs into it.

This differs from running `next start` in a project folder. There, Next.js
loads every `.env*` file it finds (`.env`, `.env.local`, `.env.production`,
`.env.production.local`), and the port comes from `next start -p` or the
shell, not from those files. If the app runs that way today, list its files:

::: step level=ask where=server
```bash
ls -la /path/to/current/app/.env*
```
:::

Merge them into one file. When a key appears in several, keep the value
from the file that wins today: `.env.production.local`, then `.env.local`,
then `.env.production`, then `.env`.

Then make sure the file has:

- **`PORT`**, equal to the conf's `PORT`. Without `PORT` the server takes 3000.
- **Every server value** you listed in [Is Your App Ready?](./app-readiness#checklist), with its value for this environment.

Lines you don't need here: `NEXT_PUBLIC_*` values change nothing at
runtime (they were fixed at build time, [above](#public-build-values)), and
`HOSTNAME` and `NODE_ENV` are ignored because the image already sets them.

Format: `KEY=value`, `KEY = value`, quoted values and `#` comments all work.

If the app runs under pm2 today, also check for
[values set outside `.env` files](../add-an-app#values-outside-env).

## Public build values on GitHub {#public-env-variables}


::: agent
Creating the repository variables is `ask`/`github`: run `gh variable set PUBLIC_ENV_STAGING < ~/public-env/<app>.staging.env` (and the production one) once the developer approves.
:::

Skip this if the app has no `NEXT_PUBLIC_*` values.

Settings → Secrets and variables → Actions → **Variables** tab →
New repository variable. Create:

| Repository variable | Value |
|---|---|
| `PUBLIC_ENV_STAGING` | the full content of `~/public-env/<app>.staging.env` |
| `PUBLIC_ENV_PRODUCTION` | the full content of `~/public-env/<app>.production.env` |

They must be **repository** variables, not environment variables: the build
job picks its environment in its own first step, so it can't read a GitHub
environment's variables. They are variables, not secrets, because the values
ship to every browser anyway.

## ✅ Checkpoint {#checkpoint}

::: v-pre
- `next.config` has `output: "standalone"`, `public/` exists, and `npm ci && npm run build` produces `.next/standalone/server.js`.
- `Dockerfile`, `.dockerignore` and `.github/workflows/deploy.yml` exist, and none contains `{{` (`grep -rn '{{[A-Z_]*}}' Dockerfile .dockerignore .github/` prints nothing).
- The image builds locally with the staging public values, boots with `--network host` and a test `.env`, answers HTTP on the `.env` port (not 3000), serves `/_next/static` files, and has a public value baked into `/app/.next`.
:::

- You have the list of keys for each environment's server `.env`, with `PORT` first.
- If the app has public values: repository variables `PUBLIC_ENV_STAGING` and `PUBLIC_ENV_PRODUCTION` exist.

Next: [Server Setup](../server-setup) (skip it if the server
already runs the pipeline), then
[Add an App to the Server](../add-an-app).
