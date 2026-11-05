---
title: 4. Add Your App
order: 4
---
# 4. Add Your App

## 4.1 Pick your values {#pick-your-values}

::: v-pre
| Placeholder | What it is | How to choose it |
|---|---|---|
| `{{APP_NAME}}` | the app name the server knows | short, lowercase, e.g. `orders-api` |
| `{{IMAGE}}` | image repository | `ghcr.io/<org>/<repo>`, **lowercase** |
| `{{STAGING_BRANCH}}` | branch for staging | any branch name, e.g. `staging` or `develop` (see the note below the table) |
| `{{PRODUCTION_BRANCH}}` | branch for production | any branch name, e.g. `main` or `master`; must differ from the staging branch |
| `{{NODE_VERSION}}` | Node version for the image | `engines.node`, e.g. `22.12.0` |
| `{{BUILD_COMMAND}}` | compile step | `npm run build` |
| `{{START_COMMAND}}` | container command, JSON array form | `["node", "dist/server.js"]` |
| `{{RUNTIME_COPY_LINES}}` | extra runtime paths ([checklist](./app-readiness) item 7) | one line per path, see below |
| `{{EXTRA_IGNORES}}` | extra paths to keep out of the build | large or irrelevant top-level folders, one per line |
| `{{CONTAINER}}` | container name on the server | `<app>-staging` / `<app>-production` |
| `{{PORT}}` | port the app listens on | must equal `PORT` in that environment's `.env`, and must be unique on the server |
| `{{ENV_FILE}}` | absolute path to the `.env` on the server | e.g. `/srv/<app>/staging/.env` |
| `{{MEMORY}}` | container memory cap | about 2× the app's normal memory use, e.g. `384m` |
| `{{KEEP_IMAGES}}` | old images kept on the server for rollback | `3`–`5`, depending on disk space |
:::

::: warning Branch names
The two branch names must differ, must not contain `'`, `,`, `{` or `}`, and
must not start with `!`. Those characters break the rendered YAML, and a
leading `!` turns the trigger into a negation pattern. The workflow's tag step
fails if both branches are the same.
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

## 4.2 Fill the templates into your repo {#fill-templates}

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

```bash
npm pkg set scripts.build=tsc
```

## 4.3 Test the image locally before pushing {#test-image-locally}

Build it:

```bash
docker build -t <app>:local .
```

Run it the way the server will. Use a throwaway `.env` that points at local
services, and a free port. Don't use your real secrets:

```bash
docker run --rm --init --network host -v "$PWD/.env.local-test:/app/.env:ro" <app>:local
```

In another terminal, any HTTP answer means the app is up:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:<PORT>/
```

::: v-pre
An `ENOENT` crash means a runtime file is missing. Add it to
`{{RUNTIME_COPY_LINES}}`.
:::

## 4.4 Register the app on the server {#register-app}

`deploy.sh` only deploys apps on its whitelist: one `case "$2" in` line in
its `parse_request` function. The `deploy.sh` in the kit lists only an
example app, `backend`.

::: warning Start from the right copy
The whitelist on a server must list *every* app that server deploys. If the
server already runs the pipeline for other apps, edit the server's installed
copy, not a fresh one from the kit, or you'd remove the other apps.
:::

From the kit folder on your laptop, fetch the installed copy over the kit's
copy:

```bash
scp -P <ssh-port> ubuntu@<server-host>:/opt/deploy/deploy.sh server/deploy.sh
```

On a server you just set up, the kit's copy is the installed one, so there's
nothing to fetch.

Now edit `server/deploy.sh`. Find the whitelist line in `parse_request`:

```bash
    backend) ;;
```

Add your app, separated by ` | `. On a new server, replace the example
`backend` with your app instead:

```bash
    backend | <app>) ;;
```

Check the script still parses:

```bash
bash -n server/deploy.sh && echo ok
```

Copy the scripts to the server again. This overwrites them in place:

```bash
scp -P <ssh-port> server/*.sh server/app.conf.template ubuntu@<server-host>:~/docker-deploy-server/
```

On the server, reinstall only `deploy.sh` (nothing else changes):

```bash
cd ~/docker-deploy-server && sudo ./server-setup.sh --skip-docker --skip-swap
```

```bash
grep -A1 'case "$2" in' /opt/deploy/deploy.sh
```

The server now accepts the app. With no conf file yet, a test request gets
past the whitelist and stops at the conf step: `exit 3` with
`conf not found` is the expected result here. (`exit 2` with `unknown app`
means the whitelist edit didn't take.)

```bash
sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-0000000; echo "exit $?"
```

Keep your edited `deploy.sh`. It's now the record of what that server
deploys, and you'll need it the next time an app is added.

## 4.5 Create the conf file and `.env` for each environment {#conf-and-env}

On the server, for each environment the server hosts, create
`/opt/deploy/apps/<app>-<env>.conf` (`<env>` is `staging` or `production`).
Start from `~/docker-deploy-server/app.conf.template`, fill the six values
and delete its comment header:

```ini
IMAGE=ghcr.io/<org>/<repo>
CONTAINER=<app>-staging
PORT=4100
ENV_FILE=/srv/<app>/staging/.env
MEMORY=384m
KEEP_IMAGES=5
```

Rules: `KEY=value` with no spaces and no quotes; all six keys exactly once;
owned by root, mode `644`:

```bash
sudo install -o root -g root -m 644 <app>-staging.conf /opt/deploy/apps/
```

The app's `.env`:

- **Location:** at `ENV_FILE`. Its `PORT` must equal the conf's `PORT`.
- **Owner and mode:** owned by uid `1000` (the container's `node` user),
  mode `600`.

  ```bash
  sudo chown 1000 /srv/<app>/staging/.env && sudo chmod 600 /srv/<app>/staging/.env
  ```

- **Format:** `KEY=value` and `KEY = value` both work, because the app's own
  dotenv reads it.
- **Reachable by `deployer`:** `deployer` must be able to see that the file
  exists. Under `/home/<user>` it usually can't, because home directories
  are `750`. Check it:

  ```bash
  sudo -u deployer test -f /srv/<app>/staging/.env && echo ok
  ```

  If it doesn't print `ok`, give traverse-only access to the blocking
  directory, for example:

  ```bash
  sudo setfacl -m u:deployer:x /home/ubuntu
  ```

Check that the conf parses. No image exists yet, so the expected result is
`exit 1` with `deploy: pull failed`. `exit 2` or `exit 3` means the conf
needs fixing.

```bash
sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-0000000; echo "exit $?"
```

Then add an Nginx `proxy_pass http://127.0.0.1:<PORT>;` site for the app,
if it doesn't have one yet. Nginx never needs to change on later deploys.

## 4.6 GitHub settings {#github-settings}

In your app repo: Settings → Environments → New environment. Create
`staging` and `production`, and set up each one like this:

1. **Deployment branches and tags** → Selected branches. Allow only
   your staging branch (e.g. `staging`) for the `staging` environment, and
   only your production branch (e.g. `main`) for `production`.
2. **Variables:**

   | Variable | Value |
   |---|---|
   | `DEPLOY_HOST` | `<server-host>` for that environment |
   | `DEPLOY_SSH_PORT` | `<ssh-port>` |
   | `DEPLOY_KNOWN_HOSTS` | the verified `ssh-keyscan` line ([3.7](./server-setup#pin-host-key)) |
   | `DEPLOY_ENABLED` | `false` for now |

3. **Secret** `DEPLOY_SSH_KEY`: the full content of that environment's
   **private** key file (`deploy_staging` or `deploy_production`), including
   the BEGIN and END lines.

Then delete the private key files from your laptop. If a key is ever needed
again, make a new pair.

::: tip Reusing keys
If the server already serves another app, you can reuse that server's
existing CI keys and `known_hosts` line instead of making new keys. Each key
is limited to one environment, not to one app.
:::

## ✅ Checkpoint {#checkpoint}

In the app repo:

::: v-pre
- `Dockerfile`, `.dockerignore` and `.github/workflows/deploy.yml` exist, and none contains `{{` (`grep -rn '{{[A-Z_]*}}' Dockerfile .dockerignore .github/` prints nothing).
- The image builds locally, boots with `--network host` and a test `.env`, and answers HTTP on its port.
:::

On the server:

- `grep -A1 'case "$2" in' /opt/deploy/deploy.sh` lists your app.
- `sudo -u deployer test -f <ENV_FILE> && echo ok` prints `ok` for each environment.
- The conf check `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-0000000` exits **1** with `deploy: pull failed` (not 2 or 3).
- Nginx proxies the app's public URL to `127.0.0.1:<PORT>`.

On GitHub:

- Environments `staging` and `production` exist, each limited to its branch, with `DEPLOY_HOST`, `DEPLOY_SSH_PORT`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_ENABLED=false` and the `DEPLOY_SSH_KEY` secret.
- The private key files are deleted from your laptop.
