---
title: 6. Everyday Use
order: 6
---
# 6. Everyday Use

::: v-pre
| Task | How |
|---|---|
| Deploy to staging | push to your staging branch (e.g. `staging`) |
| Deploy to production | merge to your production branch (e.g. `main`) |
| Rollback (server) | `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<older-sha7>` (or `production-…`) |
| Rollback (GitHub) | open an older successful run, open its **deploy** job → "Re-run this job". Don't use "Re-run all jobs" |
| What's running | `docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'` |
| App logs | `docker logs -f <app>-staging` |
| Deploy history | `tail -n 20 /opt/deploy/logs/deploy.log` |
| Memory / CPU | `docker stats --no-stream` |
| Migrations | run by hand, as before; keep them backward-compatible |
:::

::: warning Rollbacks are temporary
A rollback lasts until the next push to that branch. To make it stick,
revert the bad commit.
:::

Container logs rotate automatically (3 × 10 MB per container). The server
keeps the newest `KEEP_IMAGES` images per app and environment, plus any
image a container is using.
