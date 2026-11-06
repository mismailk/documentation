---
order: 0
title: Next.js Deploy Pipeline
---
<script setup>
import { withBase } from 'vitepress'
</script>

# Next.js Deploy Pipeline

How to put a Next.js application on the Docker deploy pipeline. This guide
covers what is specific to Next.js: the standalone image, public
(`NEXT_PUBLIC_*`) values and the server `.env`. The steps every app shares
(server setup, adding the app to the server, the first deploy, everyday use)
are in the [Deploy Pipeline](../) guide; the steps below
send you there when it's time.

**Audience:** a developer who owns a Next.js app that runs on a Node server
(App Router or Pages Router) and wants it deployed with this pipeline.

## Download the kits {#download-the-kit}

The templates for your app repo are in this zip:

**<a :href="withBase('/downloads/nextjs-deploy-kit.zip')" download>⬇ nextjs-deploy-kit.zip</a>**

```bash
unzip nextjs-deploy-kit.zip
```

```text
nextjs-deploy-kit/
  README.txt
  templates/nextjs/          filled in and copied into your app repo (step 3)
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
| 1. [How It Works](../how-it-works), then [Next.js specifics](./how-it-works) | Read how a push becomes a running container, and where public and server values live | — | You can say which branch deploys where, when `NEXT_PUBLIC_*` values are fixed, and what turns a deploy red |
| 2. [Is Your App Ready?](./app-readiness) | Check the app against 14 requirements | app repo | `npm ci && npm run build` passes clean and produces `.next/standalone/server.js` |
| 3. [Prepare Your App](./prepare-your-app) | Set `output: "standalone"`, fill the templates, write the public values, test the image, list the server values | app repo + laptop | The image runs locally on the `.env` port with the staging public values baked in |
| 4. [Server Setup](../server-setup) (shared) | Install Docker, the `deployer` user and `/opt/deploy`; log in to GHCR; pin the host key | server | `deploy.sh hello` → exit 2 |
| 5. [Add the App to the Server](../add-an-app) (shared) | Whitelist the app, create conf + `.env` (contents from [step 3](./prepare-your-app#server-env)), add CI keys, set up GitHub environments and the public values | server + GitHub | The conf check exits 1 with `pull failed`; GitHub is ready with deploys off |
| 6. [Go-Live](./go-live) | Push, deploy once by hand with the Next.js checks, retire the old process, turn CI deploys on | GitHub + server | A push to your staging branch (later your production branch) gives a green deploy |

::: tip
**Skip step 4** if the server already runs the pipeline for another app.
Step 5 is needed for every app, including its own CI keys.
:::

Reference pages, for after go-live:

- [Everyday Use](./everyday-use): change a public value, what a rollback brings back, Next's cache. For deploys, rollbacks, logs and server values, see the shared [Everyday Use](../everyday-use).
- [Troubleshooting](./troubleshooting): Next.js and public value problems. For `deploy.sh` exit codes, see the shared [Troubleshooting](../troubleshooting).
- [Reference](./reference): the image, public build value rules, Next.js limitations. For files, the conf, `docker run` and exit codes, see the shared [Reference](../reference).

## Progress tracker {#progress-tracker}

Copy this into your ticket or PR description and tick as you go:

```markdown
- [ ] 1. Read "How it works" (shared + Next.js)
- [ ] 2. App passes the readiness checklist
- [ ] 3. App prepared: standalone output, templates, public values, local image test, server values listed
- [ ] 4. Server set up (or already set up)
- [ ] 5. App added to the server: whitelist, conf + .env, CI keys, GitHub (incl. PUBLIC_ENV_*)
- [ ] 6a. Staging live, CI deploys on
- [ ] 6b. Production live, CI deploys on
```

## Placeholders used in commands {#placeholders}

The angle-bracket placeholders (`<app>`, `<org>/<repo>`, `<server-host>`,
…) are the same as in the shared guide's
[placeholder table](../#placeholders).

::: v-pre
Template placeholders such as `{{IMAGE}}` and `{{NODE_VERSION}}` are
explained in [Pick your values](./prepare-your-app#pick-your-values).
:::
