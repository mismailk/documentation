---
title: 5. First Deploy and Go-Live
order: 5
---
# 5. First Deploy and Go-Live

## 5.1 Push with deploys disabled {#push-disabled}

Push the three pipeline files to `staging`. The `build` job publishes
`ghcr.io/<org>/<repo>:staging-<sha7>`. The `deploy` job prints "deploy
disabled" and stops. The image name and tag are in the build job's log.

## 5.2 First staging deploy by hand {#first-staging-deploy}

On the server:

```bash
df -h /
```

If something else (pm2, a plain `node` process) serves this app on the same
port today, stop it first. Keep it around until the container is proven:

```bash
pm2 stop <old-process-name>
```

```bash
sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<sha7>; echo "exit $?"
```

`exit 0` means it's deployed and verified. Check it through Nginx and look
at the logs:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

```bash
docker logs --tail 100 <app>-staging
```

If it's bad, go back to the old process:

```bash
docker rm -f <app>-staging && pm2 start <old-process-name>
```

If it's good, remove the old process for good so a reboot doesn't bring it
back (`pm2 delete <old-process-name> && pm2 save`). Then set
`DEPLOY_ENABLED=true` in the `staging` environment on GitHub. From now on,
every push to `staging` deploys.

## 5.3 Production {#production}

Do this once staging has run cleanly for a while.

1. If production shares the server with staging and the production key
   isn't installed yet:

   ```bash
   sudo ./server-setup.sh --skip-docker --skip-swap production:deploy_production.pub
   ```

2. Create `<app>-production.conf` and the production `.env` ([4.5](./add-your-app#conf-and-env)).
3. Merge to your production branch (e.g. `main`) while production's
   `DEPLOY_ENABLED` is `false`, so CI publishes `production-<sha7>`.
4. Deploy it by hand, check it, retire any old process, then set
   `DEPLOY_ENABLED=true` in the `production` environment. These are the same
   steps as [5.2](#first-staging-deploy), with `production-<sha7>` and `<app>-production`.

## ✅ Checkpoint {#checkpoint}

Staging:

- The build job published `ghcr.io/<org>/<repo>:staging-<sha7>`.
- The manual deploy exited 0, and the app works through its public URL.
- Any old process for the app is deleted and saved (`pm2 delete … && pm2 save`), so a reboot won't bring it back.
- `DEPLOY_ENABLED=true` in the `staging` environment, and the next push to `staging` gives a green `deploy` job.

Production (when you get there):

- The same four checks, with `production-<sha7>`, `<app>-production` and the `production` environment.

Your app is on the pipeline. Keep [6. Everyday Use](./everyday-use) and
[7. Troubleshooting](./troubleshooting) at hand.
