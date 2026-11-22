---
title: 7. Reference
order: 7
---
<script setup>
import { withBase } from 'vitepress'
</script>

# 7. Reference

## Files {#files}

| Where | What |
|---|---|
| kit `server/deploy.sh` | the deploy script; contains the app whitelist |
| kit `server/server-setup.sh` | one-time, idempotent server setup; also adds CI keys and reinstalls `deploy.sh` |
| kit `server/app.conf.template` | conf file template |
| server `~/docker-deploy-server/` | the copy `server-setup.sh` installs `deploy.sh` from; keep the current `deploy.sh` here |
| server `/opt/deploy/deploy.sh` | the installed deploy script (forced command for every CI key) |
| server `/opt/deploy/apps/<app>-<env>.conf` | per app and environment settings (root, `644`) |
| server `/opt/deploy/locks/<app>-<env>.lock` | one deploy at a time per app and environment |
| server `/opt/deploy/logs/deploy.log` | one line per deploy attempt |
| server `/home/deployer/.ssh/authorized_keys` | one line per CI key, pinned to its environment |
| server `ENV_FILE` from the conf | the app's server values, mounted at `/app/.env` (owned by the image's uid — `1000` for Node/Next.js, `101` for React — mode `600`) |
| app repo `Dockerfile`, `.dockerignore`, `.github/workflows/deploy.yml` | the app's pipeline files, from its app guide's kit |
| GitHub environments `staging`, `production` | `DEPLOY_HOST`, `DEPLOY_SSH_PORT`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_ENABLED` variables; `DEPLOY_SSH_KEY` secret. Express migrations add `RUN_MIGRATION`, `MIGRATION_SCRIPT`, `MIGRATION_ARGS` and `POST_MIGRATION_STEPS` ([Database Migrations](./express/database-migrations#variables)) |

## The conf file {#conf}

`/opt/deploy/apps/<app>-<env>.conf`, read as data (never run as a script).
`KEY=value`, no spaces around `=`, no quotes; blank lines and `#` comments
are allowed. The six keys below are required, each exactly once.
`BACKUP_PORT` is optional:

| Key | Rule |
|---|---|
| `IMAGE` | lowercase image repository, no tag, e.g. `ghcr.io/acme/orders-api` |
| `CONTAINER` | container name, lowercase, e.g. `orders-api-staging` |
| `PORT` | 1–65535; must equal `PORT` in the `.env` |
| `BACKUP_PORT` | optional; 1–65535 and different from `PORT`; unique on the server, with nothing listening on it; turns on [Zero-Downtime Deploys](./zero-downtime) |
| `ENV_FILE` | absolute path (letters, digits, `.`, `_`, `-`, `/`) to a regular file that `deployer` can see |
| `MEMORY` | a non-zero number ending in `k`, `m` or `g`, e.g. `384m` |
| `KEEP_IMAGES` | 1 or more |

## What each deploy runs {#docker-run}

For an app without `BACKUP_PORT`, `deploy.sh` stops and removes the old
container, then runs:

```bash
docker run -d --name <CONTAINER> \
  --init \
  --network host \
  --restart unless-stopped \
  --memory <MEMORY> --memory-swap <MEMORY> \
  --log-opt max-size=10m --log-opt max-file=3 \
  -v <ENV_FILE>:/app/.env:ro \
  --label deploy.app=<app> \
  --label deploy.env=<env> \
  --label deploy.tag=<tag> \
  <IMAGE>:<tag>
```

`--memory-swap` equal to `--memory` means no swap on top of the cap. Do not
hand-edit or hand-start containers; deploy a tag instead.

The whole deploy, in order:

1. Check the request: `deploy <app> <tag>`, app on the whitelist, tag
   `staging-` or `production-` followed by 7–40 hex characters, and over
   SSH, the tag's environment equal to the key's pinned environment.
2. Read and check `/opt/deploy/apps/<app>-<env>.conf`.
3. Take the lock for that app and environment (wait up to 600 s).
4. `docker pull <IMAGE>:<tag>`.
5. Stop and remove the old container; `docker run` the new one. With
   `BACKUP_PORT`, steps 5 and 6 differ: see
   [With BACKUP_PORT](#docker-run-zero-downtime).
6. **Verify:** request `http://127.0.0.1:<PORT>/` every 2 s, up to 30 s,
   until any HTTP status comes back (a 404 or 500 counts as an answer). Then
   wait 10 s and require the container to be running with 0 restarts. On
   failure, print the container's last 50 log lines.
7. **Prune:** keep the newest `KEEP_IMAGES` tags of this app and environment
   by creation time, never remove an image a container uses, and remove
   dangling images.
8. Append the result to `deploy.log` and print
   `deploy: <app> <env> <tag> ok`.

### With BACKUP_PORT {#docker-run-zero-downtime}

With `BACKUP_PORT` in the conf, `deploy.sh` starts each container on the port
it is given, so the same image serves both. The main container, named
`<CONTAINER>`, gets `-e PORT=<PORT>`; the backup, named
`<CONTAINER>-backup`, gets `-e PORT=<BACKUP_PORT>` and
`--label deploy.role=backup`. The rest of the `docker run` is as above, and
both containers get the same `deploy.app`, `deploy.env` and `deploy.tag`
labels.

The deploy then runs in this order:

1. Pull the image.
2. Check that nothing answers on `BACKUP_PORT`. Start the new version as
   `<CONTAINER>-backup` on `BACKUP_PORT` and verify it there. Users still
   reach only the old container. On failure, remove the backup: the old
   container keeps serving, and the deploy exits 1 at `backup`. If another
   process answers on `BACKUP_PORT`, nothing is started and it exits 1 at
   `backup-port`.
3. `docker stop` the main container (up to `DEPLOY_STOP_TIMEOUT`, default
   `10` s) and `docker rm` it. Nginx gets no answer on the main port and
   sends every request to the backup.
4. Start the new version as `<CONTAINER>` on `PORT` and verify it there. On
   failure, stop the failed main and keep it, so `docker logs <CONTAINER>`
   still works. The backup keeps serving; the deploy exits 1 at `main` and
   names the tag the backup serves.
5. Wait `DEPLOY_DRAIN` seconds (default `5`), so the backup finishes its open
   requests.
6. `docker stop` and `docker rm` the backup.
7. Prune and log as before.

If `<CONTAINER>-backup` exists when a deploy starts (an earlier deploy was
killed, or failed at `main`), the deploy decides which container serves.
Healthy means running and answering HTTP on its port.

- **Main healthy:** the backup is stale. Stop and remove it, print a warning,
  and continue with the normal order.
- **Main not healthy, backup healthy on `BACKUP_PORT`** (the state after
  `fail:main`): the backup is what serves. Skip the backup steps, remove the
  old main, then start and verify the new main, drain and remove the backup.
  Nginx stays on the backup until the new main answers, so the recovery has
  no gap.
- **Neither healthy:** nothing is serving anyway. Remove both and run the
  normal order, with a warning.

## What each migration runs {#migrate-run}

`migrate <app> <tag> <script> [arg …]` takes the same app allowlist and tag
rule as `deploy`. A script name matches `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$`
(no dots or slashes), each argument matches
`^[A-Za-z0-9._,:=+@-]{1,200}$`, and there are at most 20 arguments.

It takes the same per-app, per-environment lock, pulls the image, then
runs the script in a one-off container with the app's configuration:

```bash
docker run -d --name <CONTAINER>-migrate \
  --init \
  --network host \
  --memory <MEMORY> --memory-swap <MEMORY> \
  --log-opt max-size=10m --log-opt max-file=3 \
  -v <ENV_FILE>:/app/.env:ro \
  --label deploy.app=<app> \
  --label deploy.env=<env> \
  --label deploy.tag=<tag> \
  --label deploy.role=migrate \
  <IMAGE>:<tag> \
  node dist/scripts/<script>.js <args>
```

It follows the container's output to the SSH session, waits for its exit
code and removes the container. A dropped SSH session does not stop it: the
script runs to the end and keeps the lock, so a deploy meanwhile waits.
There is no `--rm`, so a hard failure leaves `<CONTAINER>-migrate` behind;
the next run refuses to start and names the `docker rm` to run after
checking its logs. The outcome goes to `deploy.log` as
`result=migrate:<script>:ok` or `result=migrate:<script>:fail:<step>`.

## `deploy.sh` exit codes {#exit-codes}

| Code | Meaning | Messages |
|---|---|---|
| `0` | deployed and verified | `deploy: <app> <env> <tag> ok`, `migrate: <app> <env> <tag> <script> ok` |
| `1` | pull, run or verify failed | `pull failed`, `run failed`, `verify failed`, `backup-port failed`, `backup failed`, `stop-old failed`, `main failed`, `cannot open lock`, `migrate: <script> exited <n>`, `migration container <name> already exists: check docker logs <name>, then docker rm <name>` |
| `2` | invalid request or conf | `expected: deploy <app> <tag>`, `unknown command`, `unknown app`, `invalid tag`, `... but --env pins ...`, `forced command must pin --env ...`, `unexpected arguments after --env`, `--env needs a value`, `invalid --env ...`, `invalid script name`, `invalid argument`, `too many arguments`, `conf: ...` |
| `3` | no conf for this app and environment | `conf not found`, `conf not readable` |
| `4` | lock timeout (another deploy or migration is running) | `timed out after 600s waiting for ...` |

## Known limitations {#known-limitations}

- Without `BACKUP_PORT`, a deploy has a gap of a few seconds while the old container stops and the new one starts. With it, see [Zero-Downtime Deploys](./zero-downtime).
- The verify step only checks that `/` answers HTTP; it doesn't check pages or the services the app calls.
- No automatic rollback: a failed verify leaves the failed container in place.
- `NODE_ENV` is `production` in every environment.
- Migrations run only when RUN_MIGRATION is on, and there is no "down" step: a migration can't be rolled back by the pipeline.
- Staging and production images share one GHCR package, and tags can be pushed again (a "Re-run all jobs" rebuilds under the same tag).
- The server's GHCR access depends on one personal token with an expiry date.

## Download {#download}

<a :href="withBase('/downloads/deploy-pipeline-kit.zip')" download>deploy-pipeline-kit.zip</a>. See
[Download the kit](./#download-the-kit) for its contents.
