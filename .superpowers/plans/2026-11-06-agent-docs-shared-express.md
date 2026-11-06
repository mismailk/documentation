# Agent-ready Deploy Pipeline guide, plan 2: shared stages and Express path

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every runnable command on the shared stages and the Express path carries a `::: step` marker with the right level, place and check, and a guide-wide test proves that no command block was missed.

**Architecture:** This plan is mostly content. Task 1 extends plan 1's scanner and transformer to handle markers and fences indented inside list items (the guide has several) and adds `test/guide-markers.test.mjs`. That test scans every guide page and keeps a `PENDING` list of pages that aren't marked yet, which plan 3 empties. Tasks 2 to 4 wrap blocks page by page. The human pages must stay byte-identical in their `<main>` HTML, and `scripts/compare-doc-html.mjs` from plan 1 proves it.

**Tech Stack:** As in plan 1: VitePress 1.6.4, markdown-it-container, `node:test`.

**Spec:** `.superpowers/specs/2026-11-06-agent-ready-deploy-pipeline-design.md`. Plan 1 is `.superpowers/plans/2026-11-06-agent-docs-mechanism.md` and must be merged into this branch first (it is, on `feat/agent-docs-mcp`).

## Global Constraints

- Branch `feat/agent-docs-mcp`. One commit per task. Never push. Never commit `sidebar.gen.json`, `cache/` or `dist/`.
- **Only add marker lines.** Don't change any existing line of a guide page: no rewording, no reflowing, no re-indenting. Each wrapped block gains exactly one opening line (`::: step …`) above its fence and one closing line (`:::`) below it, at the fence's own indentation.
- **Never put a `::: step` marker inside `::: v-pre`.** VitePress's v-pre rule closes at the first `:::`, which leaves a stray `:::` on the page. This was verified while checking plan 1. Instead, wrap the whole `::: v-pre` block from outside with a four-colon marker, `:::: step …` above it and `::::` below it. That renders exactly like the page today.
- The marker syntax is `::: step level=<run|ask|never> where=<laptop|server|github>`, with an optional `verify="…"` (`\"` escapes a quote). `verify` comes from the page's own check text or ✅ Checkpoint; never invent a new check.
- `::: agent` notes are allowed only where this plan gives their text. They go on their own lines, separated by blank lines from the surrounding content, at the indentation of the content they sit in.
- The levels follow the developer's rules (spec, "The three levels" and §5):
  - `run`: local work.
  - `ask`: anything that touches the server (`ssh`, `scp`, `ssh-keyscan`, every command "on the server"), plus `git push` and GitHub settings.
  - `never`: secret contents, such as the GHCR token login and pasting the private key.
  - Using a key by its path is `ask`.
- After every task: `npm test` passes, and `npm run docs:build` passes with no empty-sidebar warning.

## Review Focus

1. **Markers inside list items** (an indented fence under `1.` or `-`): the site must render the list exactly as before, the scanner must see the step, and the agent copy must keep it. Task 1 tests this, and Task 4's HTML comparison checks it across the whole site.
2. **A step around `::: v-pre`** (go-live's `docker ps --format '{{…}}'`): wrapped from outside with `:::: step`, it must still render unchanged with `{{` shown literally. The scanner must count the block as marked, and the agent copy must keep the four-colon marker. Task 1 tests the scanner, Task 3 marks it, and Task 4's comparison checks it.
3. **Bash blocks that aren't commands** (file excerpts like `backend | <app>) ;;`, the reference `docker run`): they stay unwrapped and are named in the test's allowlist, so a real command can't hide behind a blanket exception. Task 1 adds the allowlist, and Tasks 2 and 3 use it.
4. **Secrets near commands** (the `.env` key checks print only names, and `chown`/`chmod` don't read the file): these are `ask`, not `never`, so the agent can still help. Only the token login is `never`. Tasks 2 and 3 cover this.
5. **A verify string containing quotes or `$`** (for example `case "$2" in`): it must survive the marker parser. Plan 1's parser test covers escaping, and Task 2 uses it.

---

### Task 1: Indented markers and the guide-wide check

**Files:**
- Modify: `scripts/agent-docs.mjs`
- Modify: `test/agent-docs.test.mjs`
- Create: `test/guide-markers.test.mjs`

**Interfaces:**
- Consumes: `findUnmarkedCommandBlocks`, `toAgentCopy`, `useAgentContainers` (plan 1).
- Produces: in `test/guide-markers.test.mjs`, the constants `PENDING` (a `Set` of guide-relative paths still to be marked) and `REFERENCE_BLOCKS` (an array of `{ file, code }` for bash blocks that are reference text, not commands). Tasks 2 to 4 and plan 3 edit these two constants.

- [ ] **Step 1: Write the failing tests.** Append these to `test/agent-docs.test.mjs`:

```js
test('findUnmarkedCommandBlocks handles markers and fences indented in list items', () => {
  const marked = ['1. Item', '', '   ::: step level=ask where=server', '   ```bash', '   ssh x', '   ```', '   :::'].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(marked), [])
  const unmarked = ['1. Item', '', '   ```bash', '   ssh x', '   ```'].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(unmarked), [{ line: 3, code: 'ssh x' }])
})

test('an indented step inside a list item renders exactly its content', () => {
  const plain = '1. Item\n\n   ```bash\n   ssh x\n   ```\n2. Next\n'
  const wrapped = '1. Item\n\n   ::: step level=ask where=server\n   ```bash\n   ssh x\n   ```\n   :::\n2. Next\n'
  assert.equal(md().render(wrapped), md().render(plain))
})

test('toAgentCopy keeps indented step markers and unwraps indented agent notes', () => {
  const out = toAgentCopy('# T\n\n1. Item\n\n   ::: agent\n   Note.\n   :::\n\n   ::: step level=run where=laptop\n   ```bash\n   ls\n   ```\n   :::\n', opts)
  assert.match(out, /\n   Note\.\n/)
  assert.doesNotMatch(out, /::: agent/)
  assert.match(out, /   ::: step level=run where=laptop\n   ```bash\n   ls\n   ```\n   :::/)
})

test('a four-colon step around v-pre counts as marked and survives in the agent copy', () => {
  const src = [':::: step level=ask where=server', '::: v-pre', 'Text:', '', '```bash', "docker ps --format '{{.Names}}'", '```', ':::', '::::'].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(src), [])
  const out = toAgentCopy(`# T\n\n${src}\n`, opts)
  assert.match(out, /:::: step level=ask where=server\nText:\n\n```bash\ndocker ps --format '\{\{\.Names\}\}'\n```\n::::/)
})

test('toAgentCopy drops the human-only copy-link button', () => {
  const out = toAgentCopy('# T\n\nIntro.\n\n<p class="agent-link"><button type="button" @click="copyAgentLink">{{ copied ? \'Copied\' : \'Copy link for your agent\' }}</button></p>\n\nNext.\n', opts)
  assert.doesNotMatch(out, /agent-link|copyAgentLink/)
  assert.match(out, /Intro\.\n\nNext\./)
})
```

Create `test/guide-markers.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { findUnmarkedCommandBlocks } from '../scripts/agent-docs.mjs'

const GUIDE = 'docs/deploy-pipeline-guide/deploy-pipeline'

// Pages not marked yet. Tasks remove entries as they mark pages; plan 3 empties it.
export const PENDING = new Set([
  'server-setup.md', 'add-an-app.md', 'go-live.md', 'everyday-use.md', 'troubleshooting.md', 'reference.md',
  'express/index.md', 'express/prepare-your-app.md',
  'nextjs/index.md', 'nextjs/prepare-your-app.md', 'nextjs/go-live.md', 'nextjs/everyday-use.md',
])

// Bash blocks that are reference text, not commands to run. Match on the exact block body.
export const REFERENCE_BLOCKS = []

const pages = (dir, base = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? pages(path.join(dir, e.name), `${base}${e.name}/`) : e.name.endsWith('.md') ? [`${base}${e.name}`] : [])

test('every command block in the guide is inside a step marker', () => {
  for (const page of pages(GUIDE)) {
    if (PENDING.has(page)) continue
    const src = fs.readFileSync(path.join(GUIDE, page), 'utf8')
    const unmarked = findUnmarkedCommandBlocks(src)
      .filter((b) => !REFERENCE_BLOCKS.some((r) => r.file === page && r.code === b.code))
    assert.deepEqual(unmarked, [], `${page} has command blocks without a ::: step marker`)
  }
})

test('PENDING and REFERENCE_BLOCKS only name real pages', () => {
  const all = new Set(pages(GUIDE))
  for (const p of PENDING) assert.ok(all.has(p), `PENDING names a missing page: ${p}`)
  for (const r of REFERENCE_BLOCKS) assert.ok(all.has(r.file), `REFERENCE_BLOCKS names a missing page: ${r.file}`)
})
```

- [ ] **Step 2: Run the tests to check which fail**

Run: `npm test`
Expected: at least the button test and the indented-marker scanner test FAIL (plan 1's scan only matches container lines at column 0, so an indented `:::` is reported as unclosed). The render test and the v-pre test may already pass, so note which ones did. The 2 tests in `guide-markers.test.mjs` PASS: `index.md` is already marked, and the pages without command blocks pass too.


- [ ] **Step 3: Allow indentation, and drop the button**, in `scripts/agent-docs.mjs`:
  - `scanSource` already accepts fences indented 0 to 3 spaces (plan 1's fix commit). Make it also accept fences and container lines indented by any number of spaces, since list-item content can sit deeper than 3 columns: fences `/^( *)(`{3,}|~{3,})/`, container open `/^ *:::+\s*(\S+)/`, container close `/^ *:::+\s*$/`. Keep stripping the fence's own indentation from `code`.
  - In `toAgentCopy`, unwrapping an indented `::: agent` keeps the inner lines as they are.
  - In `toAgentCopy`, drop every line that starts with `<p class="agent-link"`, together with one blank line after it if there is one. The button is for humans only.

- [ ] **Step 4: Run the tests**

Run: `npm test && npm run docs:build`
Expected: 37 tests pass (plan 1's 30, plus 5, plus 2), and the build passes.

- [ ] **Step 5: Commit**

```bash
git add scripts/agent-docs.mjs test/agent-docs.test.mjs test/guide-markers.test.mjs
git commit -m "test: guide-wide step marker check, with indented markers"
```

---

### Task 2: Mark Server Setup and Add an App

**Files:**
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/server-setup.md`
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/add-an-app.md`
- Modify: `test/guide-markers.test.mjs` (remove both pages from `PENDING`, add the reference blocks)

Each block is identified by its first command line.

**`server-setup.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `snap list docker 2>/dev/null` | ask | server | `prints nothing` |
| `dpkg -l \| grep -E '^ii +docker\.io'` | ask | server | `prints nothing` |
| `sudo apt-get update` | ask | server | `succeeds with no errors` |
| `sudo sshd -T \| grep -Ei …` | ask | server | `usepam yes; deployer allowed if allowusers/allowgroups is set` |
| `ssh -p <ssh-port> ubuntu@<server-host> mkdir -p docker-deploy-server` | ask | server | — |
| `scp -P <ssh-port> server/*.sh server/app.conf.template …` | ask | server | — |
| `cd ~/docker-deploy-server && chmod +x *.sh` | ask | server | — |
| `sudo ./server-setup.sh` | ask | server | — |
| `id deployer && ls -l /opt/deploy` | ask | server | `deployer is in the docker group; deploy.sh, apps/, locks/, logs/ exist` |
| `sudo -u deployer /opt/deploy/deploy.sh hello; echo "exit $?"` | ask | server | `prints deploy: expected: deploy <app> <tag> and exit 2` |
| `sudo -iu deployer docker login ghcr.io -u <github-user>` | never | server | `login succeeded` |
| `sudo ufw status verbose` | ask | server | `no ALLOW for the app ports` |
| `ssh-keyscan -p <ssh-port> -t ed25519 <server-host>` (first) | ask | laptop | — |
| `ssh-keyscan … 2>/dev/null \| ssh-keygen -lf -` | ask | laptop | `fingerprint matches the server's own` |
| `ssh -p <ssh-port> ubuntu@<server-host> ssh-keygen -lf …` | ask | server | `fingerprint matches the ssh-keyscan one` |

The `text` block in 2.1 stays unwrapped (it isn't bash).

Agent note to add right after the 2.4 numbered list, before the `docker login` step (no indentation):

```md
::: agent
The token is a secret. Never ask the developer to paste it into the chat. They run the login themselves and type the token at the password prompt.
:::
```

**`add-an-app.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `scp -P <ssh-port> ubuntu@<server-host>:/opt/deploy/deploy.sh server/deploy.sh` | ask | server | — |
| `bash -n server/deploy.sh && echo ok` | run | laptop | `prints ok` |
| `scp -P <ssh-port> server/*.sh server/app.conf.template …` | ask | server | — |
| `cd ~/docker-deploy-server && sudo ./server-setup.sh --skip-docker --skip-swap` (3.2) | ask | server | — |
| `grep -A1 'case "$2" in' /opt/deploy/deploy.sh` | ask | server | `lists the app` |
| `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-0000000; …` (3.2) | ask | server | `exit 3 with conf not found (exit 2 means the whitelist edit didn't take)` |
| `sudo install -o root -g root -m 644 <app>-staging.conf /opt/deploy/apps/` | ask | server | — |
| `pm2 env <id> \| grep -oE …` | ask | server | `prints names only` |
| `for k in PORT API_URL APP_URL; do sudo grep …` | ask | server | `every key prints ok` |
| `sudo grep -oE '^[[:space:]]*[A-Za-z_]…' … \| uniq -d` | ask | server | `prints nothing` |
| `sudo chown 1000 /srv/<app>/staging/.env && sudo chmod 600 …` (indented) | ask | server | — |
| `sudo -u deployer test -f /srv/<app>/staging/.env && echo ok` (indented) | ask | server | `prints ok` |
| `sudo setfacl -m u:deployer:x /home/ubuntu` (indented) | ask | server | — |
| `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-0000000; …` (3.5) | ask | server | `exit 1 with deploy: pull failed (exit 2 or 3 means the conf needs fixing)` |
| `mkdir -p ~/deploy-keys && cd ~/deploy-keys` | run | laptop | — |
| `ssh-keygen -t ed25519 -N '' -C github-actions-<app>-staging …` | ask | laptop | — |
| `ssh-keygen -t ed25519 -N '' -C github-actions-<app>-production …` | ask | laptop | — |
| `scp -P <ssh-port> ~/deploy-keys/<app>_staging.pub …` | ask | server | — |
| `cd ~/docker-deploy-server && sudo ./server-setup.sh … staging:<app>_staging.pub …` | ask | server | — |
| `ssh -i ~/deploy-keys/<app>_staging -p <ssh-port> -o IdentitiesOnly=yes …` | ask | server | `prints deploy: expected: deploy <app> <tag> and exit 2` |

The two bash blocks in 3.2 that show `deploy.sh` lines (`    backend) ;;` and `    backend | <app>) ;;`) are file excerpts, not commands. Leave them unwrapped and add both to `REFERENCE_BLOCKS` with their exact bodies (`{ file: 'add-an-app.md', code: '    backend) ;;' }` and `{ file: 'add-an-app.md', code: '    backend | <app>) ;;' }`). The `ini` block in 3.3 stays unwrapped.

Agent notes, each on its own lines with no indentation:

- Right before "Now edit `server/deploy.sh`." in 3.2:

  ```md
  ::: agent
  Editing `server/deploy.sh` on the laptop is `run`: make the whitelist edit yourself, then run the `bash -n` check.
  :::
  ```

- Right after the 3.4 heading line `## 3.4 Create the \`.env\` {#env-file}`:

  ```md
  ::: agent
  Writing the server `.env` with real values is `never`. The developer creates it on the server. Give them the list of key names (from the app guide's "What goes in the server `.env`"), then ask to run the key checks below, which print names only.
  :::
  ```

- Right after the 3.7 heading line:

  ```md
  ::: agent
  These GitHub settings are `ask`/`github`: give the developer the exact values, or run `gh variable set …` / `gh api` once they approve. Item 3 (pasting the private key into `DEPLOY_SSH_KEY`) is `never`, and so is deleting the private key files afterwards. The developer does both.
  :::
  ```

- [ ] **Step 1:** Wrap every block in both tables and add the four agent notes. Remove `server-setup.md` and `add-an-app.md` from `PENDING`, and add the two reference blocks.
- [ ] **Step 2: Run the checks**

Run: `npm test && npm run docs:build`
Expected: 37 tests pass, and the build passes.

Run: `grep -cE '^ *:{3,} step' docs/deploy-pipeline-guide/deploy-pipeline/server-setup.md docs/deploy-pipeline-guide/deploy-pipeline/add-an-app.md`
Expected: `server-setup.md:15` and `add-an-app.md:20`.

- [ ] **Step 3: Commit**

```bash
git add docs/deploy-pipeline-guide/deploy-pipeline/server-setup.md docs/deploy-pipeline-guide/deploy-pipeline/add-an-app.md test/guide-markers.test.mjs
git commit -m "docs: mark server setup and add-an-app steps for agents"
```

---

### Task 3: Mark Go-Live, Everyday Use and Troubleshooting

**Files:**
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/go-live.md`
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/everyday-use.md`
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/troubleshooting.md`
- Modify: `test/guide-markers.test.mjs` (remove these three and `reference.md` from `PENDING`, and add the `reference.md` block)

**`go-live.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `df -h /` | ask | server | `enough free space for the image` |
| `pm2 stop <old-process-name>` | ask | server | — |
| `sudo systemctl stop <unit>` | ask | server | — |
| `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<sha7>; …` | ask | server | `exit 0` |
| `docker ps --format 'table {{.Names}}…'`: this block is inside `::: v-pre`, so wrap the **whole** v-pre block (from `::: v-pre` to its `:::`) in `:::: step level=ask where=server verify="the container runs the new tag"` … `::::` (four colons, outside v-pre). | ask | server | `the container runs the new tag` |
| `docker logs --tail 100 <app>-staging` | ask | server | `clean startup log, listening on the conf's PORT` |
| `docker logs <app>-staging > ~/<app>-staging-failed.log 2>&1` | ask | server | — |
| `docker rm -f <app>-staging && pm2 start <old-process-name>` | ask | server | — |
| `pm2 delete <old-process-name> && pm2 save` | ask | server | — |
| `pm2 list` | ask | server | `the old process is gone` |
| `git commit --allow-empty -m "chore: first CI deploy" && git push` | ask | github | `both jobs go green` |
| `scp -P <ssh-port> ~/deploy-keys/<app>_production.pub …` (indented) | ask | server | — |
| `cd ~/docker-deploy-server && sudo ./server-setup.sh … production:<app>_production.pub` (indented) | ask | server | — |
| `sudo -u deployer /opt/deploy/deploy.sh deploy <app> production-0000000; …` (indented) | ask | server | `exit 1 with deploy: pull failed` |

Agent note right after the `## 4.1 Push with deploys disabled {#push-disabled}` heading:

```md
::: agent
Committing the pipeline files is `run`. Pushing them, checking or changing `DEPLOY_ENABLED`, and reading the Actions run are `ask`/`github`. Use `gh run watch` / `gh variable` once the developer approves.
:::
```

**`everyday-use.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `docker images <IMAGE> --format …` | ask | server | — |
| `docker logs <app>-staging > ~/<app>-staging-$(date …).log 2>&1` | ask | server | — |
| `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<older-sha7>; …` | ask | server | `exit 0` |
| `docker inspect -f '{{index .Config.Labels "deploy.tag"}}' <app>-staging` (indented) | ask | server | — |
| `sudo -u deployer /opt/deploy/deploy.sh deploy <app> staging-<sha7>; …` (indented) | ask | server | `exit 0` |

The `text` block stays unwrapped.

**`troubleshooting.md`**: all three blocks (`docker logs --tail 200 …`, `docker inspect -f '{{.State.Status}} …'`, `docker run --rm --entrypoint sh …`) are `ask`/`server` with no verify.

**`reference.md`**: the `docker run -d --name <CONTAINER> \` block shows what `deploy.sh` runs and is not a command to run. Leave it unwrapped and add it to `REFERENCE_BLOCKS` with its exact body.

Several of these blocks contain `{{`. If wrapping one makes VitePress fail on Vue interpolation, the block is outside `::: v-pre` today and must stay byte-identical. Report it rather than adding `v-pre`.

- [ ] **Step 1:** Wrap the blocks, add the note, remove `go-live.md`, `everyday-use.md`, `troubleshooting.md` and `reference.md` from `PENDING`, and add the reference block.
- [ ] **Step 2: Run the checks**

Run: `npm test && npm run docs:build`
Expected: 37 tests pass, and the build passes.

Run: `grep -cE '^ *:{3,} step' docs/deploy-pipeline-guide/deploy-pipeline/{go-live,everyday-use,troubleshooting}.md`
Expected: `go-live.md:14`, `everyday-use.md:5` and `troubleshooting.md:3`.

- [ ] **Step 3: Commit**

```bash
git add docs/deploy-pipeline-guide/deploy-pipeline/go-live.md docs/deploy-pipeline-guide/deploy-pipeline/everyday-use.md docs/deploy-pipeline-guide/deploy-pipeline/troubleshooting.md test/guide-markers.test.mjs
git commit -m "docs: mark go-live, everyday-use and troubleshooting steps for agents"
```

---

### Task 4: Mark the Express path and prove the human pages are unchanged

**Files:**
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/express/index.md`
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/express/prepare-your-app.md`
- Modify: `test/guide-markers.test.mjs` (remove both from `PENDING`)

**`express/index.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `unzip express-deploy-kit.zip` | run | laptop | — |

The `text` and `markdown` blocks stay unwrapped.

**`express/prepare-your-app.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `npm pkg set scripts.build=tsc` | run | laptop | — |
| `docker build -t <app>:local .` | run | laptop | `the image builds` |
| `docker run --rm --init --network host -v "$PWD/.env.local-test:/app/.env:ro" <app>:local` | run | laptop | `the app starts; the curl check below answers` |
| `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:<PORT>/` | run | laptop | `any HTTP code, not 000` |

The `dockerfile` block stays unwrapped.

Agent note right after the `## Test the image locally before pushing {#test-image-locally}` heading:

```md
::: agent
Create `.env.local-test` yourself, with throwaway values that point at local services. Never copy values from a real `.env`. The `docker run` blocks the terminal, so run it in the background and stop it after the curl check.
:::
```

- [ ] **Step 1:** Wrap the blocks, add the note, and remove both pages from `PENDING`. After this, `PENDING` holds only the four `nextjs/` pages.
- [ ] **Step 2: Run the checks**

Run: `npm test && npm run docs:build`
Expected: 37 tests pass, the build prints `[agent-docs] wrote 20 agent pages`, and there is no empty-sidebar warning.

- [ ] **Step 3: Prove that no human page changed apart from the index button**

```bash
cur=$PWD; base=$(mktemp -d)
git worktree add "$base/main" main && (cd "$base/main" && npm ci && npm run docs:build)
node scripts/compare-doc-html.mjs "$base/main/docs/.vitepress/dist" "$cur/docs/.vitepress/dist"
git worktree remove --force "$base/main"
```

Expected: exactly one line, `differs: deploy-pipeline-guide/deploy-pipeline/index.html`. Any other `differs:` line is a failure, so stop and report it. Always remove the worktree.

- [ ] **Step 4: Check the agent copies**

Run: `grep -c '::: step' docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/{server-setup,add-an-app,go-live,everyday-use,troubleshooting}.md docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/express/{index,prepare-your-app}.md`
Expected: `15`, `20`, `14`, `5`, `3`, `1`, `4`.

Run: `grep -c '::: agent\|<script' docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/add-an-app.md`
Expected: `0`.

- [ ] **Step 5: Commit**

```bash
git add docs/deploy-pipeline-guide/deploy-pipeline/express/index.md docs/deploy-pipeline-guide/deploy-pipeline/express/prepare-your-app.md test/guide-markers.test.mjs
git commit -m "docs: mark the Express path steps for agents"
```
