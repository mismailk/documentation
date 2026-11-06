---
order: 0
title: Express Deploy Pipeline
---
<script setup>
import { withBase } from 'vitepress'
</script>

# Express Deploy Pipeline

How to put an Express (Node.js) application on the Docker deploy pipeline.
This guide covers what is specific to Express: checking the app, the image
templates and the server `.env`. The steps every app shares (server setup,
adding the app to the server, the first deploy, everyday use) are in the
[Deploy Pipeline](../) guide; the steps below send you there
when it's time.

**Audience:** a developer who owns an Express app and wants it deployed
with this pipeline.

## Download the kits {#download-the-kit}

The templates for your app repo are in this zip:

**<a :href="withBase('/downloads/express-deploy-kit.zip')" download>⬇ express-deploy-kit.zip</a>**

```bash
unzip express-deploy-kit.zip
```

```text
express-deploy-kit/
  README.txt
  templates/node-api/        filled in and copied into your app repo (step 3)
    Dockerfile
    dockerignore
    deploy.yml
```

The server files are in the
[Deploy Pipeline kit](../#download-the-kit) (steps 4 and 5).

## Steps {#steps}

Work through the steps in order. Each step ends with a **✅ Checkpoint**:
a short list of commands and results that prove the step is done. Don't
start the next step until every checkpoint item passes.

| Step | What you do | Where | Done when (checkpoint) |
|---|---|---|---|
| 1. [How It Works](../how-it-works) (shared) | Read how a push becomes a running container | — | You can say which branch deploys where, and what turns a deploy red |
| 2. [Is Your App Ready?](./app-readiness) | Check the app against 12 requirements | app repo | `npm ci && npm run build` passes clean; start command, port and runtime files are known |
| 3. [Prepare Your App](./prepare-your-app) | Fill the templates, test the image, list the server values | app repo + laptop | The image boots locally with a test `.env` and answers HTTP |
| 4. [Server Setup](../server-setup) (shared) | Install Docker, the `deployer` user and `/opt/deploy`; log in to GHCR; pin the host key | server | `deploy.sh hello` → exit 2 |
| 5. [Add the App to the Server](../add-an-app) (shared) | Whitelist the app, create conf + `.env` (contents from [step 3](./prepare-your-app#server-env)), add CI keys, set up GitHub | server + GitHub | The conf check exits 1 with `pull failed`; GitHub environments are ready with deploys off |
| 6. [First Deploy and Go-Live](../go-live) (shared) | Push, deploy once by hand, retire the old process, turn CI deploys on | GitHub + server | A push to your staging branch (later your production branch) gives a green deploy |

::: tip
**Skip step 4** if the server already runs the pipeline for another app.
Step 5 is needed for every app, including its own CI keys.
:::

After go-live:

- [Everyday Use](../everyday-use) (shared): deploy, rollback, logs, deploy history.
- [Troubleshooting](./troubleshooting): Express app problems. For `deploy.sh` exit codes, see the shared [Troubleshooting](../troubleshooting).
- [Reference](../reference) (shared): files, the exact `docker run`, exit codes, known limitations.

## Progress tracker {#progress-tracker}

Copy this into your ticket or PR description and tick as you go:

```markdown
- [ ] 1. Read "How it works"
- [ ] 2. App passes the readiness checklist
- [ ] 3. App prepared: templates, local image test, server values listed
- [ ] 4. Server set up (or already set up)
- [ ] 5. App added to the server: whitelist, conf + .env, CI keys, GitHub
- [ ] 6a. Staging live, CI deploys on
- [ ] 6b. Production live, CI deploys on
```

## Placeholders used in commands {#placeholders}

The angle-bracket placeholders (`<app>`, `<org>/<repo>`, `<server-host>`,
…) are the same as in the shared guide's
[placeholder table](../#placeholders).

::: v-pre
Template placeholders such as `{{IMAGE}}` and `{{START_COMMAND}}` are
explained in [Pick your values](./prepare-your-app#pick-your-values).
:::
