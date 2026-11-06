# Agent-ready Deploy Pipeline guide — design

_2026-11-06. Branch `feat/agent-docs-mcp`. Status: approved by the developer 2026-11-06._

## Why

The developer already had Claude Code follow the Deploy Pipeline guide (Express path) by pasting the page link. It worked, but slowly: the agent fetches HTML, strips the layout and has to work out from prose, for every command, whether it is safe, where it runs and how to tell it worked. So it hesitates or asks too often.

The goal is a faster run where the agent:

1. runs everything local without pausing;
2. stops only where the developer said it must, with a ready-to-run command;
3. adapts the guide to the repo it is working in when the repo differs from the guide.

## Goals

- **One link.** The Deploy Pipeline index page (`docs/deploy-pipeline-guide/deploy-pipeline/index.md`) gets a single "Copy link for your agent" button. It copies the absolute URL of the agent version of that index. The developer pastes it into Claude Code; the agent finds every other page from there (shared stages, Express path, Next.js path).
- **Agent versions are generated, never hand-written.** The guide sources stay the single source of truth. The build writes an agent `.md` copy of every page of the guide.
- **The website does not change for humans.** No visible markers, labels or extra sections. The only visible addition is the one button on the index page.
- **Agent pages are hidden from the site.** Not in the sidebar, not in local search, not linked from any page except via the copied URL.
- **Every command block carries metadata** the agent can act on without interpreting prose: level, where it runs, and (when one exists) how to verify it.

## The three levels (decided by the developer)

| Level | What's in it | Agent behaviour |
| --- | --- | --- |
| `run` | Everything local: install, build, test, edit repo files, git, version/port checks, local `docker build`/`docker run` | Run it at once, no pause |
| `ask` | Anything that touches the server: `ssh`, `scp`, commands "on the server", `systemctl`, nginx, remote health checks; and GitHub settings that change deploy behaviour | Show the exact command, already adapted to the repo; the developer either approves it (agent runs it) or runs it and pastes the output back; then the agent checks it against `verify` and carries on |
| `never` | Reading, printing, copying or uploading secrets: `.env` files with real values, private key *contents*, tokens, GHCR passwords. Using a key by its path (`ssh -i`) is `ask`, not `never` | The agent does not run or read it. It tells the developer what to do and, at most, which variable **names** are expected. It checks names only after the developer confirms |

The server rule is **not** a hard ban: server commands are `ask`, so the agent may run them once approved. Secrets are `never` (the developer did not relax that rule).

**Adapting to the repo (decided):** when the repo differs from what a step assumes (package manager, port, start command, entry file, branch names…), the agent adapts the command, states the change in one line (e.g. "using `pnpm` instead of `npm`; port 8080 from `src/config.ts`") and keeps going. It stops only if it cannot determine the right value from the repo.

These rules are written once, in an agent-only preamble on the index page (below), not repeated per step.

## Non-goals

- The MCP server. It is a follow-up, to be designed after the Backray guide (open PR #6) is merged, so it can serve more than one guide.
- `llms.txt` and a site-wide `docs-index.json`. Deferred to the MCP follow-up (YAGNI until then).
- Agent versions of any guide other than the Deploy Pipeline (`docs/deploy-pipeline-guide/`).
- Hiding agent pages from external search engines (no robots rules).
- Enforcing levels technically. The levels are instructions to the agent; Claude Code's own permission prompts remain the developer's real safety net.

## Anti-goals (a failure even if it works)

- Any visible change to the human pages beyond the one button.
- Agent pages drifting from human pages (a second hand-maintained copy).
- Agent pages appearing in the sidebar or local search.
- A secret ever being printed or copied by following the agent version.

## How it works

### 1. Markers in the sources (invisible on the site)

Two custom containers are added to the VitePress markdown config (`markdown.config` in `docs/.vitepress/config.mjs`, using `markdown-it-container`, added as a devDependency; VitePress bundles its own copy but doesn't expose it):

- **`::: step <attributes>`** wraps exactly one command block (or a small group of blocks with the same level and place). On the website the open and close tags render to nothing, so readers see only the inner content, exactly as today.

  ```md
  ::: step level=ask where=server verify="grep -A1 'case \"$2\" in' /opt/deploy/deploy.sh"
  ```bash
  cd ~/docker-deploy-server && sudo ./server-setup.sh --skip-docker --skip-swap
  ```
  :::
  ```

  Attributes:
  - `level` (required): `run` | `ask` | `never`.
  - `where` (required): `laptop` | `server` | `github`. ("laptop" means the developer's machine / the app repo.)
  - `verify` (optional): a command, or a short expected result in words, taken from the page's existing ✅ Checkpoint or the following "check" block. Quoted with `"…"`; `\"` escapes a quote.
  - The parser rejects (build error) a missing/unknown `level` or `where`. A typo must not silently produce an unmarked step.

- **`::: agent`** wraps agent-only prose. On the website it renders to nothing at all (the content is dropped). In the agent copy it is kept, without the wrapper. Used for the preamble on the index page and, sparingly, for agent-only hints elsewhere (e.g. "detect Express vs Next.js from `package.json`").

Granularity: **one level per step block.** A section that mixes levels (e.g. 3.2 in `add-an-app.md`: `scp` is `ask`, `bash -n server/deploy.sh` is `run`) gets several step blocks. Command blocks that are not commands to run (directory trees, `text` output, YAML to paste into a file, dockerfile snippets) are not wrapped.

**Prose steps (my call).** A `::: step` may also wrap prose, such as a numbered list of GitHub UI actions, because the wrapper renders nothing and the HTML stays the same. A list is never split to separate levels. A step takes the level of its most cautious item, and an `::: agent` note placed just before it names the exception. For example, `add-an-app.md` 3.7 is one `ask`/`github` step, preceded by an agent note: "item 3 (pasting the private key into `DEPLOY_SSH_KEY`) is `never`: tell the developer to do it." Wrapping a prose step is optional when it has no command. The coverage check counts only fenced `bash`/`sh` blocks.

Containers inside `::: v-pre` blocks and around fenced code must render the inner content unchanged. The builder verifies this with a built-HTML comparison (see Verification).

### 2. Agent copies (generated at build time)

A new script, `scripts/generate-agent-docs.mjs`, exports a pure function that turns one source page into its agent copy, plus a function that writes all of them. It runs from VitePress's `buildEnd` hook in `config.mjs` (so `npm run docs:build` produces them, and the sidebar generator never sees them). Output: `<outDir>/agent/<route>.md`, mirroring routes. Examples:

| Source | Agent copy URL |
| --- | --- |
| `docs/deploy-pipeline-guide/deploy-pipeline/index.md` | `/agent/deploy-pipeline-guide/deploy-pipeline/index.md` |
| `…/deploy-pipeline/add-an-app.md` | `/agent/deploy-pipeline-guide/deploy-pipeline/add-an-app.md` |
| `…/deploy-pipeline/express/index.md` | `/agent/deploy-pipeline-guide/deploy-pipeline/express/index.md` |

(All URLs are under the site base, `VITEPRESS_BASE`.)

The transformation, per page:

1. Keep frontmatter `title` as the first `# heading` if the page has none; drop the rest of the frontmatter.
2. Drop `<script setup>…</script>` blocks.
3. Unwrap `::: v-pre` (keep content).
4. Keep `::: step …` markers verbatim (they are the metadata).
5. Unwrap `::: agent` (keep content).
6. Keep `::: tip/warning/…` containers as they are (readable as plain markdown).
7. Rewrite links:
   - relative page links (`./express/`, `../add-an-app#env-file`, `./prepare-your-app`) → relative links to the agent copies (`./express/index.md`, `../add-an-app.md#env-file`, `./prepare-your-app.md`);
   - `withBase('/downloads/…')` anchors → a plain markdown link with the absolute site URL of the download (base included, so the agent can `curl` it);
   - absolute links to other parts of the site → their normal website URL.
8. Leave everything else byte-for-byte.

Only pages under `docs/deploy-pipeline-guide/` are emitted (a constant in the script; easy to extend later).

The absolute URL needed for downloads and for the copy button comes from a site URL setting. **Builder's call:** derive it from an env var (e.g. `VITEPRESS_SITE_URL`, set in CI next to `VITEPRESS_BASE`) or compute the button's URL client-side from `location.origin` + base. Downloads in agent copies may use a relative URL if no site URL is configured.

### 3. The agent preamble (index page)

`docs/deploy-pipeline-guide/deploy-pipeline/index.md` gets one `::: agent` block near the top. Content (wording is the builder's, meaning is fixed):

- What this is: the agent version of the Deploy Pipeline guide.
- The three levels and the agent behaviour for each (table above), and that every command block is wrapped in a `::: step` marker carrying them; unmarked command blocks are reference, not steps to run.
- The adapt-and-say-it rule.
- How to pick the path: inspect the repo (`package.json` dependencies: `next` → Next.js guide, `express` → Express guide); follow that guide's step table in order, which links back to the shared stages.
- Checkpoints: after each stage, run the ✅ Checkpoint items that are `run`; ask for the rest.
- Placeholders: fill `<app>`, `<org>/<repo>`, … from the repo (`git remote`, `package.json` name) and ask the developer only for what the repo can't tell (server host, SSH port, GitHub user).

### 4. The copy button

On the index page only: a small button ("Copy link for your agent") inside the existing `<script setup>`, placed in the intro. It copies the absolute URL of `/agent/deploy-pipeline-guide/deploy-pipeline/index.md` (base included) to the clipboard and shows "Copied" briefly. Plain styling using VitePress theme variables so it reads well in light and dark mode. No custom theme files.

### 5. Marking the guides

Every runnable command block in the Deploy Pipeline guide is wrapped in a `::: step` marker with the right level and place. Reading guidance:

- Laptop/app-repo commands (`npm …`, `docker build`, local `docker run` with a **test** `.env`, `bash -n`, `grep` in the repo, `git`) → `run`, `laptop`.
- `scp`, `ssh`, anything the page says runs "on the server", `sudo …` on the server → `ask`, `server`.
- GitHub UI/CLI steps that change environments, secrets settings or turn deploys on → `ask`, `github`.
- **Keys (decided):** these are `ask`:
  - using a key by its path, such as `ssh -i ~/deploy-keys/…` (this includes the checkpoint test);
  - `scp` of the `.pub` files;
  - generating keys with `ssh-keygen`.

  These are `never`:
  - reading, printing, copying or pasting a private key's contents (`cat`, pasting it into `DEPLOY_SSH_KEY`);
  - deleting the private key files once they are stored is also treated as `never`, because only the developer knows the key is safely stored (my call).

  The preamble states the rule: "you may use a key by its path; you may never read or print its contents."
- Creating or editing the server `.env` with real values, `docker login` with a token, and setting GitHub secret values → `never`. The step text stays, and the agent tells the developer to do it.
- `verify` comes from the existing checkpoint or the check block right after; no new checks are invented.

The pages and their runnable blocks, roughly: `server-setup.md`, `add-an-app.md`, `go-live.md`, `everyday-use.md`, `troubleshooting.md` (shared); `express/prepare-your-app.md`, `express/index.md`; `nextjs/prepare-your-app.md`, `nextjs/go-live.md`, `nextjs/everyday-use.md`, `nextjs/index.md`. Reference and how-it-works pages mostly have no runnable blocks.

## Delivery: three plans (4-task limit each)

1. **Mechanism.** Containers in config, agent-copy generator with tests, `buildEnd` wiring, the agent preamble and the copy button on the index page. Includes marking the index page itself.
2. **Shared stages + Express path.** Mark the shared pages and the Express pages (the path the developer tested). Then the developer re-runs the Express test with the copied link.
3. **Next.js path.** Mark the Next.js pages.

**Decided:** all three plans land on `feat/agent-docs-mcp` and go out in **one PR**, so nothing is published half-marked. Each plan is verified locally (`docs:build` + `docs:preview`). The developer's real-link test with Claude Code happens after the PR is merged and Pages has deployed. Plan 2's "re-run the Express test" therefore moves to after the merge.

## Verification (what "done" means)

- `npm test` passes, with new tests for: the agent-copy transformation (each rule in §2, including link rewriting and dropping `<script setup>`), the `step` attribute parser (valid, missing, unknown, quoted `verify` with `\"`), and that both containers render to no wrapper HTML.
- `npm run docs:build` passes with no empty-sidebar warning, and `dist/agent/deploy-pipeline-guide/…` contains one `.md` per guide page.
- **Human pages unchanged:** for every guide page except the index, the built HTML's main content is identical before and after the markers are added (the builder picks how to compare, e.g. extracting `.vp-doc` from `dist` on `main` vs the branch). The index differs only by the button.
- `sidebar.gen.json` is unchanged by this work; no `/agent/` entry in the local search index.
- Every runnable command block in the guide is inside a `::: step` (a test or script check: a fenced `bash`/`sh` block outside a step fails, with an explicit allowlist for reference-only blocks).
- Preview with `npm run docs:build` then `npm run docs:preview`. Agent copies only exist after a build, so the button's link returns 404 under `docs:dev`. That is accepted (my call): no dev-server serving. Then check that the button copies a URL that opens the agent index; the agent index links resolve to other agent copies; light and dark mode look right.
- Final acceptance (developer): paste the copied link into Claude Code in a real Express repo; the agent runs local steps without pausing, stops at server steps with ready commands, never reads secrets, and states its adaptations.

## Left to the builder

- Exact parser and file layout inside `scripts/generate-agent-docs.mjs`; test fixtures.
- The site-URL mechanism (see §2).
- Preamble wording and button styling within the constraints above.
- How to compare built HTML before/after.

## Follow-up

- **MCP server** (after PR #6 merges): reads the agent copies or a generated index from GitHub Pages; lists guides, serves pages and steps. Revisit `llms.txt`/`docs-index.json` then.
