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
are allowed. All six keys, each exactly once:

| Key | Rule |
|---|---|
| `IMAGE` | lowercase image repository, no tag, e.g. `ghcr.io/acme/orders-api` |
| `CONTAINER` | container name, lowercase, e.g. `orders-api-staging` |
| `PORT` | 1–65535; must equal `PORT` in the `.env` |
| `ENV_FILE` | absolute path (letters, digits, `.`, `_`, `-`, `/`) to a regular file that `deployer` can see |
| `MEMORY` | a non-zero number ending in `k`, `m` or `g`, e.g. `384m` |
| `KEEP_IMAGES` | 1 or more |

## What each deploy runs {#docker-run}

`deploy.sh` stops and removes the old container, then runs:

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
5. Stop and remove the old container; `docker run` the new one.
6. **Verify:** request `http://127.0.0.1:<PORT>/` every 2 s, up to 30 s,
   until any HTTP status comes back (a 404 or 500 counts as an answer). Then
   wait 10 s and require the container to be running with 0 restarts. On
   failure, print the container's last 50 log lines.
7. **Prune:** keep the newest `KEEP_IMAGES` tags of this app and environment
   by creation time, never remove an image a container uses, and remove
   dangling images.
8. Append the result to `deploy.log` and print
   `deploy: <app> <env> <tag> ok`.

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
| `1` | pull, run or verify failed | `pull failed`, `run failed`, `verify failed`, `cannot open lock`, `migrate: <script> exited <n>`, `migration container <name> already exists: check docker logs <name>, then docker rm <name>` |
| `2` | invalid request or conf | `expected: deploy <app> <tag>`, `unknown command`, `unknown app`, `invalid tag`, `... but --env pins ...`, `forced command must pin --env ...`, `unexpected arguments after --env`, `--env needs a value`, `invalid --env ...`, `invalid script name`, `invalid argument`, `too many arguments`, `conf: ...` |
| `3` | no conf for this app and environment | `conf not found`, `conf not readable` |
| `4` | lock timeout (another deploy or migration is running) | `timed out after 600s waiting for ...` |

## Known limitations {#known-limitations}

- No zero-downtime deploys: there's a 1–2 s gap while the old container stops and the new one starts.
- The verify step only checks that `/` answers HTTP; it doesn't check pages or the services the app calls.
- No automatic rollback: a failed verify leaves the failed container in place.
- `NODE_ENV` is `production` in every environment.
- Migrations run only when RUN_MIGRATION is on, and there is no "down" step: a migration can't be rolled back by the pipeline.
- Staging and production images share one GHCR package, and tags can be pushed again (a "Re-run all jobs" rebuilds under the same tag).
- The server's GHCR access depends on one personal token with an expiry date.

## Download {#download}

<a :href="withBase('/downloads/deploy-pipeline-kit.zip')" download>deploy-pipeline-kit.zip</a>. See
[Download the kit](./#download-the-kit) for its contents.
