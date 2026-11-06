# Agent-ready Deploy Pipeline guide, plan 4: full URLs and a route list

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the live site, every link in the agent copies is a full URL (`https://…`), so an agent can follow the guide even when it doesn't know which URL it fetched. The agent index also lists the whole route for each path, in order, before the agent starts.

**Architecture:**
- `toAgentCopy` and `writeAgentDocs` take an optional `origin` (for example `https://mismailk.github.io`). With it, links become `origin + base + path`. Without it, local builds and the existing tests behave exactly as now.
- The build reads `origin` from `VITEPRESS_SITE_ORIGIN`. CI sets that from the `origin` output of `actions/configure-pages`.
- The route list is written once, as relative links inside the index's `::: agent` preamble, and the transformer turns it into full URLs. A new repo test proves that every link in every agent copy resolves to a real agent page.

**Tech Stack:** As in plans 1 to 3.

**Spec:** `.superpowers/specs/2026-11-06-agent-ready-deploy-pipeline-design.md`, §2. This plan replaces the spec's "builder's call" on the site URL. The developer pointed out that relative links depend on the agent resolving them against the fetched URL. Plans 1 to 3 are already on `feat/agent-docs-mcp`, and this plan ships in the same PR (#8).

## Global Constraints

- Branch `feat/agent-docs-mcp`. One commit per task. Never push. Never commit `sidebar.gen.json`, `cache/`, `dist/` or anything under `.superpowers/`.
- Without `origin`, the output must stay byte-identical to today's. All 37 existing tests pass unchanged.
- The human pages don't change. The route list lives inside the existing `::: agent` block.
- The env var name is `VITEPRESS_SITE_ORIGIN`: scheme and host, no path, no trailing slash. A trailing slash is tolerated and stripped.

## Review Focus

1. **The origin given with a trailing slash** (`https://x.github.io/`): must not produce `//` in URLs. Task 1 tests this.
2. **A local build with no origin set**: it must keep relative links, and the existing tests must stay byte-identical. Task 1 runs the existing tests unchanged.
3. **A route entry pointing at a page that doesn't exist** (a typo like `./express/prepare-you-app`): the agent would hit a 404 mid-route. The new link test in Task 2 must catch it.
4. **Links that leave the guide** (for example `/reference/commands`): with an origin set they become full website URLs, never agent URLs. Task 1 tests this.
5. **CI without the configure-pages output** (a `workflow_dispatch` on a fork): the build must still pass and fall back to relative links. That's covered by Global Constraint 2 and Task 1's no-origin path.

---

### Task 1: Full URLs when an origin is known

**Files:**
- Modify: `scripts/agent-docs.mjs`
- Modify: `test/agent-docs.test.mjs`
- Modify: `docs/.vitepress/config.mjs` (the `buildEnd` hook)
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- `toAgentCopy(source, { relPath, base, scope?, origin? }) -> string`
- `writeAgentDocs({ srcDir, outDir, base, scope?, origin? }) -> string[]`

With `origin` set (after stripping any trailing `/`), the link rules from plan 1 change as follows:
- An in-scope page link becomes `origin + joinBase(base, 'agent/' + pagePath) + hash`, for example `https://x.github.io/documentation/agent/deploy-pipeline-guide/deploy-pipeline/add-an-app.md#env-file`.
- A `withBase('/X')` anchor becomes `[TEXT](origin + joinBase(base, X))`.
- A link that leaves the scope becomes `origin + siteUrl(base, pagePath)`.

Without `origin`, every rule stays exactly as it is today.

- [ ] **Step 1: Write the failing tests** (append to `test/agent-docs.test.mjs`):

```js
test('toAgentCopy writes full URLs when an origin is given', () => {
  const o = { relPath: 'deploy-pipeline-guide/deploy-pipeline/express/index.md', base: '/documentation/', origin: 'https://x.github.io/' }
  const src = [
    '# T',
    '[a](./prepare-your-app#pick-your-values) [b](../) [c](../add-an-app#env-file) [e](../../../reference/commands) [g](#steps)',
    `**<a :href="withBase('/downloads/express-deploy-kit.zip')" download>⬇ kit</a>**`,
  ].join('\n')
  const out = toAgentCopy(src, o)
  const A = 'https://x.github.io/documentation/agent/deploy-pipeline-guide/deploy-pipeline'
  assert.match(out, new RegExp(`\\[a\\]\\(${A}/express/prepare-your-app\\.md#pick-your-values\\)`))
  assert.match(out, new RegExp(`\\[b\\]\\(${A}/index\\.md\\)`))
  assert.match(out, new RegExp(`\\[c\\]\\(${A}/add-an-app\\.md#env-file\\)`))
  assert.match(out, /\[e\]\(https:\/\/x\.github\.io\/documentation\/reference\/commands\)/)
  assert.match(out, /\[g\]\(#steps\)/)
  assert.match(out, /\[⬇ kit\]\(https:\/\/x\.github\.io\/documentation\/downloads\/express-deploy-kit\.zip\)/)
  assert.doesNotMatch(out, /github\.io\/\//)
})

test('writeAgentDocs passes the origin through', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-origin-'))
  const src = path.join(root, 'docs'), out = path.join(root, 'dist')
  fs.mkdirSync(path.join(src, 'deploy-pipeline-guide/deploy-pipeline'), { recursive: true })
  fs.writeFileSync(path.join(src, 'deploy-pipeline-guide/deploy-pipeline/index.md'), '# I\n\n[s](./server-setup)\n')
  writeAgentDocs({ srcDir: src, outDir: out, base: '/', origin: 'https://x.github.io' })
  const copy = fs.readFileSync(path.join(out, 'agent/deploy-pipeline-guide/deploy-pipeline/index.md'), 'utf8')
  assert.match(copy, /\[s\]\(https:\/\/x\.github\.io\/agent\/deploy-pipeline-guide\/deploy-pipeline\/server-setup\.md\)/)
  fs.rmSync(root, { recursive: true, force: true })
})
```

- [ ] **Step 2: Run them to check they fail**

Run: `node --test test/agent-docs.test.mjs`
Expected: the 2 new tests FAIL, and every other test passes.

- [ ] **Step 3: Implement the `origin` option** in `scripts/agent-docs.mjs`. Thread it through `writeAgentDocs`, `toAgentCopy` and `rewriteLine`. If `origin` is falsy, the code path must be the current one.

- [ ] **Step 4: Wire it into the build**
  - In `docs/.vitepress/config.mjs`, pass `origin: process.env.VITEPRESS_SITE_ORIGIN` to `writeAgentDocs`. Change the log line to `[agent-docs] wrote ${written.length} agent pages` + (origin ? ` with full URLs for ${origin}` : '').
  - In `.github/workflows/deploy.yml`, give the "Setup Pages" step `id: pages`, and add `VITEPRESS_SITE_ORIGIN: ${{ steps.pages.outputs.origin }}` to the "Build with VitePress" step's `env`, next to `VITEPRESS_BASE`. Change nothing else in the workflow.

- [ ] **Step 5: Run the checks**

Run: `npm test`
Expected: 39 tests pass.

Run: `npm run docs:build 2>&1 | grep agent-docs && grep -c 'https://' docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/server-setup.md`
Expected: `[agent-docs] wrote 20 agent pages` (with no origin, so links stay relative), and `0`.

Run: `VITEPRESS_BASE=/documentation/ VITEPRESS_SITE_ORIGIN=https://mismailk.github.io npm run docs:build 2>&1 | grep agent-docs && grep -o 'https://mismailk.github.io/documentation/agent/deploy-pipeline-guide/deploy-pipeline/[a-z/-]*\.md' docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/express/index.md | sort -u | head -3`
Expected: `[agent-docs] wrote 20 agent pages with full URLs for https://mismailk.github.io`, and full agent URLs such as `…/deploy-pipeline/add-an-app.md`.

Run: `git diff .github/workflows/deploy.yml`
Expected: only the `id: pages` line and the one `env` line are added.

- [ ] **Step 6: Commit**

```bash
git add scripts/agent-docs.mjs test/agent-docs.test.mjs docs/.vitepress/config.mjs .github/workflows/deploy.yml
git commit -m "feat: full URLs in agent copies when the site origin is known"
```

---

### Task 2: The route list, and a test that every agent link resolves

**Files:**
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/index.md` (inside the existing `::: agent` block only)
- Modify: `test/guide-markers.test.mjs`

- [ ] **Step 1: Write the failing test** (append to `test/guide-markers.test.mjs`; add the `os` import and import `writeAgentDocs` with `findUnmarkedCommandBlocks`):

```js
test('every link in the agent copies resolves to an agent page', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-links-'))
  writeAgentDocs({ srcDir: 'docs', outDir: out, base: '/' })
  const root = path.join(out, 'agent')
  const broken = []
  for (const page of pages(path.join(root, 'deploy-pipeline-guide/deploy-pipeline'))) {
    const file = path.join(root, 'deploy-pipeline-guide/deploy-pipeline', page)
    const text = fs.readFileSync(file, 'utf8').replace(/^ *```[\s\S]*?^ *```/gm, '')
    for (const [, target] of text.matchAll(/\]\((\.{1,2}\/[^)#\s]*)/g)) {
      if (!fs.existsSync(path.join(path.dirname(file), target))) broken.push(`${page} -> ${target}`)
    }
  }
  fs.rmSync(out, { recursive: true, force: true })
  assert.deepEqual(broken, [])
})

test('the agent index lists the whole route for both paths', () => {
  const src = fs.readFileSync(path.join(GUIDE, 'index.md'), 'utf8')
  const route = src.slice(src.indexOf('**Route.**'), src.indexOf('**Pick the path.**'))
  for (const link of ['./how-it-works', './express/app-readiness', './express/prepare-your-app', './server-setup', './add-an-app', './go-live',
    './nextjs/how-it-works', './nextjs/app-readiness', './nextjs/prepare-your-app', './nextjs/go-live']) {
    assert.ok(route.includes(`](${link})`), `route list is missing ${link}`)
  }
})
```

- [ ] **Step 2: Run them to check which fail**

Run: `node --test test/guide-markers.test.mjs`
Expected: the route test FAILS because there is no `**Route.**` section yet. The link test PASSES, since today's links already resolve. It guards the new route list.

- [ ] **Step 3: Add the route list.** In `index.md`, inside the `::: agent` block, insert this verbatim immediately before the line that starts `**Pick the path.**`, followed by one blank line:

```md
**Route.** Read the whole route first, then work through it in order. Skip Server Setup if the server already runs the pipeline for another app.

- Express:
  1. [How It Works](./how-it-works)
  2. [Is Your App Ready?](./express/app-readiness)
  3. [Prepare Your App](./express/prepare-your-app)
  4. [Server Setup](./server-setup)
  5. [Add the App to the Server](./add-an-app)
  6. [First Deploy and Go-Live](./go-live)
- Next.js:
  1. [How It Works](./how-it-works), then [Next.js specifics](./nextjs/how-it-works)
  2. [Is Your App Ready?](./nextjs/app-readiness)
  3. [Prepare Your App](./nextjs/prepare-your-app)
  4. [Server Setup](./server-setup)
  5. [Add the App to the Server](./add-an-app)
  6. [Go-Live](./nextjs/go-live), which adds the Next.js checks to [First Deploy and Go-Live](./go-live)

After go-live: [Everyday Use](./everyday-use), [Troubleshooting](./troubleshooting), [Reference](./reference).
```

- [ ] **Step 4: Run the checks**

Run: `npm test && npm run docs:build`
Expected: 41 tests pass, and the build passes with 20 agent pages and no empty-sidebar warning.

Run: `grep -c 'Read the whole route first' docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/index.md docs/.vitepress/dist/deploy-pipeline-guide/deploy-pipeline/index.html docs/.vitepress/dist/assets/chunks/@localSearchIndex*.js`
Expected: `1` for the agent copy, and `0` for the HTML page and the search index.

- [ ] **Step 5: Prove the human pages are unchanged**

```bash
cur=$PWD; base=$(mktemp -d)
git worktree add "$base/main" main && (cd "$base/main" && npm ci && npm run docs:build)
node scripts/compare-doc-html.mjs "$base/main/docs/.vitepress/dist" "$cur/docs/.vitepress/dist"
git worktree remove --force "$base/main"
```

Expected: exactly one line, `differs: deploy-pipeline-guide/deploy-pipeline/index.html`. Always remove the worktree.

- [ ] **Step 6: Commit**

```bash
git add docs/deploy-pipeline-guide/deploy-pipeline/index.md test/guide-markers.test.mjs
git commit -m "docs: route list in the agent preamble, and a test that agent links resolve"
```
