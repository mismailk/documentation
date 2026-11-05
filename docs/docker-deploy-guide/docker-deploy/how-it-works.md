---
title: 1. How It Works
order: 1
---
# 1. How It Works

```text
git push <staging branch> | <production branch>
        │
        ▼
GitHub Actions (workflow in your repo)
  branch → environment: staging | production
  build  ── docker build ──► ghcr.io/<org>/<repo>:<env>-<sha7>   (+ <env>-latest)
  deploy ── ssh deployer@server "deploy <app> <env>-<sha7>"
        │
        ▼
Server: /opt/deploy/deploy.sh (SSH forced command, pinned to one environment)
  validate → read /opt/deploy/apps/<app>-<env>.conf → lock → docker pull
  → stop old container → docker run new one → verify → prune old images → log
        │
        ▼
Host Nginx ──proxy──► 127.0.0.1:<PORT>  (container uses host networking)
```

- **Branch → environment → tag:** you pick one branch for each environment
  (for example `staging` → `staging` and `main` → `production`; `develop` or
  `master` work just as well). The workflow maps the pushed branch to its
  environment and tags the image by environment: `staging-<sha7>` or
  `production-<sha7>`, plus a `staging-latest` / `production-latest`
  convenience tag that is never deployed. Branch names live only in your
  workflow; `deploy.sh` only accepts tags starting with `staging-` or
  `production-`. Other branches don't trigger the workflow (and if one ever
  did, the tag step would fail instead of guessing an environment).
- **The image is built once, in CI.** The server never builds anything and
  never runs `git pull`. Rollback is "deploy an older tag".
- **Secrets never pass through CI.** Your app's `.env` lives on the server
  and is mounted read-only into the container at `/app/.env`. The only secret
  in GitHub is the SSH key CI uses to trigger the deploy.
- **Each CI key can only do one thing:** run `deploy <app> <tag>` for its own
  environment. It gets no shell, and the staging key can't deploy to
  production.
- **A deploy that doesn't come up turns CI red.** After starting the new
  container, `deploy.sh` waits for any HTTP answer on the app's port (up to
  30 s), waits 10 s more, and then requires the container to be running with
  zero restarts. There is a 1–2 s gap while the old container stops and the
  new one starts. There's no automatic rollback.

## ✅ Checkpoint {#checkpoint}

Before you go on, make sure you can answer these:

- Which branch deploys to which environment (for example `staging` → staging, `main` → production), and which tag that gives (`staging-<sha7>` / `production-<sha7>`)?
- Where does the app's `.env` live, and does it ever pass through GitHub? (On the server; no.)
- What can a CI key do on the server? (Only `deploy <app> <tag>`, only for its own environment.)
- What makes a deploy go red? (No HTTP answer within 30 s, or the container isn't running with 0 restarts 10 s later.)
