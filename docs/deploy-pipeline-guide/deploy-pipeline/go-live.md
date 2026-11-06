---
title: 4. First Deploy and Go-Live
order: 4
---
# 4. First Deploy and Go-Live

Staging first. Production follows the same steps once staging has run
cleanly for a while. Your app's guide lists what to commit and any extra
checks for your kind of app; do those at the points marked below.

## 4.1 Push with deploys disabled {#push-disabled}

Check that `DEPLOY_ENABLED` is `false` in the `staging` environment. Commit
the pipeline files your app's guide lists (at least `Dockerfile`,
`.dockerignore` and `.github/workflows/deploy.yml`) and push them to your
staging branch.

In the GitHub Actions run:

- The **build** job publishes `ghcr.io/<org>/<repo>:staging-<sha7>`. The
  full image name and tag are in the log of its build-and-push step.
- The **deploy** job shows the notice
  `deploy disabled for this environment (DEPLOY_ENABLED != true)` and stops.
  Nothing on the server changes.

## 4.2 First staging deploy by hand {#first-staging-deploy}

On the server, check there is room for the image:

```bash
df -h /
```

If an old process serves this app on the same port today (pm2, a systemd
unit, a plain `node`), stop it. Stop, don't delete: you keep it until the
container is proven. With pm2:

```bash
pm2 stop <old-process-name>
```

With a systemd unit:

```bash
sudo systemctl stop <unit>
```

Deploy the tag from 4.1:

```bash
sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<sha7>; echo "exit $?"
```

`exit 0` with `deploy: <app> staging staging-<sha7> ok` means the container
answered HTTP on its port and was still running with zero restarts 10 s
later. Anything else: look the message up in
[6. Troubleshooting](./troubleshooting#deploy-failures).

### Check it {#check-it}

`deploy.sh` only proves the server answers. Check the app itself.

::: v-pre
The container is running the new tag:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```
:::

The startup log is clean, and the app listens on the conf's `PORT`:

```bash
docker logs --tail 100 <app>-staging
```

Then use the app through Nginx and its public URL, and run the extra checks
from your app's guide.

### If it's bad: go back to the old process {#back-out}

Save the failed container's logs first; removing it deletes them:

```bash
docker logs <app>-staging > ~/<app>-staging-failed.log 2>&1
```

```bash
docker rm -f <app>-staging && pm2 start <old-process-name>
```

With a systemd unit: `docker rm -f <app>-staging && sudo systemctl start <unit>`.

The port is free again, so the old process starts as before. Fix the
problem ([6. Troubleshooting](./troubleshooting)), push, and repeat 4.2 with
the new tag.

### If it's good: retire the old process and turn deploys on {#retire-old-process}

Delete the old process and save pm2's process list, so a reboot doesn't
start it again and take the port:

```bash
pm2 delete <old-process-name> && pm2 save
```

```bash
pm2 list
```

The app is no longer in the list. (For a systemd unit:
`sudo systemctl disable --now <unit>`.)

The container itself comes back after a reboot: `deploy.sh` runs it with
`--restart unless-stopped`.

Then on GitHub, in the `staging` environment, set `DEPLOY_ENABLED` to
`true`. From now on every push to your staging branch builds and deploys.
Prove it with a small commit (an empty one works):

```bash
git commit --allow-empty -m "chore: first CI deploy" && git push
```

Both jobs go green, and `docker ps` on the server shows the new
`staging-<sha7>`.

## 4.3 Production {#production}

If production runs on **its own server**, set that server up first: do
[2. Server Setup](./server-setup) there, and register the app in its
`deploy.sh` ([3.2](./add-an-app#register-app)). In the `production`
environment on GitHub, set `DEPLOY_HOST` and `DEPLOY_KNOWN_HOSTS` (its own
verified `ssh-keyscan` line) for that server.

1. **Production key.** If it isn't installed yet (a shared server where you
   held it back, or a new production server), copy it next to your edited
   `deploy.sh`:

   ```bash
   scp -P <ssh-port> ~/deploy-keys/<app>_production.pub ubuntu@<server-host>:~/docker-deploy-server/
   ```

   Then on the server:

   ```bash
   cd ~/docker-deploy-server && sudo ./server-setup.sh --skip-docker --skip-swap production:<app>_production.pub
   ```

   Run this next to your edited `deploy.sh`, because the script reinstalls
   the `deploy.sh` beside it ([3.2](./add-an-app#register-app)).
2. **Conf and `.env`.** Create `/opt/deploy/apps/<app>-production.conf` and
   the production `.env`, with its own `PORT` and production values
   ([3.3](./add-an-app#conf-file), [3.4](./add-an-app#env-file)). Run the key
   check on the production `.env`, then the conf check. It must end with
   `exit 1` and `deploy: pull failed`:

   ```bash
   sudo -u deployer /opt/deploy/deploy.sh deploy <app> production-0000000; echo "exit $?"
   ```

   Add the Nginx site for the production URL, proxying to the production
   conf's `PORT` ([3.5](./add-an-app#conf-check)).
3. **GitHub.** The `production` environment has `DEPLOY_ENABLED=false`, plus
   any production settings your app's guide lists.
4. **Build.** Merge to your production branch (e.g. `main`). CI publishes
   `production-<sha7>` and skips the deploy.
5. **Deploy by hand, check, retire the old process, turn deploys on.** The
   same steps as [4.2](#first-staging-deploy), with `production-<sha7>`,
   `<app>-production` and the `production` environment.

## ✅ Checkpoint {#checkpoint}

Staging:

- The build job published `ghcr.io/<org>/<repo>:staging-<sha7>`.
- The manual deploy exited 0, the app works through its public URL, and your app guide's extra checks pass.
- The old process is deleted and saved (`pm2 delete … && pm2 save`), so a reboot won't bring it back.
- `DEPLOY_ENABLED=true` in the `staging` environment, and the next push gives a green `deploy` job.

Production (when you get there):

- The same checks, with `production-<sha7>`, `<app>-production` and the `production` environment.

Your app is on the pipeline. Keep [5. Everyday Use](./everyday-use) and
[6. Troubleshooting](./troubleshooting) at hand.
