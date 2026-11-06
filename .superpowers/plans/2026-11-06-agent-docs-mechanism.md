# Agent-ready Deploy Pipeline guide, plan 1: mechanism

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Invisible `::: step` and `::: agent` markers in the guide sources, generated agent `.md` copies of every Deploy Pipeline page written at build time to `/agent/…`, an agent preamble plus a "Copy link for your agent" button on the guide's index page, and a tool that proves the human pages didn't change.

**Architecture:** One new module, `scripts/agent-docs.mjs`, holds four pieces: the step attribute parser, the markdown-it container registration, the unmarked-block scanner, and the agent-copy transformer and writer. `docs/.vitepress/config.mjs` uses it twice: in `markdown.config`, so the markers render to nothing on the site, and in `buildEnd`, which writes `dist/agent/<path>.md`. A second small script, `scripts/compare-doc-html.mjs`, compares the `<main>` HTML of two builds.

**Tech Stack:** Node 22 (CI), VitePress 1.6.4, `markdown-it` ^14.1.0 and `markdown-it-container` ^4.0.0 (new devDependencies, the versions VitePress itself uses), `gray-matter`, `node:test`.

**Spec:** `.superpowers/specs/2026-11-06-agent-ready-deploy-pipeline-design.md`. This is plan 1 of 3: plan 2 marks the shared pages and the Express pages, and plan 3 marks the Next.js pages. All three ship in one PR from `feat/agent-docs-mcp`.

## Global Constraints

- Branch `feat/agent-docs-mcp`. One commit per task, using Conventional Commits. Never push. Never commit `docs/.vitepress/sidebar.gen.json`, `docs/.vitepress/cache/` or `dist/`.
- Levels: `run` | `ask` | `never`. Places: `laptop` | `server` | `github`. `verify` is optional.
- Agent copies go to `<outDir>/agent/<source path relative to docs/>`, for example `dist/agent/deploy-pipeline-guide/deploy-pipeline/add-an-app.md`. Only files under `docs/deploy-pipeline-guide/` are emitted (`AGENT_SCOPE = 'deploy-pipeline-guide'`).
- The website must look unchanged for humans. The only visible addition is the button on `docs/deploy-pipeline-guide/deploy-pipeline/index.md`.
- Agent copies must never show up in the sidebar or the local search.
- `npm test` must keep the existing 12 tests passing. Use the npm scripts for builds, never raw `vitepress`.

## Review Focus

1. **A typo in a step marker** (`level=mayb`, missing `where`, `wehre=server`): the build must fail with a message that names the bad attribute. It must never quietly render or emit a step without metadata. Task 1 tests this.
2. **`:::` inside a code fence** (a fenced block that shows container syntax): the scanner and transformer must not treat it as an open or close tag. Tasks 2 and 3 test this.
3. **A relative link that leaves the guide** (for example `../../reference/commands`): it must become a website URL, never a dangling agent `.md` link. Task 3 tests this.
4. **Clipboard unavailable or blocked** (plain-http preview, a denied permission): the button must still give the user the URL by showing it as selectable text. Task 4 checks this manually.
5. **A non-root base** (`VITEPRESS_BASE=/documentation/`, as in CI): download links in agent copies and the copied URL must include the base. Tasks 3 and 4 cover it.

---

### Task 1: Step markers and invisible containers

**Files:**
- Create: `scripts/agent-docs.mjs`
- Create: `test/agent-docs.test.mjs`
- Modify: `package.json` (devDependencies)
- Modify: `docs/.vitepress/config.mjs` (add `markdown.config`)

**Interfaces:**
- Produces, in `scripts/agent-docs.mjs`:
  - `LEVELS = ['run', 'ask', 'never']`
  - `PLACES = ['laptop', 'server', 'github']`
  - `AGENT_SCOPE = 'deploy-pipeline-guide'`
  - `parseStepAttrs(info: string) -> { level: string, where: string, verify?: string }`: `info` is the text after `step`. It throws an `Error` whose message contains the attribute's name when `level` or `where` is missing or invalid, or when an unknown key appears.
  - `useAgentContainers(md: MarkdownIt) -> void`: registers the `step` and `agent` containers.

- [ ] **Step 1: Add the devDependencies**

```bash
npm install --save-dev markdown-it@^14.1.0 markdown-it-container@^4.0.0
```

Expected: `package.json` and `package-lock.json` change, and nothing else does.

- [ ] **Step 2: Write the failing tests** in `test/agent-docs.test.mjs`

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import { parseStepAttrs, useAgentContainers } from '../scripts/agent-docs.mjs'

test('parseStepAttrs reads level, where and a quoted verify with escaped quotes', () => {
  assert.deepEqual(parseStepAttrs('level=run where=laptop'), { level: 'run', where: 'laptop' })
  assert.deepEqual(
    parseStepAttrs(`level=ask where=server verify="grep -A1 'case \\"$2\\" in' /opt/deploy/deploy.sh"`),
    { level: 'ask', where: 'server', verify: `grep -A1 'case "$2" in' /opt/deploy/deploy.sh` },
  )
})

test('parseStepAttrs rejects missing, invalid and unknown attributes', () => {
  assert.throws(() => parseStepAttrs('where=laptop'), /level/)
  assert.throws(() => parseStepAttrs('level=mayb where=laptop'), /level/)
  assert.throws(() => parseStepAttrs('level=run'), /where/)
  assert.throws(() => parseStepAttrs('level=run where=moon'), /where/)
  assert.throws(() => parseStepAttrs('level=run wehre=server'), /wehre/)
})

const md = () => { const m = new MarkdownIt(); useAgentContainers(m); return m }
const fence = '```bash\nnpm ci\n```\n'

test('a step container renders exactly its content', () => {
  assert.equal(md().render(`::: step level=run where=laptop\n${fence}:::\n`), md().render(fence))
})

test('an agent container renders nothing', () => {
  assert.equal(md().render(`Before.\n\n::: agent\nAgent-only **text**.\n\n${fence}:::\n\nAfter.\n`), md().render('Before.\n\nAfter.\n'))
})

test('a step container with bad attributes fails the render', () => {
  assert.throws(() => md().render(`::: step level=maybe where=laptop\n${fence}:::\n`), /level/)
})
```

- [ ] **Step 3: Run the tests to check they fail**

Run: `node --test test/agent-docs.test.mjs`
Expected: FAIL. The module isn't found, or the exports are missing.

- [ ] **Step 4: Implement `parseStepAttrs` and `useAgentContainers`** in `scripts/agent-docs.mjs`

- `parseStepAttrs`: tokenize `key=value` and `key="…"`, where `\"` inside quotes becomes `"`. Keys allowed: `level`, `where`, `verify`.
- `useAgentContainers`: use `markdown-it-container`. For `step`, `render` calls `parseStepAttrs` on the opening token's info (throwing on bad input) and returns `''` for both the open and the close tag. For `agent`, register the container, then add a core rule after `'block'` that removes every token from `container_agent_open` to its matching `container_agent_close`, including nested tokens.

- [ ] **Step 5: Wire the containers into the site** in `docs/.vitepress/config.mjs`

Add `markdown: { config: (md) => useAgentContainers(md) }` to `defineConfig`, imported from `../../scripts/agent-docs.mjs`. Keep the `normalizeBase` and `loadSidebar` exports as they are.

- [ ] **Step 6: Run all the tests and the build**

Run: `npm test && npm run docs:build`
Expected: 17 tests pass (12 + 5). The build passes with no empty-sidebar warning. The guide sources have no markers yet, so the site doesn't change.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json scripts/agent-docs.mjs test/agent-docs.test.mjs docs/.vitepress/config.mjs
git commit -m "feat: invisible step and agent containers for agent-ready guides"
```

---

### Task 2: Unmarked command-block scanner

**Files:**
- Modify: `scripts/agent-docs.mjs`
- Modify: `test/agent-docs.test.mjs`

**Interfaces:**
- Consumes: `parseStepAttrs` (Task 1).
- Produces: `findUnmarkedCommandBlocks(source: string) -> Array<{ line: number, code: string }>`. It lists every fenced block whose language is `bash`, `sh` or `shell` and that isn't inside a `::: step` container. `line` is the 1-based line of the opening fence, and `code` is the block's body without the fences. Plans 2 and 3 use this function in a repo test with an allowlist of reference-only blocks.

The scan works line by line, and it is also used by Task 3:
- Inside a fenced block (from a line starting with ```` ``` ```` or `~~~` to the matching close), container syntax is ignored.
- Outside a fence, a line matching `/^:::+\s*(\S+)/` opens a container with that name, and `/^:::+\s*$/` closes the innermost open one.

- [ ] **Step 1: Write the failing tests**

```js
import { findUnmarkedCommandBlocks } from '../scripts/agent-docs.mjs'

test('findUnmarkedCommandBlocks reports bash blocks outside steps only', () => {
  const src = [
    '# T',                                  // 1
    '```bash', 'npm ci', '```',             // 2-4  unmarked
    '::: step level=run where=laptop',      // 5
    '```bash', 'npm test', '```',           // 6-8  marked
    ':::',                                  // 9
    '::: tip',                              // 10
    '```sh', 'ls', '```',                   // 11-13 unmarked (tip is not a step)
    ':::',                                  // 14
    '```text', 'tree', '```',               // 15-17 not a command language
  ].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(src), [{ line: 2, code: 'npm ci' }, { line: 11, code: 'ls' }])
})

test('findUnmarkedCommandBlocks ignores ::: inside code fences', () => {
  const src = ['::: step level=run where=laptop', '````md', ':::', '````', '```bash', 'echo hi', '```', ':::'].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(src), [])
})

test('findUnmarkedCommandBlocks sees steps nested in v-pre', () => {
  const src = ['::: v-pre', '::: step level=run where=laptop', '```bash', 'grep -rn x .', '```', ':::', ':::'].join('\n')
  assert.deepEqual(findUnmarkedCommandBlocks(src), [])
})
```

- [ ] **Step 2: Run them to check they fail**

Run: `node --test test/agent-docs.test.mjs`
Expected: the 3 new tests FAIL because `findUnmarkedCommandBlocks` isn't exported.

- [ ] **Step 3: Implement `findUnmarkedCommandBlocks`**, with the line scan as an internal helper that Task 3 reuses.

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: 20 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/agent-docs.mjs test/agent-docs.test.mjs
git commit -m "feat: find command blocks not wrapped in a step marker"
```

---

### Task 3: Agent copies written at build time

**Files:**
- Modify: `scripts/agent-docs.mjs`
- Modify: `test/agent-docs.test.mjs`
- Modify: `docs/.vitepress/config.mjs` (add `buildEnd`)

**Interfaces:**
- Consumes: the line scan helper (Task 2), `AGENT_SCOPE` (Task 1).
- Produces:
  - `toAgentCopy(source: string, opts: { relPath: string, base: string, scope?: string }) -> string`: `relPath` is relative to `docs/` (for example `deploy-pipeline-guide/deploy-pipeline/add-an-app.md`), and `base` is the normalized site base (`/` or `/documentation/`).
  - `writeAgentDocs(opts: { srcDir: string, outDir: string, base: string, scope?: string }) -> string[]` writes `<outDir>/agent/<relPath>` for every `.md` file under `<srcDir>/<scope>` and returns the written `relPath`s, sorted.

Transformation rules (spec §2), applied in this order:
1. Parse with `gray-matter` and keep the content. If the content has no line starting with `# `, prepend `# <frontmatter title>` followed by a blank line (only when a title exists).
2. Remove `<script setup>…</script>` blocks and any `<style>…</style>` blocks.
3. Unwrap `::: v-pre` and `::: agent`: drop their opening and closing lines and keep what's between them. `::: step …` and every other container stay verbatim.
4. Rewrite links outside code fences:
   - `<a :href="withBase('/X')"…>TEXT</a>` becomes `[TEXT](<base>X)`. For example, with base `/documentation/`, `withBase('/downloads/a.zip')` becomes `/documentation/downloads/a.zip`.
   - Markdown link targets that start with `./` or `../`: split off any `#hash`. Resolve the path against the directory of `relPath`, treating a bare `../` or `./` as that directory's `index`. If the resolved page is inside `scope`, rewrite the target to a relative path ending in `.md` (`./express/` → `./express/index.md`, `../add-an-app#env-file` → `../add-an-app.md#env-file`, `../#download-the-kit` → `../index.md#download-the-kit`). Otherwise rewrite it to the website route `<base><route>` (`../../reference/commands` → `/documentation/reference/commands`).
   - Leave `http(s):`, `mailto:` and `#…` targets alone.
5. Leave everything else byte for byte.

- [ ] **Step 1: Write the failing tests**

```js
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { toAgentCopy, writeAgentDocs } from '../scripts/agent-docs.mjs'

const rel = 'deploy-pipeline-guide/deploy-pipeline/express/index.md'
const opts = { relPath: rel, base: '/documentation/' }

test('toAgentCopy turns the frontmatter title into a heading and drops script and style', () => {
  const out = toAgentCopy('---\ntitle: Express\norder: 0\n---\n<script setup>\nimport { withBase } from "vitepress"\n</script>\n\nBody.\n', opts)
  assert.match(out, /^# Express\n/)
  assert.doesNotMatch(out, /script|order:/)
  assert.match(out, /Body\./)
})

test('toAgentCopy keeps step markers, unwraps agent and v-pre, keeps tip', () => {
  const src = '# T\n\n::: agent\nAgent text.\n:::\n\n::: v-pre\n{{X}}\n:::\n\n::: step level=run where=laptop\n```bash\nnpm ci\n```\n:::\n\n::: tip\nHi\n:::\n'
  const out = toAgentCopy(src, opts)
  assert.match(out, /Agent text\./)
  assert.doesNotMatch(out, /::: agent|::: v-pre/)
  assert.match(out, /::: step level=run where=laptop\n```bash\nnpm ci\n```\n:::/)
  assert.match(out, /::: tip\nHi\n:::/)
})

test('toAgentCopy rewrites links to agent copies, downloads and out-of-guide pages', () => {
  const src = [
    '# T',
    '[a](./prepare-your-app#pick-your-values) [b](../) [c](../add-an-app#env-file) [d](../#download-the-kit)',
    '[e](../../../reference/commands) [f](https://x.y/z) [g](#steps)',
    `**<a :href="withBase('/downloads/express-deploy-kit.zip')" download>⬇ express-deploy-kit.zip</a>**`,
    '```bash', 'echo "[not](./a-link)"', '```',
  ].join('\n')
  const out = toAgentCopy(src, opts)
  assert.match(out, /\[a\]\(\.\/prepare-your-app\.md#pick-your-values\)/)
  assert.match(out, /\[b\]\(\.\.\/index\.md\)/)
  assert.match(out, /\[c\]\(\.\.\/add-an-app\.md#env-file\)/)
  assert.match(out, /\[d\]\(\.\.\/index\.md#download-the-kit\)/)
  assert.match(out, /\[e\]\(\/documentation\/reference\/commands\)/)
  assert.match(out, /\[f\]\(https:\/\/x\.y\/z\) \[g\]\(#steps\)/)
  assert.match(out, /\*\*\[⬇ express-deploy-kit\.zip\]\(\/documentation\/downloads\/express-deploy-kit\.zip\)\*\*/)
  assert.match(out, /echo "\[not\]\(\.\/a-link\)"/)
})

test('writeAgentDocs mirrors the scoped tree under agent/ and skips other sections', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-docs-'))
  const src = path.join(root, 'docs'), out = path.join(root, 'dist')
  for (const [f, c] of Object.entries({
    'deploy-pipeline-guide/deploy-pipeline/index.md': '# Index\n',
    'deploy-pipeline-guide/deploy-pipeline/express/index.md': '# Express\n',
    'reference/commands.md': '# Commands\n',
  })) { fs.mkdirSync(path.dirname(path.join(src, f)), { recursive: true }); fs.writeFileSync(path.join(src, f), c) }
  assert.deepEqual(writeAgentDocs({ srcDir: src, outDir: out, base: '/' }), [
    'deploy-pipeline-guide/deploy-pipeline/express/index.md',
    'deploy-pipeline-guide/deploy-pipeline/index.md',
  ])
  assert.ok(fs.existsSync(path.join(out, 'agent/deploy-pipeline-guide/deploy-pipeline/express/index.md')))
  assert.ok(!fs.existsSync(path.join(out, 'agent/reference')))
  fs.rmSync(root, { recursive: true, force: true })
})
```

- [ ] **Step 2: Run them to check they fail**

Run: `node --test test/agent-docs.test.mjs`
Expected: the 4 new tests FAIL because the exports are missing.

- [ ] **Step 3: Implement `toAgentCopy` and `writeAgentDocs`** following the rules above. Use `path.posix` for link resolution.

- [ ] **Step 4: Wire `buildEnd`** in `docs/.vitepress/config.mjs`

`buildEnd: (siteConfig) => { const written = writeAgentDocs({ srcDir: siteConfig.srcDir, outDir: siteConfig.outDir, base: siteConfig.site.base }); console.log(\`[agent-docs] wrote ${written.length} agent pages\`) }`

- [ ] **Step 5: Run the tests and both builds**

Run: `npm test`
Expected: 24 tests pass.

Run: `npm run docs:build && find docs/.vitepress/dist/agent -name '*.md' | wc -l && find docs/deploy-pipeline-guide -name '*.md' | wc -l`
Expected: the build prints `[agent-docs] wrote 20 agent pages`, and both counts are `20`.

Run: `VITEPRESS_BASE=/documentation/ npm run docs:build && grep -o '(/documentation/downloads/deploy-pipeline-kit.zip)' docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/index.md`
Expected: one match.

Run: `git diff --stat docs/.vitepress/sidebar.gen.json; grep -c agent docs/.vitepress/sidebar.gen.json`
Expected: no tracked change, and `0` matches.

- [ ] **Step 6: Commit**

```bash
git add scripts/agent-docs.mjs test/agent-docs.test.mjs docs/.vitepress/config.mjs
git commit -m "feat: write agent copies of the Deploy Pipeline guide at build time"
```

---

### Task 4: Agent preamble, copy button and human-page check

**Files:**
- Create: `scripts/compare-doc-html.mjs`
- Modify: `test/agent-docs.test.mjs`
- Modify: `docs/deploy-pipeline-guide/deploy-pipeline/index.md`

**Interfaces:**
- Consumes: the containers (Task 1), `findUnmarkedCommandBlocks` (Task 2), the agent copies (Task 3).
- Produces:
  - `scripts/compare-doc-html.mjs` exports `extractMain(html: string) -> string`, which returns the `<main …>…</main>` substring, or `''` if there's none.
  - Run from the command line as `node scripts/compare-doc-html.mjs <distA> <distB> [subdir]`, it compares `extractMain` for every `.html` under `subdir` (default: everything), prints `same: N` and one `differs: <path>` line per difference, and exits `1` if anything differs. Plans 2 and 3 use it.

- [ ] **Step 1: Write the failing tests**

```js
import { extractMain } from '../scripts/compare-doc-html.mjs'

test('extractMain returns the main element only', () => {
  assert.equal(extractMain('<head>x</head><main class="m"><p>a</p></main><footer>f</footer>'), '<main class="m"><p>a</p></main>')
  assert.equal(extractMain('<p>none</p>'), '')
})

test('the Deploy Pipeline index has an agent preamble and no unmarked command blocks', () => {
  const src = fs.readFileSync('docs/deploy-pipeline-guide/deploy-pipeline/index.md', 'utf8')
  assert.match(src, /::: agent\n/)
  assert.deepEqual(findUnmarkedCommandBlocks(src), [])
})
```

- [ ] **Step 2: Run them to check they fail**

Run: `node --test test/agent-docs.test.mjs`
Expected: both new tests FAIL (the module is missing, and the index has no agent block yet).

- [ ] **Step 3: Implement `scripts/compare-doc-html.mjs`.** The CLI part runs only when the file is executed directly (`import.meta.url === pathToFileURL(process.argv[1]).href`), the same pattern as `generate-sidebar.mjs`.

- [ ] **Step 4: Edit `docs/deploy-pipeline-guide/deploy-pipeline/index.md`**

(a) Wrap the `unzip deploy-pipeline-kit.zip && cd deploy-pipeline-kit` block in `::: step level=run where=laptop` … `:::`. The `text` tree block stays unwrapped.

(b) Right after the `# Deploy Pipeline` heading, add this block verbatim:

````md
::: agent
## For agents: read this first

This is the agent version of the Deploy Pipeline guide. You are helping a developer deploy the app in the current repo. Work fast: do not ask about anything this preamble allows.

**Steps.** Every command you may need to run sits inside a `::: step` marker:

```md
::: step level=<run|ask|never> where=<laptop|server|github> verify="<how to check it worked>"
```

Command blocks outside a step marker are reference material. Do not run them.

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
````

(c) After the "**Audience:**" paragraph, add the button. Extend the existing `<script setup>` and add a `<style>` block (plain class names, VitePress theme variables):

- Markup: `<p class="agent-link"><button type="button" @click="copyAgentLink">{{ copied ? 'Copied' : 'Copy link for your agent' }}</button> <code v-if="fallbackUrl">{{ fallbackUrl }}</code></p>`.
- `copyAgentLink`: build `new URL(withBase('/agent/deploy-pipeline-guide/deploy-pipeline/index.md'), location.origin).href`, call `navigator.clipboard.writeText(url)`, set `copied` for 2 s, and on any failure or a missing `navigator.clipboard`, set `fallbackUrl = url` so the user can select it.
- Style: `.agent-link button { border: 1px solid var(--vp-c-brand-1); color: var(--vp-c-brand-1); border-radius: 6px; padding: 2px 10px; font-size: 14px }` and `.agent-link button:hover { background: var(--vp-c-brand-soft) }`.

- [ ] **Step 5: Run the tests and the build**

Run: `npm test`
Expected: 26 tests pass.

Run: `npm run docs:build`
Expected: it passes, prints `[agent-docs] wrote 20 agent pages`, and shows no empty-sidebar warning.

- [ ] **Step 6: Check the preamble is invisible and not searchable, and the agent copy has it**

Run: `grep -c 'For agents: read this first' docs/.vitepress/dist/deploy-pipeline-guide/deploy-pipeline/index.html docs/.vitepress/dist/assets/chunks/@localSearchIndex*.js docs/.vitepress/dist/agent/deploy-pipeline-guide/deploy-pipeline/index.md`
Expected: `0` for the HTML page and the search index, `1` for the agent copy.

- [ ] **Step 7: Prove that no other human page changed**

```bash
cur=$PWD; base=$(mktemp -d)
git worktree add "$base/main" main && (cd "$base/main" && npm ci && npm run docs:build)
node scripts/compare-doc-html.mjs "$base/main/docs/.vitepress/dist" "$cur/docs/.vitepress/dist"
git worktree remove --force "$base/main"
```

Expected: exactly one line, `differs: deploy-pipeline-guide/deploy-pipeline/index.html` (the button), and exit code 1. Any other `differs:` line is a failure, so stop and report it.

- [ ] **Step 8: Commit**

```bash
git add scripts/compare-doc-html.mjs test/agent-docs.test.mjs docs/deploy-pipeline-guide/deploy-pipeline/index.md
git commit -m "feat: agent preamble and copy-link button on the Deploy Pipeline index"
```

Browser check (Claude Code does this during verification, and opencode skips it): with `npm run docs:build && npm run docs:preview`, the button sits under the intro and reads well in light and dark mode. It copies `http://localhost:4173/agent/deploy-pipeline-guide/deploy-pipeline/index.md`, and that URL serves the agent index with the preamble and working relative links.
