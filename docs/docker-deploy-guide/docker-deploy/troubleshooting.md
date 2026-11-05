---
title: 7. Troubleshooting
order: 7
---
# 7. Troubleshooting

::: v-pre
| Symptom | Likely cause | Fix |
|---|---|---|
| CI `deploy` step exit **255** | CI can't log in: key not in `authorized_keys`, `AllowUsers` blocks `deployer`, incomplete `DEPLOY_SSH_KEY`, or wrong host/port | re-check [3.2](./server-setup#pre-checks), [3.4](./server-setup#run-setup) and [4.6](./add-your-app#github-settings) |
| `Host key verification failed` | the server's host key changed, or `DEPLOY_KNOWN_HOSTS` is wrong or in the wrong `[host]:port` form | verify the fingerprint on the server, then update the variable. Never disable host key checking |
| build step `Compute tag` fails, `is not mapped to an environment` | the workflow ran for a branch that isn't one of the two branch names in its tag step (the `branches:` trigger and the step's `STAGING_BRANCH` / `PRODUCTION_BRANCH` were edited apart) | make both use the same two branch names in `deploy.yml` ([4.1](./add-your-app#pick-your-values)) |
| exit **2**, `invalid tag` | the tag isn't `staging-<sha7>` or `production-<sha7>` (branch-named tags such as `main-…` are rejected) | deploy an environment tag from the build job's log |
| exit **2**, `unknown app` | app not whitelisted on the server | [4.4](./add-your-app#register-app) |
| exit **2**, `--env pins staging` | a `production-` tag sent with the staging key (or the reverse) | check the environment's `DEPLOY_SSH_KEY` |
| exit **2**, `conf: ...` | conf file syntax or value error, or `ENV_FILE` not reachable by `deployer` | [4.5](./add-your-app#conf-and-env) |
| exit **3** | no conf for this app+environment on this server | create `/opt/deploy/apps/<app>-<env>.conf` |
| exit **1**, `pull failed`, `denied`/`unauthorized` | GHCR token expired, or the account can't read the repo | [3.5](./server-setup#ghcr-login), then log in again |
| exit **1**, `pull failed`, `manifest unknown` | the tag doesn't exist | check the build job |
| exit **1**, `verify failed`, `EADDRINUSE` in the logs | the old process still holds the port | stop it ([5.2](./go-live#first-staging-deploy)) and deploy again |
| exit **1**, `verify failed`, `ENOENT` | a runtime file is missing from the image | add it to `{{RUNTIME_COPY_LINES}}` ([4.1](./add-your-app#pick-your-values)) |
| exit **1**, `verify failed`, `OOMKilled=true` | the memory cap is too low | raise `MEMORY` in the conf |
| exit **4** | another deploy of the same app+environment is still running | wait, or look for a hung `deploy.sh` with `ps aux` |
| disk full | too many images | lower `KEEP_IMAGES`, and check `docker system df` |
:::

The failed container stays in place so you can inspect it with
`docker logs <container>` and `docker inspect <container>`.
