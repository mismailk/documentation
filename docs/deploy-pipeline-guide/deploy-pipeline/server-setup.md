---
title: 2. Server Setup
order: 2
---
# 2. Server Setup

::: tip Once per server
Skip this stage if the server already runs the pipeline for another app; go
to [3. Add an App to the Server](./add-an-app).
:::

You need `sudo` on the server (Ubuntu, x86_64). The setup does **not** touch
Nginx, databases, pm2 or anything else already running.

## 2.1 What `server-setup.sh` does {#what-server-setup-does}

1. Installs Docker Engine (`docker-ce`) from Docker's official apt repository.
2. Adds a 2 GB swap file, but only if the server has no swap and has at least
   3 GiB free on `/`.
3. Creates the system user `deployer` (in the `docker` group, password
   locked) and adds `ubuntu` to the `docker` group.
4. Creates `/opt/deploy/{apps,locks,logs}` and installs
   `/opt/deploy/deploy.sh` from the folder the script runs in.
5. Authorizes each CI public key you pass as `staging:<file>` or
   `production:<file>`, pinned to that environment
   ([3.6](./add-an-app#ci-keys)):

   ```text
   restrict,command="/opt/deploy/deploy.sh --env staging" ssh-ed25519 AAAA... github-actions-<app>-staging
   ```

It is safe to run again: it skips what exists, reinstalls `deploy.sh` and
only adds new keys.

## 2.2 Pre-checks on the server {#pre-checks}

Each of these should print nothing (otherwise see the note below):

::: step level=ask where=server verify="prints nothing"
```bash
snap list docker 2>/dev/null
```
:::

::: step level=ask where=server verify="prints nothing"
```bash
dpkg -l | grep -E '^ii +docker\.io'
```
:::

::: warning
The script refuses to replace a snap or `docker.io` Docker. Migrate it by
hand first, or run with `--skip-docker` if a `docker-ce` install is already
there.
:::

This must succeed (a broken unrelated apt repository stops the install):

::: step level=ask where=server verify="succeeds with no errors"
```bash
sudo apt-get update
```
:::

These must allow `deployer` to log in with a key:

::: step level=ask where=server verify="usepam yes; deployer allowed if allowusers/allowgroups is set"
```bash
sudo sshd -T | grep -Ei '^(allowusers|allowgroups|usepam) '
```
:::

If you see `allowusers`/`allowgroups`, add `deployer` there and reload sshd.
`usepam` must be `yes`.

## 2.3 Copy the scripts and run the setup {#run-setup}

From the unzipped `deploy-pipeline-kit/` folder on your laptop (see
[Download the kit](./#download-the-kit)):

::: step level=ask where=server
```bash
ssh -p <ssh-port> ubuntu@<server-host> mkdir -p docker-deploy-server
```
:::

::: step level=ask where=server
```bash
scp -P <ssh-port> server/*.sh server/app.conf.template ubuntu@<server-host>:~/docker-deploy-server/
```
:::

On the server:

::: step level=ask where=server
```bash
cd ~/docker-deploy-server && chmod +x *.sh
```
:::

::: step level=ask where=server
```bash
sudo ./server-setup.sh
```
:::

Options: `--skip-docker` (keep an existing `docker-ce`), `--skip-swap`.
CI keys are added per app later ([3.6](./add-an-app#ci-keys)). Log out and
back in afterwards so `ubuntu` can use `docker` without `sudo`.

Keep `~/docker-deploy-server/` on the server. Every later run of
`server-setup.sh` reinstalls the `deploy.sh` beside it, so that folder must
always hold the current `deploy.sh`.

Check:

::: step level=ask where=server verify="deployer is in the docker group; deploy.sh, apps/, locks/, logs/ exist"
```bash
id deployer && ls -l /opt/deploy
```
:::

::: step level=ask where=server verify="prints deploy: expected: deploy <app> <tag> and exit 2"
```bash
sudo -u deployer /opt/deploy/deploy.sh hello; echo "exit $?"
```
:::

Expected: `deploy: expected: deploy <app> <tag>` and `exit 2`.

## 2.4 Let the server pull images (GHCR login) {#ghcr-login}

The server pulls private images from `ghcr.io` as `deployer`, with a
**classic** personal access token that has only the `read:packages` scope.
The account must have read access to the app repositories.

1. GitHub → avatar → Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token (classic). Tick only
   `read:packages`.
2. **Write down the expiry date.**
3. On the server, paste the token at the password prompt:

::: agent
The token is a secret. Never ask the developer to paste it into the chat. They run the login themselves and type the token at the password prompt.
:::

::: step level=never where=server verify="login succeeded"
```bash
sudo -iu deployer docker login ghcr.io -u <github-user>
```
:::

One login serves every app on the server.

::: danger Token expiry
When the token expires, every deploy on the server fails at `docker pull`.
Renew it before then and run the login again.
:::

## 2.5 Firewall {#firewall}

With host networking, the app ports are exposed exactly like a process
started by pm2 or `node`. Only Nginx should reach them:

::: step level=ask where=server verify="no ALLOW for the app ports"
```bash
sudo ufw status verbose
```
:::

There must be no `ALLOW` for your app ports. Check the cloud firewall too.

## 2.6 Pin the server's host key {#pin-host-key}

On your laptop, get the server's public host key line. This becomes
`DEPLOY_KNOWN_HOSTS` in GitHub, for every app on this server:

::: step level=ask where=laptop
```bash
ssh-keyscan -p <ssh-port> -t ed25519 <server-host>
```
:::

Keep the line exactly as printed. On a non-22 port it starts with
`[<server-host>]:<ssh-port>`. Verify it against the server before trusting
it. These two fingerprints must match:

::: step level=ask where=laptop verify="fingerprint matches the server's own"
```bash
ssh-keyscan -p <ssh-port> -t ed25519 <server-host> 2>/dev/null | ssh-keygen -lf -
```
:::

::: step level=ask where=server verify="fingerprint matches the ssh-keyscan one"
```bash
ssh -p <ssh-port> ubuntu@<server-host> ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```
:::

## ✅ Checkpoint {#checkpoint}

On the server:

- `id deployer` lists the `docker` group.
- `ls -l /opt/deploy` shows `deploy.sh`, `apps/`, `locks/`, `logs/`.
- `sudo -u deployer /opt/deploy/deploy.sh hello` prints `deploy: expected: deploy <app> <tag>` and exits 2.
- `sudo -iu deployer docker login ghcr.io -u <github-user>` succeeded, and the token's expiry date is written down.
- `sudo ufw status verbose` has no `ALLOW` for the app ports.

From your laptop:

- The host key fingerprints match, and the `ssh-keyscan` line is saved for `DEPLOY_KNOWN_HOSTS`.
