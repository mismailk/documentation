---
title: Deploy Pipeline
---
<script setup>
import { withBase } from 'vitepress'
</script>

# Deploy Pipeline

The steps every app on the Docker deploy pipeline shares: how the pipeline
works, setting up a server once, adding an app to the server, the first
deploy, and day-to-day use.

**Audience:** a developer putting an app on the pipeline. Start from your
app's guide; it sends you here for the shared steps and tells you what is
different for your kind of app.

| App type | Guide |
|---|---|
| Express (Node.js API) | [Express Deploy Pipeline](./express/) |
| Next.js (Node server) | [Next.js Deploy Pipeline](./nextjs/) |

## Download the kit {#download-the-kit}

The server files are in one zip. Your app's guide has a second zip with the
templates for your app repo.

**<a :href="withBase('/downloads/deploy-pipeline-kit.zip')" download>⬇ deploy-pipeline-kit.zip</a>**

Unzip it on your laptop. Server commands in this guide are run from inside
the unzipped `deploy-pipeline-kit/` folder:

```bash
unzip deploy-pipeline-kit.zip && cd deploy-pipeline-kit
```

```text
deploy-pipeline-kit/
  README.txt
  server/                    copied to the server
    deploy.sh                the deploy script; holds the app whitelist
    server-setup.sh          one-time, idempotent server setup; also adds CI keys
    app.conf.template        template for each app+environment conf file
```

## The shared stages {#stages}

Each stage ends with a **✅ Checkpoint**: a short list of commands and
results that prove the stage is done. Don't start the next stage until every
checkpoint item passes.

| Stage | What you do | When |
|---|---|---|
| [1. How It Works](./how-it-works) | Read how a push becomes a running container | once |
| [2. Server Setup](./server-setup) | Install Docker, the `deployer` user and `/opt/deploy`; log in to GHCR; pin the host key | once per server |
| [3. Add an App to the Server](./add-an-app) | Whitelist the app, create its conf and `.env`, add its CI keys, set up GitHub | once per app |
| [4. First Deploy and Go-Live](./go-live) | Push, deploy once by hand, retire the old process, turn CI deploys on | once per app |

::: tip
**Skip stage 2** if the server already runs the pipeline for another app.
Stages 3 and 4 are needed for every app.
:::

Reference pages, for after go-live:

- [5. Everyday Use](./everyday-use): deploy, rollback, change a server value, logs, deploy history.
- [6. Troubleshooting](./troubleshooting): symptom → cause → fix, by `deploy.sh` exit code.
- [7. Reference](./reference): files, the conf file, the exact `docker run`, exit codes, known limitations.

## Placeholders used in commands {#placeholders}

Replace everything in angle brackets:

| You write | Meaning | Example |
|---|---|---|
| `<app>` | short lowercase app name, used everywhere | `orders-api` |
| `<env>` | an environment: `staging` or `production` | `staging` |
| `<org>/<repo>` | the app's GitHub repository | `acme/orders-api` |
| `<server-host>` | server hostname or IP, as CI will connect to it | `203.0.113.10` |
| `<ssh-port>` | server SSH port | `22` |
| `<github-user>` | the GitHub account the server pulls images with | `jane` |
| `<sha7>` | first 7 characters of a commit SHA | `1a2b3c4` |
