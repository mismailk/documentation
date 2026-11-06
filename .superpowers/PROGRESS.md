# Progress

The handoff document for this project. A new session reads this first, then [AGENTS.md](../AGENTS.md). Update it whenever a plan is verified or a decision is made, and commit it with that work.

_Last updated: 2026-11-06, after PR #8 was opened and plan 4 (full URLs and a route list) was added to it._

## Where we are

- `main` (tip `304c4d3`) has the filesystem-driven VitePress site, the contribution guide, the getting-started and reference sections, the Deploy Pipeline guide (generic, Express and Next.js) with its three download kits, and the agent workflow (PR #7).
- Open PR #6, `docs/add-backray-guide`: adds the Backray user guide and the UI kit Storybook. Not merged.
- `feat/agent-docs-mcp`: makes the Deploy Pipeline guide agent-ready ([spec](specs/2026-11-06-agent-ready-deploy-pipeline-design.md), approved). Plans 1 to 3 are done and verified, and PR #8 is open. Plan 4 is in progress on the same branch.

## Next step

The plan queue runs one plan at a time. opencode implements a plan, and Claude Code verifies it before the next plan starts. A failed check stops the queue.

1. ~~Plan 1, [mechanism](plans/2026-11-06-agent-docs-mechanism.md)~~: done and verified.
2. ~~Plan 2, [shared stages + Express](plans/2026-11-06-agent-docs-shared-express.md)~~: done and verified.
3. ~~Plan 3, [Next.js](plans/2026-11-06-agent-docs-nextjs.md)~~: done and verified. Task 3 (four-colon preamble line and AGENTS.md) was added after plan 2.

4. Plan 4, [full URLs and a route list](plans/2026-11-06-agent-docs-absolute-links.md): in progress. The developer noticed that relative links depend on the agent knowing the URL it fetched.

PR #8 (`feat/agent-docs-mcp` → `main`) is open. After it merges and Pages deploys, the developer pastes the copied agent link into Claude Code in a real Express repo. That is the acceptance test.

All three ship in **one PR**. The developer then tests by pasting the copied agent link into Claude Code in a real Express repo.

Follow-up after PR #6 merges: the MCP server, and `llms.txt` and `docs-index.json` with it.

## Workflow (summary)

The full rules are in AGENTS.md ("Agent workflow") and CLAUDE.md ("Handing implementation to OpenCode").

| Stage | Owner |
| --- | --- |
| Spec and plan | Claude Code |
| Implementation | opencode |
| Verification and validation | Claude Code |

Specs go in `.superpowers/specs/`, plans in `.superpowers/plans/` (at most 4 tasks each). Never under `docs/`, which is published.

## Plans

| Date | Plan | Branch | Status |
| --- | --- | --- | --- |
| 2026-09-27 | [vitepress-filesystem-navigation](plans/2026-09-27-vitepress-filesystem-navigation.md) | merged to `main` | Done (historical, from before this workflow) |
| 2026-11-06 | [agent-docs-mechanism](plans/2026-11-06-agent-docs-mechanism.md) (1 of 3) | `feat/agent-docs-mcp` | Done, verified (`6081f89`..`a89897d`) |
| 2026-11-06 | [agent-docs-shared-express](plans/2026-11-06-agent-docs-shared-express.md) (2 of 3) | `feat/agent-docs-mcp` | Done, verified (`a2a09c7`..`af1cdc3`) |
| 2026-11-06 | [agent-docs-nextjs](plans/2026-11-06-agent-docs-nextjs.md) (3 of 3) | `feat/agent-docs-mcp` | Done, verified (`4ef0c6a`..`5b02a17`) |
| 2026-11-06 | [agent-docs-absolute-links](plans/2026-11-06-agent-docs-absolute-links.md) (4) | `feat/agent-docs-mcp` (PR #8) | In progress |

## Expected numbers

- `npm test`: 37 tests, all passing.
- `npm run docs:build`: passes with no empty-sidebar warning, and writes 20 agent pages to `dist/agent/`.
- Guide markers: 80 `step` markers across 12 pages, and the guide-wide check covers all 20 pages.
- `compare-doc-html` against `main`: only `deploy-pipeline-guide/deploy-pipeline/index.html` differs (the button).

## Decisions (and why)

- **Specs and plans live in `.superpowers/`, not `docs/superpowers/`** as in backray. Everything under `docs/` is published to the site.
- **Malformed frontmatter degrades gracefully** (title/order become `undefined`). The tests pin this, so don't "fix" it.
- **Node 22** in CI and the README, even though `engines` says `>=18`.
- **Agent-ready guides (2026-11-06):** the agent version of a guide is generated from the human sources at build time (`dist/agent/<path>.md`) and never written by hand. The `::: step` and `::: agent` markers render to nothing on the site. There is one copy-link button, on the Deploy Pipeline index. The levels are `run` (local), `ask` (server and GitHub; using a key by its path is `ask`) and `never` (secret contents). When the repo differs from the guide, the agent adapts the command, says what it changed in one line, and keeps going.

## Known issues and follow-ups

- **A `::: step` inside `::: v-pre` leaves a stray `:::` on the page**, because VitePress's v-pre closes at the first `:::`. Wrap v-pre from outside with `:::: step` … `::::` instead. Plan 2 does this (go-live).
- Minor items deferred from plan 1's review: link rewriting doesn't handle images, inline code or query strings; `parseStepAttrs` accepts trailing junk and duplicate keys; `writeAgentDocs` doesn't clear stale files; `compare-doc-html` walks only the first dist. None of these occurs in the guide today.
- `humanize()` lowercases acronyms (`API.md` → `Api`). Pages work around it with a frontmatter `title`.
