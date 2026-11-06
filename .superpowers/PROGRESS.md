# Progress

The handoff document for this project. A new session reads this first, then [AGENTS.md](../AGENTS.md). Update it whenever a plan is verified or a decision is made, and commit it with that work.

_Last updated: 2026-11-06, after the agent-ready Deploy Pipeline spec was approved and plan 1 was written on `feat/agent-docs-mcp`._

## Where we are

- `main` (tip `304c4d3`) has the filesystem-driven VitePress site, the contribution guide, the getting-started and reference sections, the Deploy Pipeline guide (generic, Express and Next.js) with its three download kits, and the agent workflow (PR #7).
- Open PR #6, `docs/add-backray-guide`: adds the Backray user guide and the UI kit Storybook. Not merged.
- `feat/agent-docs-mcp`: makes the Deploy Pipeline guide agent-ready ([spec](specs/2026-11-06-agent-ready-deploy-pipeline-design.md), approved). Plan 1 of 3 is written and awaiting review.

## Next step

Review plan 1 ([mechanism](plans/2026-11-06-agent-docs-mechanism.md)), then hand it to opencode. Next come plan 2 (mark the shared pages and Express pages) and plan 3 (mark the Next.js pages). All three ship in **one PR**. The developer then tests by pasting the copied agent link into Claude Code in a real Express repo.

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
| 2026-11-06 | [agent-docs-mechanism](plans/2026-11-06-agent-docs-mechanism.md) (1 of 3) | `feat/agent-docs-mcp` | Written, awaiting review |

## Expected numbers

- `npm test`: 12 tests, all passing.
- `npm run docs:build`: passes with no empty-sidebar warning.

## Decisions (and why)

- **Specs and plans live in `.superpowers/`, not `docs/superpowers/`** as in backray. Everything under `docs/` is published to the site.
- **Malformed frontmatter degrades gracefully** (title/order become `undefined`). The tests pin this, so don't "fix" it.
- **Node 22** in CI and the README, even though `engines` says `>=18`.
- **Agent-ready guides (2026-11-06):** the agent version of a guide is generated from the human sources at build time (`dist/agent/<path>.md`) and never written by hand. The `::: step` and `::: agent` markers render to nothing on the site. There is one copy-link button, on the Deploy Pipeline index. The levels are `run` (local), `ask` (server and GitHub; using a key by its path is `ask`) and `never` (secret contents). When the repo differs from the guide, the agent adapts the command, says what it changed in one line, and keeps going.

## Known issues and follow-ups

- `humanize()` lowercases acronyms (`API.md` → `Api`). Pages work around it with a frontmatter `title`.
