---
order: 0
title: React Deploy Pipeline
---
<script setup>
import { withBase } from 'vitepress'
</script>

# React Deploy Pipeline

How to put a static React application on the Docker deploy pipeline. This
guide covers what is specific to a static single-page app: the nginx runtime,
public (`VITE_*` or `REACT_APP_*`) values, the server `.env` and the hosting
setups. The steps every app shares (server setup, adding the app to the
server, the first deploy, everyday use) are in the
[Deploy Pipeline](../) guide; the steps below send you there when it's time.

**Audience:** a developer who owns a React single-page app built with Vite or
Create React App, served as static files, and wants it deployed with this
pipeline.

## Download the kits {#download-the-kit}

The templates for your app repo are in this zip:

**<a :href="withBase('/downloads/react-deploy-kit.zip')" download>⬇ react-deploy-kit.zip</a>**

::: step level=run where=laptop
```bash
unzip react-deploy-kit.zip
```
:::

```text
react-deploy-kit/
  README.txt
  templates/react/           filled in and copied into your app repo (step 3)
    Dockerfile
    dockerignore
    deploy.yml
    nginx.conf.template
    nginx-include.conf
    docker-entrypoint.sh
```

The server files are in the
[Deploy Pipeline kit](../#download-the-kit) (steps 4 and 5).

## Steps {#steps}

Work through the steps in order. Each step ends with a **✅ Checkpoint**:
a short list of commands and results that prove the step is done. Don't
start the next step until every checkpoint item passes.

| Step | What you do | Where | Done when (checkpoint) |
|---|---|---|---|
| 1. [How It Works](../how-it-works) | Read how a push becomes a running container, and where public and server values live | — | You can say which branch deploys where, when `VITE_*`/`REACT_APP_*` values are fixed, and what turns a deploy red |
| 2. [Is Your App Ready?](./app-readiness) | Check the app against the readiness checklist | app repo | `npm ci && npm run build` passes clean on Linux and produces the output folder |
| 3. [Prepare Your App](./prepare-your-app) | Fill the templates, write the public values, test the image, pick the hosting setup | app repo + laptop | The image runs locally on the `.env` port with the staging public values baked in |
| 4. [Server Setup](../server-setup) (shared) | Install Docker, the `deployer` user and `/opt/deploy`; log in to GHCR; pin the host key | server | `deploy.sh hello` → exit 2 |
| 5. [Add the App to the Server](../add-an-app) (shared) | Whitelist the app, create conf + `.env`, add CI keys, set up GitHub environments and the public values | server + GitHub | The conf check exits 1 with `pull failed`; GitHub is ready with deploys off |
| 6. [Go-Live](../go-live) (shared) | Push, deploy once by hand, switch Nginx, retire the old process, turn CI deploys on | GitHub + server | A push to your staging branch (later your production branch) gives a green deploy and the page answers on its domain |

::: tip
**Skip step 4** if the server already runs the pipeline for another app.
Step 5 is needed for every app, including its own CI keys.
:::

::: warning The server `.env` is owned by uid 101
The shared step creates it for the Node images' uid 1000. React images run
nginx as uid 101; use the ownership in
[What goes in the server `.env`](./prepare-your-app#server-env).
:::

Reference pages, for after go-live:

- [Everyday Use](../everyday-use): deploy, rollback, change a server value, logs, deploy history.
- [Troubleshooting](./troubleshooting): static React problems (deep links, cache, base path, public values). For `deploy.sh` exit codes, see the shared [Troubleshooting](../troubleshooting).
- [Reference](../reference): files, the conf, `docker run` and exit codes for every app.

## Progress tracker {#progress-tracker}

Copy this into your ticket or PR description and tick as you go:

```markdown
- [ ] 1. Read "How it works"
- [ ] 2. App passes the readiness checklist
- [ ] 3. App prepared: templates, public values, local image test, hosting setup chosen
- [ ] 4. Server set up (or already set up)
- [ ] 5. App added to the server: whitelist, conf + .env, CI keys, GitHub (incl. PUBLIC_ENV_*)
- [ ] 6a. Staging live, Nginx switched, CI deploys on
- [ ] 6b. Production live, CI deploys on
```

## Placeholders used in commands {#placeholders}

The angle-bracket placeholders (`<app>`, `<org>/<repo>`, `<server-host>`,
…) are the same as in the shared guide's
[placeholder table](../#placeholders).

::: v-pre
Template placeholders such as `{{IMAGE}}`, `{{BUILD_DIR}}` and
`{{PUBLIC_PREFIX}}` are explained in
[Pick your values](./prepare-your-app#pick-your-values).
:::
