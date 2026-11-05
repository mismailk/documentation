---
title: 8. Reference
order: 8
---
<script setup>
import { withBase } from 'vitepress'
</script>

# 8. Reference

## Files {#files}

| Where | What |
|---|---|
| kit `server/deploy.sh` | the deploy script; contains the app whitelist |
| kit `server/server-setup.sh` | one-time, idempotent server setup |
| kit `server/app.conf.template` | conf file template |
| kit `templates/node-api/` | Dockerfile, dockerignore, workflow templates |
| server `/opt/deploy/deploy.sh` | the installed deploy script (forced command for every CI key) |
| server `/opt/deploy/apps/<app>-<env>.conf` | per app+environment settings |
| server `/opt/deploy/logs/deploy.log` | one line per deploy attempt |
| app repo `Dockerfile`, `.dockerignore`, `.github/workflows/deploy.yml` | the app's pipeline files |

## What each deploy runs {#docker-run}

Do not hand-edit containers; redeploy instead.

```bash
docker run -d --name <CONTAINER> --init --network host --restart unless-stopped \
  --memory <MEMORY> --memory-swap <MEMORY> \
  --log-opt max-size=10m --log-opt max-file=3 \
  -v <ENV_FILE>:/app/.env:ro <IMAGE>:<tag>
```

## `deploy.sh` exit codes {#exit-codes}

| Code | Meaning |
|---|---|
| `0` | deployed and verified |
| `1` | pull, run or verify failed |
| `2` | invalid request or conf |
| `3` | no conf for this app+environment |
| `4` | lock timeout (another deploy is running) |

## Known limitations (phase 1) {#known-limitations}

- No zero-downtime deploys: there's a 1–2 s restart gap.
- Migrations are manual.
- Staging and production images share one GHCR package, so tags are mutable.
- The server's GHCR access depends on one personal token.

## Download {#download}

<a :href="withBase('/downloads/docker-deploy-kit.zip')" download>docker-deploy-kit.zip</a>. See
[Download the kit](./#download-the-kit) for its contents.
