---
title: 5. Everyday Use
order: 5
---
# 5. Everyday Use

## At a glance {#at-a-glance}

::: v-pre
| Task | How |
|---|---|
| Deploy to staging | push to your staging branch (e.g. `staging`) |
| Deploy to production | merge to your production branch (e.g. `main`) |
| Change a server value | edit the server's `.env`, then redeploy the running tag ([below](#change-server-value)) |
| Rollback (server) | `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<older-sha7>` (or `production-…`) |
| Rollback (GitHub) | open an older successful run, open its **deploy** job → "Re-run this job". Don't use "Re-run all jobs" |
| What's running | `docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'` |
| Which tag a container runs | `docker inspect -f '{{index .Config.Labels "deploy.tag"}}' <app>-staging` |
| App logs | `docker logs -f <app>-staging` |
| Deploy history | `tail -n 20 /opt/deploy/logs/deploy.log` |
| Memory / CPU | `docker stats --no-stream` |
| Images kept on the server | `docker images <IMAGE>` (the conf's `IMAGE`) |
| Migrations | run by hand; keep them backward-compatible |
:::

## Deploy {#deploy}

Push to the branch. The build job builds the image and pushes
`<env>-<sha7>` (and `<env>-latest`). The deploy job then runs
`deploy <app> <env>-<sha7>` on the server over SSH. A red deploy job prints
`deploy.sh`'s message. If the pull fails, the old container keeps running.
If `run failed`, the old container is already removed and no new one is
running. The app is down until a good deploy.

If the new container started but didn't come up, the job also prints its
last 50 log lines. The old container is already gone and the broken one
stays in place, so the app is down until you fix it or roll back.

A newer push to the same branch cancels a build that is still running.
Deploys of the same app and environment never overlap: the second waits.

## Rollback {#rollback}

Every image tag the server still has, or that GHCR still has, can be
deployed again. List the tags on the server, newest first:

```bash
docker images <IMAGE> --format '{{.Tag}}\t{{.CreatedAt}}' | grep '^staging-'
```

A rollback replaces the current container, and its logs go with it. Save
them first if you need them:

```bash
docker logs <app>-staging > ~/<app>-staging-$(date +%F-%H%M).log 2>&1
```

Deploy an older one:

```bash
sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<older-sha7>; echo "exit $?"
```

Or on GitHub: open an older successful run, open its **deploy** job, and
choose "Re-run this job". That redeploys that run's image as it is. "Re-run
all jobs" would build that commit again and push it under the old tag, so
don't use it for a rollback.

A rollback brings back the older code, **not the server `.env`**. The
container reads the current `.env` at start. If the older code needs a value
you have since removed or renamed, put it back first. It never rolls back
the database either.

::: warning Rollbacks are temporary
A rollback lasts until the next push to that branch, which builds and
deploys the branch as it is. To make it stick, revert the bad commit.
:::

## Change a server value {#change-server-value}

Server values live only in the `.env` at the conf's `ENV_FILE`. The app
reads it when the container starts.

1. Edit the file on the server. Keep it owned by uid `1000`, mode `600`.
   If you change `PORT`, change the conf's `PORT` and the Nginx
   `proxy_pass` to match.
2. Redeploy the tag that is running. Find it, then deploy it again:

   ```bash
   docker inspect -f '{{index .Config.Labels "deploy.tag"}}' <app>-staging
   ```

   ```bash
   sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<sha7>; echo "exit $?"
   ```

This replaces the container and runs the same checks as any deploy.

## Logs and history {#logs-and-history}

- **App logs:** `docker logs -f <app>-staging`. They rotate automatically,
  3 files of 10 MB per container, and are lost when the container is
  replaced on the next deploy.
- **Deploy history:** `/opt/deploy/logs/deploy.log` has one line per deploy
  attempt that got past the checks of the request and the conf:

  ```text
  2026-11-06T10:15:02Z app=orders-api env=staging tag=staging-1a2b3c4 result=ok
  2026-11-06T11:02:47Z app=orders-api env=staging tag=staging-5d6e7f8 result=fail:verify
  ```

  `result` is `ok`, or `fail:` followed by the step that failed (`lock`,
  `pull`, `run`, `verify`). Requests rejected earlier (exit 2 and 3) aren't
  logged there; CI shows them.

## Images on the server {#images}

After each successful deploy, the server keeps the newest `KEEP_IMAGES`
images of that app and environment (by creation time), plus any image a
container still uses, and removes the rest. Deploying a tag the server no
longer has pulls it from GHCR again.
