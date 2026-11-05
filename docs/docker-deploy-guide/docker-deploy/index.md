---
title: Docker Deploy Pipeline
---
# Docker Deploy Pipeline

How to put an Express (Node.js) application on the Docker deploy pipeline:
set up a server once, add your app to it, and deploy by pushing a branch.

**Audience:** a developer who owns an Express app and wants it deployed
with this pipeline.

## Download the kit {#download-the-kit}

Everything you copy to a server or into your app repo is in one zip:

**[⬇ docker-deploy-kit.zip](./docker-deploy-kit.zip)**

Unzip it on your laptop. Commands in this guide are run from inside the
unzipped `docker-deploy-kit/` folder:

```bash
unzip docker-deploy-kit.zip && cd docker-deploy-kit
```

```text
docker-deploy-kit/
  README.txt
  server/                    copied to the server (stage 3)
    deploy.sh                the deploy script; holds the app whitelist
    server-setup.sh          one-time, idempotent server setup
    app.conf.template        template for each app+environment conf file
  templates/node-api/        filled in and copied into your app repo (stage 4)
    Dockerfile
    dockerignore
    deploy.yml
```

## How to use this guide {#how-to-use-this-guide}

Work through the stages in order. Each stage ends with a **✅ Checkpoint**:
a short list of commands and results that prove the stage is done. Don't
start the next stage until every checkpoint item passes. If one fails, the
problem is in that stage, and you won't have to hunt for it later.

| Stage | What you do | Where | Done when (checkpoint) |
|---|---|---|---|
| [1. How It Works](./how-it-works) | Read how a push becomes a running container | — | You can say which branch deploys where, and what turns a deploy red |
| [2. Is Your App Ready?](./app-readiness) | Check the app against 12 requirements | app repo | `npm ci && npm run build` passes clean; start command, port and runtime files are known |
| [3. Server Setup](./server-setup) | Install Docker, the `deployer` user and CI keys; log in to GHCR; pin the host key | laptop + server | The CI key reaches `deploy.sh` and nothing else (`hello` → exit 2) |
| [4. Add Your App](./add-your-app) | Fill the templates, test the image, register the app, create conf + `.env`, set up GitHub | app repo + server + GitHub | The conf check exits 1 with `pull failed`; GitHub environments are ready with deploys off |
| [5. First Deploy and Go-Live](./go-live) | Push, deploy once by hand, retire the old process, turn CI deploys on | GitHub + server | A push to your staging branch (later your production branch) gives a green deploy |

::: tip
**Skip stage 3** if the server already runs the pipeline for another app.
:::

Reference pages, for after go-live:

- [6. Everyday Use](./everyday-use): deploy, rollback, logs, deploy history.
- [7. Troubleshooting](./troubleshooting): symptom → cause → fix, by `deploy.sh` exit code.
- [8. Reference](./reference): files, the exact `docker run`, exit codes, known limitations.

## Progress tracker {#progress-tracker}

Copy this into your ticket or PR description and tick as you go:

```markdown
- [ ] 1. Read "How it works"
- [ ] 2. App passes the readiness checklist
- [ ] 3. Server set up (or already set up)
- [ ] 4. App added: templates, local image test, whitelist, conf + .env, GitHub
- [ ] 5a. Staging live, CI deploys on
- [ ] 5b. Production live, CI deploys on
```

## Placeholders used in commands {#placeholders}

Replace everything in angle brackets:

| You write | Meaning | Example |
|---|---|---|
| `<app>` | short lowercase app name, used everywhere | `orders-api` |
| `<org>/<repo>` | the app's GitHub repository | `acme/orders-api` |
| `<server-host>` | server hostname or IP, as CI will connect to it | `203.0.113.10` |
| `<ssh-port>` | server SSH port | `22` |
| `<github-user>` | the GitHub account the server pulls images with | `jane` |
| `<sha7>` | first 7 characters of a commit SHA | `1a2b3c4` |

::: v-pre
Template placeholders such as `{{IMAGE}}` and `{{PORT}}` are explained in
[4.1 Pick your values](./add-your-app#pick-your-values).
:::
