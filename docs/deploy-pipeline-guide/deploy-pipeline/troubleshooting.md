---
title: 6. Troubleshooting
order: 6
---
# 6. Troubleshooting

Every `deploy.sh` message starts with `deploy:`. In CI it is in the
**deploy** job's "Deploy" step; on the server it is printed by the
`sudo -u deployer /opt/deploy/deploy.sh ...` command. Exit codes are listed
in [7. Reference](./reference#exit-codes). Problems specific to your kind of
app are in your app's guide.

## CI and deploy failures {#deploy-failures}

| Symptom | Likely cause | Fix |
|---|---|---|
| CI "Deploy" step exit **255** | CI can't log in: key not in `authorized_keys`, `AllowUsers` blocks `deployer`, incomplete `DEPLOY_SSH_KEY`, or wrong `DEPLOY_HOST` / `DEPLOY_SSH_PORT` | re-check [2.2](./server-setup#pre-checks) and [3.6](./add-an-app#ci-keys), and test the key with `hello` |
| `Host key verification failed` | the server's host key changed, or `DEPLOY_KNOWN_HOSTS` is wrong or in the wrong `[host]:port` form | verify the fingerprint on the server ([2.6](./server-setup#pin-host-key)), then update the variable. Never turn off host key checking |
| "Compute tag" fails with `is not mapped to an environment` | the workflow ran for a branch that isn't one of the two in its "Compute tag" step (the `branches:` trigger and `STAGING_BRANCH` / `PRODUCTION_BRANCH` were edited apart) | make both use the same two branch names in `deploy.yml` |
| "Compute tag" fails with `STAGING_BRANCH and PRODUCTION_BRANCH are both ...` | both branch names in `deploy.yml` are the same | pick two different branches |
| deploy job shows `deploy disabled for this environment` | `DEPLOY_ENABLED` isn't exactly `true` in that GitHub environment | set it once the first manual deploy is done ([4.2](./go-live#retire-old-process)) |
| exit **2**, `invalid tag` | the tag isn't `staging-<sha7>` or `production-<sha7>` (branch-named tags such as `main-…` and the `-latest` tags are rejected) | deploy an environment tag from the build job's log |
| exit **2**, `unknown app` | the app isn't on the server's whitelist | [3.2](./add-an-app#register-app) |
| exit **2**, `tag ... deploys to production, but --env pins staging` (or the reverse) | the environment's `DEPLOY_SSH_KEY` is the other environment's key | put the right private key in each GitHub environment |
| exit **2**, `forced command must pin --env ...` | the key's `authorized_keys` line was edited by hand and lost its `--env` | remove the line and add the key again with `server-setup.sh` ([3.6](./add-an-app#ci-keys)) |
| exit **2**, `conf: ...` (`malformed line`, `unknown key`, `missing key`, `invalid PORT`, …) | a syntax or value error in the conf | fix the conf ([3.3](./add-an-app#conf-file)): `KEY=value`, no spaces, no quotes, all six keys once |
| exit **2**, `conf: ENV_FILE is not a regular file` | the `.env` path is wrong, or `deployer` can't reach it (often a home directory with mode `750`) | `sudo -u deployer test -f <ENV_FILE> && echo ok`, then `setfacl` traverse access ([3.4](./add-an-app#env-access)) |
| exit **3**, `conf not found` | no conf for this app and environment on this server | create `/opt/deploy/apps/<app>-<env>.conf` ([3.3](./add-an-app#conf-file)) |
| exit **1**, `pull failed`, `denied` / `unauthorized` | the server's GHCR token expired, or its account can't read the repo | new token, log in again ([2.4](./server-setup#ghcr-login)) |
| exit **1**, `pull failed`, `manifest unknown` | that tag doesn't exist in GHCR | check the build job's log for the tag it pushed |
| exit **1**, `run failed` | `docker run` itself failed; its error is printed just above | read Docker's message; then deploy again |
| exit **1**, `verify failed`, `EADDRINUSE` in the logs | the old process or another app still holds the port | stop it ([4.2](./go-live#first-staging-deploy)), or give this app a free port, and deploy again |
| exit **1**, `verify failed`, the logs show the app listening on another port | `PORT` in the `.env` and `PORT` in the conf differ, or the `.env` has no `PORT` | make them equal; Nginx proxies to the conf's port |
| exit **1**, `verify failed`, the logs name `/app/.env` and permission | the container's `node` user (uid 1000) can't read the `.env` | `sudo chown 1000 <ENV_FILE> && sudo chmod 600 <ENV_FILE>` |
| exit **1**, `verify failed` after `container state '...', expected 'true 0'`, and `docker inspect` shows `oom=true` ([below](#inspect)) | the app went over its memory cap | raise `MEMORY` in the conf (and check `docker stats` for a leak) |
| exit **1**, `verify failed`, other errors in the 50 log lines | the app crashed while starting | fix the app (your app's guide lists the usual causes); the next push deploys it |
| exit **4**, `timed out after 600s waiting for ...` | another deploy of the same app and environment is still running | wait, or look for a hung `deploy.sh` with `ps aux` |
| the app calls the wrong service, often `http://localhost:3000` | a URL is missing from the `.env` and the code falls back to a default; under host networking that reaches whatever listens on that port on the server | add the value and run the key check ([3.4](./add-an-app#check-keys)) |
| disk full | too many images or build leftovers | lower `KEEP_IMAGES`, and check `docker system df` |

## Inspect a failed container {#inspect}

After a failed verify, the failed container stays in place so you can look
at it:

::: step level=ask where=server
```bash
docker logs --tail 200 <app>-staging
```
:::

::: step level=ask where=server
```bash
docker inspect -f '{{.State.Status}} restarts={{.RestartCount}} oom={{.State.OOMKilled}} exit={{.State.ExitCode}}' <app>-staging
```
:::

To look inside the image without starting the app:

::: step level=ask where=server
```bash
docker run --rm --entrypoint sh <IMAGE>:staging-<sha7> -c 'ls -la /app'
```
:::

Recover by fixing the cause and deploying again, or by rolling back to the
last good tag ([5. Everyday Use](./everyday-use#rollback)).
