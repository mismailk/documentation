# Agent-ready Deploy Pipeline guide, plan 3: Next.js path

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mark every runnable command on the Next.js path, empty the `PENDING` list so the guide-wide check covers every page, and prove one last time that the human pages are unchanged.

**Architecture:** Content only, using plan 1's markers and plan 2's guide-wide test. No code changes.

**Tech Stack:** As in plans 1 and 2.

**Spec:** `.superpowers/specs/2026-11-06-agent-ready-deploy-pipeline-design.md`. Plans 1 and 2 (`2026-11-06-agent-docs-mechanism.md`, `2026-11-06-agent-docs-shared-express.md`) must already be on `feat/agent-docs-mcp`.

## Global Constraints

The same as plan 2. In short:
- Only add marker lines, at the fence's own indentation. Never change existing lines.
- `verify` comes from the page's own text.
- Agent notes appear only where this plan gives their text.
- One commit per task, and never push.
- `npm test` and `npm run docs:build` pass after each task.

## Review Focus

1. **Public values are not secrets.** `~/public-env/*.env` holds `NEXT_PUBLIC_*` values that ship to every browser, so the agent may write those files (`run`). The server `.env` stays `never`. Task 1's note says so.
2. **Long-running local container.** The `docker run` for the local test blocks the terminal, so the agent must background it and stop it after the checks. Task 1's note covers this.
3. **The "not on 3000" check prints `000` on success.** The verify text has to say that, or the agent will read `000` as a failure. Task 1 sets it.
4. **`ls -la …/.env*` on the current app** lists names only and runs where the app runs today, which is usually the server. It is `ask`, not `never`. Task 1 sets it.
5. **Steps inside list items** in `everyday-use.md`: they are indented, and plan 2 Task 1 already covers that. Task 2's HTML comparison checks it.

---

### Task 1: Mark the Next.js index and Prepare Your App

**Files:**
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/nextjs/index.md`
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/nextjs/prepare-your-app.md`
- Modify: `test/guide-markers.test.mjs` (remove both pages from `PENDING`)

**`nextjs/index.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `unzip nextjs-deploy-kit.zip` | run | laptop | — |

**`nextjs/prepare-your-app.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `mkdir -p public && touch public/.gitkeep` | run | laptop | — |
| `npm ci && npm run build && ls .next/standalone/server.js` | run | laptop | `ls prints .next/standalone/server.js` |
| `mkdir -p ~/public-env` | run | laptop | — |
| `docker build --build-arg PUBLIC_ENV_B64=… -t <app>:local .` | run | laptop | `the image builds` |
| `docker run --rm --init --network host --memory 384m …` | run | laptop | `the app starts; the curl checks below answer` |
| `curl … http://127.0.0.1:4100/` | run | laptop | `any HTTP code, not 000` |
| `curl … http://127.0.0.1:3000/` | run | laptop | `prints 000 (nothing listens on 3000), unless another local app uses 3000` |
| `asset=$(curl -s http://127.0.0.1:4100/ \| …` | run | laptop | `prints 200` |
| `docker run --rm --entrypoint grep <app>:local -rl …` | run | laptop | `lists at least one file` |
| `docker run --rm --entrypoint sh <app>:local -c 'test ! -e …'` | run | laptop | `prints ok` |
| `docker stats --no-stream` | run | laptop | `memory well under the cap` |
| `ls -la /path/to/current/app/.env*` | ask | server | — |

The `js` and `ini` blocks stay unwrapped.

Agent notes, each on its own lines with no indentation:

- Right after the `## Public build values (\`NEXT_PUBLIC_*\`) {#public-build-values}` heading:

  ```md
  ::: agent
  Public values are not secrets: they ship to every browser. Write `~/public-env/<app>.staging.env` and `.production.env` yourself (`run`), from values in the repo or that the developer gives you. Refuse any name that isn't `NEXT_PUBLIC_*`.
  :::
  ```

- Right after the `## Test the image locally before pushing {#test-image-locally}` heading:

  ```md
  ::: agent
  Create the test `.env` yourself, with throwaway values that point at local services. Never copy values from a real `.env`. The `docker run` blocks the terminal, so run it in the background and stop it after the checks.
  :::
  ```

- Right after the `## Public build values on GitHub {#public-env-variables}` heading:

  ```md
  ::: agent
  Creating the repository variables is `ask`/`github`: run `gh variable set PUBLIC_ENV_STAGING < ~/public-env/<app>.staging.env` (and the production one) once the developer approves.
  :::
  ```

- [ ] **Step 1:** Wrap the blocks, add the three notes, and remove both pages from `PENDING`.
- [ ] **Step 2: Run the checks**

Run: `npm test && npm run docs:build`
Expected: 37 tests pass, and the build passes.

Run: `grep -cE '^ *:{3,} step' docs/deploy-pipeline-guide/deploy-pipeline/nextjs/{index,prepare-your-app}.md`
Expected: `index.md:1` and `prepare-your-app.md:12`.

- [ ] **Step 3: Commit**

```bash
git add docs/deploy-pipeline-guide/deploy-pipeline/nextjs/index.md docs/deploy-pipeline-guide/deploy-pipeline/nextjs/prepare-your-app.md test/guide-markers.test.mjs
git commit -m "docs: mark the Next.js setup steps for agents"
```

---

### Task 2: Mark Next.js Go-Live and Everyday Use, and close the check

**Files:**
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/nextjs/go-live.md`
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/nextjs/everyday-use.md`
- Modify: `test/guide-markers.test.mjs` (`PENDING` becomes empty)

**`nextjs/go-live.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `docker logs --tail 100 <app>-staging` | ask | server | `listening on the conf's PORT, not 3000` |
| `docker exec <app>-staging grep -rl 'staging-api.example.com' /app/.next` | ask | server | `lists at least one file` |

**`nextjs/everyday-use.md`**

| Block (first line) | level | where | verify |
|---|---|---|---|
| `git commit --allow-empty -m "chore: rebuild with new public values" && git push` (indented) | ask | github | `both jobs go green` |
| `docker exec <app>-staging grep -rl 'new-value' /app/.next` (indented) | ask | server | `lists at least one file` |

- [ ] **Step 1:** Wrap the blocks and empty `PENDING` (`new Set([])`).
- [ ] **Step 2: Run the checks**

Run: `npm test && npm run docs:build`
Expected: 37 tests pass, the guide-wide check now covers all 20 pages, and the build prints `[agent-docs] wrote 20 agent pages`.

- [ ] **Step 3: Prove that no human page changed apart from the index button**

```bash
cur=$PWD; base=$(mktemp -d)
git worktree add "$base/main" main && (cd "$base/main" && npm ci && npm run docs:build)
node scripts/compare-doc-html.mjs "$base/main/docs/.vitepress/dist" "$cur/docs/.vitepress/dist"
git worktree remove --force "$base/main"
```

Expected: exactly one line, `differs: deploy-pipeline-guide/deploy-pipeline/index.html`. Any other line is a failure, so stop and report it. Always remove the worktree.

- [ ] **Step 4: Check the totals**

Run: `cat docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/{,*/}*.md | grep -cE '^ *:{3,} step'`
Expected: `80`. That is 1 (index) + 15 + 20 + 14 + 5 + 3 (shared) + 1 + 4 (Express) + 1 + 12 + 2 + 2 (Next.js).

- [ ] **Step 5: Commit**

```bash
git add docs/deploy-pipeline-guide/deploy-pipeline/nextjs/go-live.md docs/deploy-pipeline-guide/deploy-pipeline/nextjs/everyday-use.md test/guide-markers.test.mjs
git commit -m "docs: mark the Next.js go-live and everyday-use steps for agents"
```
