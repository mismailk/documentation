---
title: 3. Server Setup
order: 3
---
# 3. Server Setup

::: tip Once per server
Skip this stage if the server already runs the pipeline for another app; go
to [4. Add Your App](./add-your-app).
:::

You need `sudo` on the server (Ubuntu, x86_64). The setup does **not** touch
Nginx, databases, pm2 or anything else already running.

## 3.1 What `server-setup.sh` does {#what-server-setup-does}

1. Installs Docker Engine (`docker-ce`) from Docker's official apt repository.
2. Adds a 2 GB swap file, but only if the server has no swap and has at least
   3 GiB free on `/`.
3. Creates the system user `deployer` (in the `docker` group, password
   locked) and adds `ubuntu` to the `docker` group.
4. Creates `/opt/deploy/{apps,locks,logs}` and installs
   `/opt/deploy/deploy.sh`.
5. Authorizes each CI public key you pass as `staging:<file>` or
   `production:<file>`, pinned to that environment:

   ```text
   restrict,command="/opt/deploy/deploy.sh --env staging" ssh-ed25519 AAAA... github-actions-staging
   ```

It is safe to run again: it skips what exists and only adds new keys.

## 3.2 Pre-checks on the server {#pre-checks}

Each of these should print nothing (otherwise see the note below):

```bash
snap list docker 2>/dev/null
```

```bash
dpkg -l | grep -E '^ii +docker\.io'
```

::: warning
The script refuses to replace a snap or `docker.io` Docker. Migrate it by
hand first, or run with `--skip-docker` if a `docker-ce` install is already
there.
:::

This must succeed (a broken unrelated apt repository stops the install):

```bash
sudo apt-get update
```

These must allow `deployer` to log in with a key:

```bash
sudo sshd -T | grep -Ei '^(allowusers|allowgroups|usepam) '
```

If you see `allowusers`/`allowgroups`, add `deployer` there and reload sshd.
`usepam` must be `yes`.

## 3.3 Make the CI keys (on your laptop) {#make-ci-keys}

One key pair per environment, outside any git repository, no passphrase:

```bash
mkdir -p ~/deploy-keys && cd ~/deploy-keys
```

```bash
ssh-keygen -t ed25519 -N '' -C github-actions-staging -f deploy_staging
```

```bash
ssh-keygen -t ed25519 -N '' -C github-actions-production -f deploy_production
```

The private files (`deploy_staging`, `deploy_production`) go into GitHub
later ([4.6](./add-your-app#github-settings)), and then you delete them.

::: tip One server per environment, or both on one server
Pass only the keys for the environments that server hosts. If staging and
production share a server, add the production key only when you are ready to
go live in production ([5.3](./go-live#production)).
:::

## 3.4 Copy the scripts and run the setup {#run-setup}

From the unzipped `docker-deploy-kit/` folder on your laptop (see
[Download the kit](./#download-the-kit)):

```bash
ssh -p <ssh-port> ubuntu@<server-host> mkdir -p docker-deploy-server
```

```bash
scp -P <ssh-port> server/*.sh server/app.conf.template ~/deploy-keys/deploy_staging.pub ubuntu@<server-host>:~/docker-deploy-server/
```

On the server:

```bash
cd ~/docker-deploy-server && chmod +x *.sh
```

```bash
sudo ./server-setup.sh staging:deploy_staging.pub
```

Options: `--skip-docker` (keep an existing `docker-ce`), `--skip-swap`.
Log out and back in afterwards so `ubuntu` can use `docker` without `sudo`.

Check:

```bash
id deployer && ls -l /opt/deploy && sudo cat /home/deployer/.ssh/authorized_keys
```

## 3.5 Let the server pull images (GHCR login) {#ghcr-login}

The server pulls private images from `ghcr.io` as `deployer`, with a
**classic** personal access token that has only the `read:packages` scope.
The account must have read access to the app repositories.

1. GitHub → avatar → Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token (classic). Tick only
   `read:packages`.
2. **Write down the expiry date.**
3. On the server, paste the token at the password prompt:

```bash
sudo -iu deployer docker login ghcr.io -u <github-user>
```

One login serves every app on the server.

::: danger Token expiry
When the token expires, every deploy on the server fails at `docker pull`.
Renew it before then and run the login again.
:::

## 3.6 Firewall {#firewall}

With host networking, the app ports are exposed exactly like a process
started by pm2 or `node`. Only Nginx should reach them:

```bash
sudo ufw status verbose
```

There must be no `ALLOW` for your app ports. Check the cloud firewall too.

## 3.7 Pin the server's host key and test the key {#pin-host-key}

On your laptop, get the server's public host key line. This becomes
`DEPLOY_KNOWN_HOSTS` in GitHub:

```bash
ssh-keyscan -p <ssh-port> -t ed25519 <server-host>
```

Keep the line exactly as printed. On a non-22 port it starts with
`[<server-host>]:<ssh-port>`. Verify it against the server before trusting
it. These two fingerprints must match:

```bash
ssh-keyscan -p <ssh-port> -t ed25519 <server-host> 2>/dev/null | ssh-keygen -lf -
```

```bash
ssh -p <ssh-port> ubuntu@<server-host> ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Then confirm the CI key can only run `deploy.sh`:

```bash
ssh -i ~/deploy-keys/deploy_staging -p <ssh-port> -o IdentitiesOnly=yes deployer@<server-host> hello; echo "exit $?"
```

Expected: `deploy: expected: deploy <app> <tag>` and `exit 2`.

## ✅ Checkpoint {#checkpoint}

On the server:

- `id deployer` lists the `docker` group.
- `ls -l /opt/deploy` shows `deploy.sh`, `apps/`, `locks/`, `logs/`.
- `sudo cat /home/deployer/.ssh/authorized_keys` has one `restrict,command="/opt/deploy/deploy.sh --env <env>"` line per environment this server hosts.
- `sudo -iu deployer docker login ghcr.io -u <github-user>` succeeded, and the token's expiry date is written down.
- `sudo ufw status verbose` has no `ALLOW` for the app ports.

From your laptop:

- The host key fingerprints match, and the `ssh-keyscan` line is saved for `DEPLOY_KNOWN_HOSTS`.
- `ssh -i ~/deploy-keys/deploy_staging ... deployer@<server-host> hello` prints `deploy: expected: deploy <app> <tag>` and exits 2.
