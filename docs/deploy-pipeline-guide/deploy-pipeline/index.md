---
title: Deploy Pipeline
---
<script setup>
import { withBase } from 'vitepress'
import { ref } from 'vue'

const copied = ref(false)
const fallbackUrl = ref('')

async function copyAgentLink() {
  const url = new URL(withBase('/agent/deploy-pipeline-guide/deploy-pipeline/index.md'), location.origin).href
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    fallbackUrl.value = url
  }
}
</script>

# Deploy Pipeline

::: agent
## For agents: read this first

This is the agent version of the Deploy Pipeline guide. You are helping a developer deploy the app in the current repo. Work fast: do not ask about anything this preamble allows.

**Steps.** Every command you may need to run sits inside a `::: step` marker:

```md
::: step level=<run|ask|never> where=<laptop|server|github> verify="<how to check it worked>"
```

Command blocks outside a step marker are reference material. Do not run them.

A marker can also use four colons (`:::: step …` closed by `::::`) when it wraps a larger block. It means the same thing. The inline commands in ✅ Checkpoint lists aren't wrapped: run each one at the level of the step it checks.

| `level` | What you do |
|---|---|
| `run` | Run it at once, without asking. These are local: the app repo and the developer's machine. |
| `ask` | Show the exact command, already adapted to this repo. The developer either approves it (then you run it) or runs it and pastes the output back. Check the result against `verify`, then continue. |
| `never` | Do not run it, and do not read the files it touches. Tell the developer what to do. You may name the variables or files expected, never their values. |

**Secrets.** Never read, print, copy or upload `.env` files with real values, private key contents, tokens or passwords. You may use a key by its path (for example `ssh -i ~/deploy-keys/<app>_staging …`) at `ask` level.

**Adapt to the repo.** When the repo differs from what a step assumes (package manager, port, start command, entry file, branch names), adapt the command, say what you changed in one line (for example "using `pnpm` instead of `npm`; port 8080 from `src/config.ts`"), and keep going. Stop only when the repo can't tell you the right value.

**Placeholders.** Fill `<app>`, `<org>/<repo>` and the template values from the repo (`git remote -v`, `package.json`). Ask the developer only for what the repo can't tell you: server host, SSH port, GitHub user.

**Pick the path.** Check `package.json` dependencies: `next` means the [Next.js guide](./nextjs/), and `express` means the [Express guide](./express/). If neither matches, ask. Follow that guide's step table in order. It sends you to the shared stages linked below.

**Checkpoints.** Each stage ends with a ✅ Checkpoint. Run the checkpoint items you're allowed to run, ask for the rest, and don't start the next stage until every item passes.
:::

The steps every app on the Docker deploy pipeline shares: how the pipeline
works, setting up a server once, adding an app to the server, the first
deploy, and day-to-day use.

**Audience:** a developer putting an app on the pipeline. Start from your
app's guide; it sends you here for the shared steps and tells you what is
different for your kind of app.

<p class="agent-link"><button type="button" @click="copyAgentLink">{{ copied ? 'Copied' : 'Copy link for your agent' }}</button> <code v-if="fallbackUrl">{{ fallbackUrl }}</code></p>

| App type | Guide |
|---|---|
| Express (Node.js API) | [Express Deploy Pipeline](./express/) |
| Next.js (Node server) | [Next.js Deploy Pipeline](./nextjs/) |
| React (static SPA) | [React Deploy Pipeline](./react/) |

## Download the kit {#download-the-kit}

The server files are in one zip. Your app's guide has a second zip with the
templates for your app repo.

**<a :href="withBase('/downloads/deploy-pipeline-kit.zip')" download>⬇ deploy-pipeline-kit.zip</a>**

Unzip it on your laptop. Server commands in this guide are run from inside
the unzipped `deploy-pipeline-kit/` folder:

::: step level=run where=laptop
```bash
unzip deploy-pipeline-kit.zip && cd deploy-pipeline-kit
```
:::

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

<style>
.agent-link button { border: 1px solid var(--vp-c-brand-1); color: var(--vp-c-brand-1); border-radius: 6px; padding: 2px 10px; font-size: 14px }
.agent-link button:hover { background: var(--vp-c-brand-soft) }
</style>
