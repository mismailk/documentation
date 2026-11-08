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
| `{{APP_NAME}}` | `deploy.yml` | the app name the server knows | short, lowercase, e.g. `dashboard` |
| `{{IMAGE}}` | `deploy.yml` | image repository | `ghcr.io/<org>/<repo>`, **lowercase**; the conf's `IMAGE` on the server is the same |
| `{{STAGING_BRANCH}}` | `deploy.yml` | branch for staging | any branch name, e.g. `staging` or `develop` (see the note below the table) |
| `{{PRODUCTION_BRANCH}}` | `deploy.yml` | branch for production | any branch name, e.g. `main` or `master`; must differ from the staging branch |
| `{{NODE_VERSION}}` | `Dockerfile` | Node version for the build stage | `engines.node`, e.g. `22.12.0` |
| `{{BUILD_COMMAND}}` | `Dockerfile` | the whole build command line | `npm run build`, or the explicit command below |
| `{{BUILD_DIR}}` | `Dockerfile` | the build output folder | `build` or `dist` |
| `{{EXTRA_IGNORES}}` | `dockerignore` | extra paths to keep out of the build | large or irrelevant top-level folders (e.g. `docs`, `e2e`), one per line, no leading slash; may be empty |
| `{{PUBLIC_PREFIX}}` | `Dockerfile`, `deploy.yml` | the public value prefix the workflow's name check accepts | `VITE_` for Vite, `REACT_APP_` for Create React App |
:::

The server-side values (port, `.env` path, memory cap, …) are picked in the
shared [Add an App to the Server](../add-an-app#pick-your-values). For a
static app the memory cap is `64m` unless the local test below shows it needs
more.

::: warning Branch names
The two branch names must differ, must not contain `'`, `,`, `{` or `}`, and
must not start with `!`. Those characters break the rendered YAML, and a
leading `!` turns the trigger into a negation pattern. The workflow's tag step
fails if both branches are the same.
:::

### Build command and output {#build-command}

::: v-pre
Write the whole command line in `{{BUILD_COMMAND}}`; it runs after `npm ci` in
the build stage, in one shell invocation.

**Vite.** `tsc --noEmit && vite build` (or `npm run build`, if the script runs
the same). Vite writes `dist` by default. If the app sets
`build.outDir: "build"` in `vite.config`, use `build` for `{{BUILD_DIR}}`;
otherwise use `dist`. The reference dashboard uses `build`.
:::

**Create React App.** `npx react-scripts build && npx workbox injectManifest workbox-config.js`.
The Workbox `injectManifest` step is part of the build; keep it. CRA writes
`build`.

Do not use `env-cmd`, `--mode staging` or Windows `%NAME%` syntax. There is
one production-mode build per environment, and the environment's public
values arrive through `.env.production.local` (written by the Dockerfile from
`PUBLIC_ENV_B64`). Settings that are the same in every environment
(`GENERATE_SOURCEMAP`, `BUILD_PATH`, `INLINE_RUNTIME_CHUNK`) go in the build
command or in an `ENV` line in the Dockerfile, never in `PUBLIC_ENV_*`.

## Fill the templates into your repo {#fill-templates}

::: v-pre
The templates are in the kit's `templates/react/` folder. For each one, copy
it to the path below, replace every `{{NAME}}`, and delete the
`# --- placeholders` … `# ---` header block. The `${{ ... }}` expressions in
the workflow are GitHub syntax, not placeholders, so leave them as they are.
:::

| Template | Goes to (in your app repo) | Notes |
|---|---|---|
| `Dockerfile` | `Dockerfile` | fill `NODE_VERSION`, `BUILD_COMMAND`, `BUILD_DIR`, `PUBLIC_PREFIX` |
| `dockerignore` | `.dockerignore` | fill `EXTRA_IGNORES` |
| `deploy.yml` | `.github/workflows/deploy.yml` | fill `APP_NAME`, `IMAGE`, both branch names, `PUBLIC_PREFIX` |
| `nginx.conf.template` | `nginx.conf.template` | **copy unchanged** |
| `nginx-include.conf` | `nginx-include.conf` | **copy unchanged** |
| `docker-entrypoint.sh` | `docker-entrypoint.sh` | **copy unchanged**; must stay executable |

What the templates do:

- **`Dockerfile`**: a Node build stage runs `npm ci`, writes the environment's
  public values to `.env.production.local` (only when there are any), and runs
  the build command. The runtime stage is `nginxinc/nginx-unprivileged`, runs
  as uid 101, and copies only the build output. It never copies the app
  sources or the `.env.production.local` file.
- **`nginx.conf.template` / `nginx-include.conf` / `docker-entrypoint.sh`**:
  nginx needs the port at start, before the app exists. The entrypoint reads
  `PORT` from the mounted `/app/.env`, renders the SPA config, and starts
  nginx. The Dockerfile references these three files, so a repo missing one
  does not build. A missing or invalid `PORT` makes the container exit
  non-zero at start, which the deploy's verify step reports.
- **`.dockerignore`**: keeps `node_modules`, `build`, `dist`, `.git`, every
  `.env*` file, test output and your extras out of the build. Keeping `.env*`
  out is what makes committed CRA `.env.*` files inert.
- **`deploy.yml`**: builds and pushes the image on a push to either branch,
  then deploys it over SSH. Its "Public build values" step reads the
  repository variables from [Public build values](#public-build-values) and
  accepts only lines with the app's `PUBLIC_PREFIX`.

Two template defaults to review:

- **Plain `npm ci`.** If your lockfile needs `--legacy-peer-deps`, add the
  flag to the `RUN npm ci` line.
- **`node:<version>-alpine`.** If a native build dependency fails on Alpine,
  change the build stage's `FROM` line to `node:<version>-bookworm-slim`.
  The nginx runtime stage does not change.

## Public build values {#public-build-values}

Skip this section if the app has no public values.

Public values are the settings the browser code needs (API URL, app title,
feature flags). They are compiled into the static files by the build, so they
must be present **at build time** and they are readable by everyone.

Write each environment's public values as a small dotenv file on your laptop,
outside the app repo. You paste them into GitHub ([below](#public-env-variables))
and use them for [the local test](#test-image-locally):

::: step level=run where=laptop
```bash
mkdir -p ~/public-env
```
:::

`~/public-env/<app>.staging.env`, with the prefix the app uses:

```ini
# public values for staging
VITE_API_URL=/api
VITE_APP_TITLE=Dashboard (staging)
```

or, for Create React App:

```ini
# public values for staging
REACT_APP_API_URL=/api
REACT_APP_APP_TITLE=Enrollment (staging)
```

`~/public-env/<app>.production.env` holds the same names with the production
values.

Rules. The workflow checks every line and fails the build if any line breaks
them:

- Each line is blank, a `#` comment, or `<PREFIX><NAME>=value`, where
  `<PREFIX>` is exactly the prefix picked above (`VITE_` or `REACT_APP_`).
- The name starts at the beginning of the line and uses only `A`–`Z`, `0`–`9`
  and `_` after the prefix. No `export`, no spaces before the name or before
  the `=`.
- Anything else is rejected with an error like
  `PUBLIC_ENV_STAGING line 3 must be blank, a # comment or VITE_<NAME>=<value>`
  (or the `REACT_APP_` form, and the matching `PUBLIC_ENV_PRODUCTION`). The
  line number counts from 1, blank lines included. The error message never repeats the line. But the step receives
  both variables in its `env:` block, and GitHub shows that block, unmasked,
  in the run log: the full content of `PUBLIC_ENV_STAGING` and
  `PUBLIC_ENV_PRODUCTION` is in every build run's log.
- Windows line endings are fine.

::: danger Public means public
Every value here ends up in the JavaScript sent to every browser. Never put a
key, token or password in these files. The workflow only accepts the app's
prefix to stop server values from leaking by mistake, but it can't tell
whether a `VITE_*` or `REACT_APP_*` value is secret.
:::

What follows from baking them in:

- **Changing a public value needs a new build:** change the variable in
  GitHub, then push a commit to that environment's branch.
- **A rollback restores the public values that older image was built with.**
- **Local `.env*` files never reach CI images.** `.dockerignore` excludes
  them; in CI the values come only from the repository variables.

Quote a value that contains `#`, or the rest is read as a comment. CRA
expands nothing; Vite only exposes values whose names start with `VITE_`.

## Test the image locally before pushing {#test-image-locally}

Build it the way CI builds staging, with the staging public values (leave out
`--build-arg` if the app has none):

::: step level=run where=laptop
```bash
docker build --build-arg PUBLIC_ENV_B64="$(base64 < ~/public-env/<app>.staging.env | tr -d '\n')" -t <app>:local .
```
:::

Make a throwaway server `.env` outside the repo, with a free port that is
**not** 4000 or 3000 (the backends' usual ports). It holds only `PORT`; the
public values are already baked into the build. For example,
`~/<app>-test.env`:

```ini
PORT=4100
```

Mode `644` is fine on a laptop.

Run it the way the server will. A static app needs little memory; the cap is
`64m`:

::: step level=run where=laptop
```bash
docker run --rm --init --network host --memory 64m --memory-swap 64m -v "$HOME/<app>-test.env:/app/.env:ro" <app>:local
```
:::

::: warning Docker Desktop (macOS, Windows)
Host networking is off by default in Docker Desktop: it needs version 4.34
or later with host networking enabled in Settings -> Resources -> Network.
Without it every `curl` below prints `000`. For this local test you can
instead publish the port, replacing `--network host` with `-p 4100:4100`.
:::

In another terminal, check each of these.

The app listens on the `.env` port. Any HTTP code (not `000`) means it's up:

::: step level=run where=laptop verify="prints a code other than 000"
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4100/
```
:::

A deep link returns the shell, so a browser refresh works:

::: step level=run where=laptop verify="prints 200"
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4100/some/deep/link
```
:::

A missing file with an extension is a real 404, not the shell:

::: step level=run where=laptop verify="prints 404"
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4100/assets/does-not-exist.js
```
:::

`index.html` is revalidated, while a hashed asset is cached for a year.
Replace the asset path with one printed by the build:

::: step level=run where=laptop verify="shows no-cache"
```bash
curl -sI http://127.0.0.1:4100/ | grep -i '^cache-control'
```
:::

::: step level=run where=laptop verify="shows max-age=31536000 and immutable"
```bash
curl -sI http://127.0.0.1:4100/assets/<hashed-file>.js | grep -i '^cache-control'
```
:::

A public value is baked into the build. Use one of your staging values; this
lists at least one file:

::: step level=run where=laptop verify="lists at least one file"
```bash
docker run --rm --entrypoint grep <app>:local -rl '/api' /usr/share/nginx/html
```
:::

The public values file stayed in the build stage. This prints `ok`:

::: step level=run where=laptop verify="prints ok"
```bash
docker run --rm --entrypoint sh <app>:local -c 'test ! -e /app/.env.production.local && echo ok'
```
:::

The runtime runs unprivileged. This prints `uid=101`:

::: step level=run where=laptop verify="prints uid=101"
```bash
docker run --rm --entrypoint id <app>:local
```
:::

Memory use stays well under the cap while you click through the app (open
the site in a browser against `http://127.0.0.1:4100/`):

::: step level=run where=laptop
```bash
docker stats --no-stream
```
:::

## What goes in the server `.env` {#server-env}

The container reads exactly one server file, `PORT`. Everything else is either
baked into the image (the public values) or comes from the API.

**The React image runs nginx as uid 101, not uid 1000.** The shared
[Add an App to the Server](../add-an-app#env-file) step creates the file for
the Node images' uid 1000. When you create it for a React app, give it to
uid 101 instead:

::: step level=ask where=server
```bash
sudo install -o 101 -g 101 -m 600 /dev/null /srv/<app>/staging/.env
```
:::

Then add one line, `PORT=<app-port>`, with the same value as the conf's
`PORT`. A mode-600 file owned by uid 1000 is unreadable to the container: the
entrypoint exits with `PORT is missing` and the deploy fails after the old
container was already removed. `deployer` still needs to see that the file
exists; use the shared step's check and traverse-only ACL if needed.

## Hosting setups {#hosting-setups}

The frontend stays on the same domain as its backend in the reference
deployments. Pick the setup that matches yours; the Nginx snippets are
examples, and the real ports and paths are yours.

| | Setup | Nginx | App change |
|---|---|---|---|
| A | Own address (own subdomain or domain) | one `server` block proxying `/` to the container | none |
| B | **Same domain as the backend, split by path** | `location` rules send the backend's prefixes (`/api`, `/socket.io`, …) to the backend, everything else to the frontend container | the app calls the backend by a relative or same-domain URL |
| C | Sub-path of a domain (`/app/`) | `location /app/` proxies to the container | Vite `base` / CRA `homepage` or `PUBLIC_URL`, router `basename` |

The Nginx configuration is the backend's existing site file in setup B. Add
the `location` blocks by hand; the backend keeps owning the file. In every
setup run `sudo nginx -t` before reloading, and reload only when it passes.
The shared [Add an App](../add-an-app#conf-check) step has the full Nginx
check.

### A: own address {#setup-a}

Point the subdomain at the server, then add one site:

```nginx
server {
    listen 443 ssl;
    server_name <app-domain>;

    location / {
        proxy_pass http://127.0.0.1:<app-port>;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The app needs no change. If it calls the API on another host, that is a
cross-origin call: the backend must allow the app's origin (CORS) and, for
cookies, the right `SameSite`/domain settings.

### B: same domain as the backend {#setup-b}

The backend owns the site file. Keep a copy, then add the backend's prefixes
and a fallback to the app container inside the backend's existing `server`
block. The example prefixes are `/api/` and `/socket.io/`; list yours:

```nginx
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:<api-port>;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSockets
    location /socket.io/ {
        proxy_pass http://127.0.0.1:<api-port>;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Everything else: the frontend container
    location / {
        proxy_pass http://127.0.0.1:<app-port>/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

The WebSocket upgrade headers are required for a Socket.IO backend; without
them the handshake returns 400.

The app calls the backend through the same domain, so public values use
relative URLs such as `VITE_API_URL=/api` or `REACT_APP_API_URL=/api`.

**Cutover order for setup B.** Do not remove the backend's file serving
first. In order:

1. deploy the frontend container and check it answers on its port;
2. switch Nginx to the new `location` rules (`nginx -t`, reload), and confirm
   the page, a deep link, one API call and the WebSocket connection;
3. in a later release, remove the file serving from the backend.

That order keeps a working site at every step. To roll back, restore the
previous Nginx file (`nginx -t`, reload); the backend serves the old files
again.

### C: sub-path of a domain {#setup-c}

Nginx proxies the sub-path and drops it before the container:

```nginx
    location /app/ {
        proxy_pass http://127.0.0.1:<app-port>/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

The trailing `/` on both sides matters: `/app/x.js` reaches the container as
`/x.js`. The app must generate its assets and routes under `/app/`:

- **Vite:** set `base: "/app/"` in `vite.config`.
- **Create React App:** set `"homepage": "/app/"` in `package.json`, or
  `PUBLIC_URL=/app/` at build time.
- **Router:** set `basename="/app"` on `BrowserRouter`.

A wrong base is the usual cause of a blank page or a page with no CSS under
setup C (see [Troubleshooting](./troubleshooting#wrong-base)).

## Public values on GitHub {#public-env-variables}

Skip this if the app has no public values.

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
- The six template files exist in the app repo, and none still contains a `{{NAME}}`.
- `docker build --build-arg PUBLIC_ENV_B64=...` succeeds, and the image runs on the `.env` port with a deep link returning the shell.
- `index.html` is `no-cache`, a hashed asset is long-cached, a missing asset is 404, and the image runs as uid 101.
- A staging public value is baked into `/usr/share/nginx/html`.
- The hosting setup (A, B or C) is chosen, and for B or C the Nginx blocks and the app's URL/base changes are written down.
:::

- The repository variables `PUBLIC_ENV_STAGING` and `PUBLIC_ENV_PRODUCTION` exist, if the app has public values.

Next: [Server Setup](../server-setup) (skip it if the server already runs the
pipeline), then [Add an App to the Server](../add-an-app).
