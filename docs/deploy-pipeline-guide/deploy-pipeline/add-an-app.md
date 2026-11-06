---
title: 3. Add an App to the Server
order: 3
---
# 3. Add an App to the Server

Do this once for every app, after its image builds and passes the local test
in your app's guide. Commands marked "on the server" run there; the rest run
on your laptop, from the unzipped `deploy-pipeline-kit/` folder.

## 3.1 Pick the server values {#pick-your-values}

Each environment of the app gets its own conf file on the server
(`/opt/deploy/apps/<app>-<env>.conf`) with these six values:

| Conf key | What it is | How to choose it |
|---|---|---|
| `IMAGE` | image repository, no tag | `ghcr.io/<org>/<repo>`, **lowercase**; the same value as the workflow's image |
| `CONTAINER` | container name on the server | `<app>-staging` / `<app>-production` |
| `PORT` | port the app listens on | must equal `PORT` in that environment's `.env`, and must be unique on the server. If the app replaces a process that already runs behind Nginx, use that process's port so Nginx stays unchanged |
| `ENV_FILE` | absolute path to the app's `.env` on the server | e.g. `/srv/<app>/staging/.env` |
| `MEMORY` | container memory cap | about 2× the app's normal memory use, e.g. `384m` |
| `KEEP_IMAGES` | old images kept on the server for rollback | `3`–`5`, depending on disk space |

`<app>` must be the same name as the app name in the app's workflow.

## 3.2 Register the app on the server {#register-app}

`deploy.sh` only deploys apps on its whitelist: one `case "$2" in` line in
its `parse_request` function. The `deploy.sh` in the kit lists only an
example app, `backend`.

::: warning Start from the right copy
The whitelist on a server must list *every* app that server deploys. If the
server already runs the pipeline for other apps, edit the server's installed
copy, not a fresh one from the kit, or you'd remove the other apps.
:::

Fetch the installed copy over the kit's copy:

::: step level=ask where=server
```bash
scp -P <ssh-port> ubuntu@<server-host>:/opt/deploy/deploy.sh server/deploy.sh
```
:::

On a server you just set up, the kit's copy is the installed one, so there's
nothing to fetch.

::: agent
Editing `server/deploy.sh` on the laptop is `run`: make the whitelist edit yourself, then run the `bash -n` check.
:::

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

::: step level=run where=laptop verify="prints ok"
```bash
bash -n server/deploy.sh && echo ok
```
:::

Copy the scripts to the server again. This overwrites them in place:

::: step level=ask where=server
```bash
scp -P <ssh-port> server/*.sh server/app.conf.template ubuntu@<server-host>:~/docker-deploy-server/
```
:::

On the server, reinstall only `deploy.sh` (nothing else changes):

::: step level=ask where=server
```bash
cd ~/docker-deploy-server && sudo ./server-setup.sh --skip-docker --skip-swap
```
:::

::: step level=ask where=server verify="lists the app"
```bash
grep -A1 'case "$2" in' /opt/deploy/deploy.sh
```
:::

The server now accepts the app. With no conf file yet, a test request gets
past the whitelist and stops at the conf step: `exit 3` with
`conf not found` is the expected result here. (`exit 2` with `unknown app`
means the whitelist edit didn't take.)

::: step level=ask where=server verify="exit 3 with conf not found (exit 2 means the whitelist edit didn't take)"
```bash
sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-0000000; echo "exit $?"
```
:::

Keep your edited `deploy.sh`. It's now the record of what that server
deploys, and you'll need it the next time an app is added.

## 3.3 Create the conf file {#conf-file}

On the server, for each environment the server hosts, create
`/opt/deploy/apps/<app>-<env>.conf`. Start from
`~/docker-deploy-server/app.conf.template`, fill the six values from
[3.1](#pick-your-values) and delete its comment header:

```ini
IMAGE=ghcr.io/acme/orders-api
CONTAINER=orders-api-staging
PORT=4100
ENV_FILE=/srv/orders-api/staging/.env
MEMORY=384m
KEEP_IMAGES=5
```

Rules: `KEY=value` with no spaces and no quotes; all six keys exactly once;
owned by root, mode `644`:

::: step level=ask where=server
```bash
sudo install -o root -g root -m 644 <app>-staging.conf /opt/deploy/apps/
```
:::

## 3.4 Create the `.env` {#env-file}

::: agent
Writing the server `.env` with real values is `never`. The developer creates it on the server. Give them the list of key names (from the app guide's "What goes in the server `.env`"), then ask to run the key checks below, which print names only.
:::

The container sees exactly **one** file: the `.env` at `ENV_FILE`, mounted
read-only at `/app/.env`. Your app's guide says what goes in it and which
line format the app reads. Whatever the app, it must have `PORT`, equal to
the conf's `PORT`.

### Values set outside `.env` files {#values-outside-env}

If the app runs on the server today, some values may be set outside its
`.env` files: in a pm2 ecosystem file's `env:` block, a systemd unit, or the
shell that started it. The container gets none of them. Under pm2, list the
names the running process sees, using the id from `pm2 list` (this prints
only names, never values):

::: step level=ask where=server verify="prints names only"
```bash
pm2 env <id> | grep -oE '^[A-Za-z_][A-Za-z0-9_]*:'
```
:::

Most are ordinary system variables such as `PATH`. Any name your app reads
that isn't in the `.env` yet goes into it.

::: danger Missing values fail quietly
A missing URL often falls back to a default in the code, such as
`http://localhost:3000`. Under host networking that reaches whatever
listens on that port on the server, possibly another app. `deploy.sh` only
checks that the app answers HTTP, so it won't notice.
:::

### Check every key {#check-keys}

Check every key is there with a non-empty value. Put your own key names
after `PORT`. This prints only key names, never values:

::: step level=ask where=server verify="every key prints ok"
```bash
for k in PORT API_URL APP_URL; do sudo grep -Eq "^[[:space:]]*$k[[:space:]]*=[[:space:]]*[^[:space:]#]" /srv/<app>/staging/.env && echo "ok $k" || echo "MISSING $k"; done
```
:::

Every key must print `ok`. A key listed twice should be cut down to one
line; this prints duplicated key names and must print nothing:

::: step level=ask where=server verify="prints nothing"
```bash
sudo grep -oE '^[[:space:]]*[A-Za-z_][A-Za-z0-9_]*[[:space:]]*=' /srv/<app>/staging/.env | tr -d ' \t=' | sort | uniq -d
```
:::

### Owner, mode and access {#env-access}

- **Owner and mode:** owned by uid `1000` (the container's `node` user),
  mode `600`.

  ::: step level=ask where=server
  ```bash
  sudo chown 1000 /srv/<app>/staging/.env && sudo chmod 600 /srv/<app>/staging/.env
  ```
  :::

- **Reachable by `deployer`:** `deployer` must be able to see that the file
  exists. Under `/home/<user>` it usually can't, because home directories
  are `750`. Check it:

  ::: step level=ask where=server verify="prints ok"
  ```bash
  sudo -u deployer test -f /srv/<app>/staging/.env && echo ok
  ```
  :::

  If it doesn't print `ok`, give traverse-only access to the blocking
  directory, for example:

  ::: step level=ask where=server
  ```bash
  sudo setfacl -m u:deployer:x /home/ubuntu
  ```
  :::

## 3.5 Check the conf and add Nginx {#conf-check}

Check that the conf parses. No image exists yet, so the expected result is
`exit 1` with `deploy: pull failed`. `exit 2` or `exit 3` means the conf
needs fixing.

::: step level=ask where=server verify="exit 1 with deploy: pull failed (exit 2 or 3 means the conf needs fixing)"
```bash
sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-0000000; echo "exit $?"
```
:::

Then add an Nginx `proxy_pass http://127.0.0.1:<PORT>;` site for the app,
if it doesn't have one yet. Nginx never needs to change on later deploys.

## 3.6 CI keys for this app {#ci-keys}

Each app repo gets its own key pair per environment. Don't reuse another
app's private keys: one key per repo lets you revoke a leaked key without
touching other apps.

Make them on your laptop, outside any git repository, no passphrase:

::: step level=run where=laptop
```bash
mkdir -p ~/deploy-keys && cd ~/deploy-keys
```
:::

::: step level=ask where=laptop
```bash
ssh-keygen -t ed25519 -N '' -C github-actions-<app>-staging -f <app>_staging
```
:::

::: step level=ask where=laptop
```bash
ssh-keygen -t ed25519 -N '' -C github-actions-<app>-production -f <app>_production
```
:::

Copy the public keys to the server, next to your edited `deploy.sh` from
[3.2](#register-app):

::: step level=ask where=server
```bash
scp -P <ssh-port> ~/deploy-keys/<app>_staging.pub ~/deploy-keys/<app>_production.pub ubuntu@<server-host>:~/docker-deploy-server/
```
:::

On the server, add them. This only adds keys (and reinstalls the same
`deploy.sh`, so run it where the edited one is):

::: step level=ask where=server
```bash
cd ~/docker-deploy-server && sudo ./server-setup.sh --skip-docker --skip-swap staging:<app>_staging.pub production:<app>_production.pub
```
:::

::: tip One server per environment, or both on one server
Pass only the keys for the environments that server hosts. If staging and
production share a server, leave out `production:<app>_production.pub`
until you go live in production ([4.3](./go-live#production)).
:::

Test the key from your laptop. It must reach `deploy.sh` and nothing else:

::: step level=ask where=server verify="prints deploy: expected: deploy <app> <tag> and exit 2"
```bash
ssh -i ~/deploy-keys/<app>_staging -p <ssh-port> -o IdentitiesOnly=yes deployer@<server-host> hello; echo "exit $?"
```
:::

Expected: `deploy: expected: deploy <app> <tag>` and `exit 2`.

## 3.7 GitHub environments {#github-settings}

::: agent
These GitHub settings are `ask`/`github`: give the developer the exact values, or run `gh variable set …` / `gh api` once they approve. Item 3 (pasting the private key into `DEPLOY_SSH_KEY`) is `never`, and so is deleting the private key files afterwards. The developer does both.
:::

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
   | `DEPLOY_KNOWN_HOSTS` | the verified `ssh-keyscan` line ([2.6](./server-setup#pin-host-key)); the same line every app on this server uses |
   | `DEPLOY_ENABLED` | `false` for now |

3. **Secret** `DEPLOY_SSH_KEY`: the full content of that environment's
   **private** key file (`<app>_staging` or `<app>_production`), including
   the BEGIN and END lines.

Then delete the private key files from your laptop. If a key is ever needed
again, make a new pair.

Your app's guide may list more GitHub settings (for example repository
variables the build reads).

## ✅ Checkpoint {#checkpoint}

On the server:

- `grep -A1 'case "$2" in' /opt/deploy/deploy.sh` lists your app.
- Each environment's `.env` has every key (the key check prints no `MISSING` and no duplicates), and its `PORT` equals the conf's `PORT`.
- `sudo -u deployer test -f <ENV_FILE> && echo ok` prints `ok` for each environment.
- The conf check `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-0000000` exits **1** with `deploy: pull failed` (not 2 or 3).
- `sudo cat /home/deployer/.ssh/authorized_keys` has this app's key line for each environment the server hosts.
- Nginx proxies the app's public URL to `127.0.0.1:<PORT>`.

From your laptop:

- `ssh -i ~/deploy-keys/<app>_staging ... deployer@<server-host> hello` prints `deploy: expected: deploy <app> <tag>` and exits 2.

On GitHub:

- Environments `staging` and `production` exist, each limited to its branch, with `DEPLOY_HOST`, `DEPLOY_SSH_PORT`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_ENABLED=false` and the `DEPLOY_SSH_KEY` secret.
- The private key files are deleted from your laptop.
