# Progress

The handoff document for this project. A new session reads this first, then [AGENTS.md](../AGENTS.md). Update it whenever a plan is verified or a decision is made, and commit it with that work.

_Last updated: 2026-11-06, after the agent workflow (Claude Code plans and verifies, opencode implements) was added to AGENTS.md and CLAUDE.md on `docs/opencode-workflow`._

## Where we are

- `main` (tip `fb10351`) has the filesystem-driven VitePress site, the contribution guide, the getting-started and reference sections, and the Deploy Pipeline guide (generic, Express and Next.js) with its three download kits in `docs/public/downloads/`.
- Open PR #6, `docs/add-backray-guide`: adds the Backray user guide and the UI kit Storybook. Not merged.
- `docs/opencode-workflow`: this workflow change (AGENTS.md, CLAUDE.md, this file).
- No plan is in progress.

## Next step

Nothing is planned yet. A candidate, discussed but not specced: make the docs usable by agents. That means emitting `llms.txt`, raw `.md` copies of each page and a `docs-index.json` at build time, adding `::: step` containers with metadata (runs on, sudo, risk, verify) to the Deploy Pipeline guide, and adding a small stdio MCP server that reads the index from GitHub Pages. Pages is static, so it can't host the MCP server itself.

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

## Expected numbers

- `npm test`: 12 tests, all passing.
- `npm run docs:build`: passes with no empty-sidebar warning.

## Decisions (and why)

- **Specs and plans live in `.superpowers/`, not `docs/superpowers/`** as in backray. Everything under `docs/` is published to the site.
- **Malformed frontmatter degrades gracefully** (title/order become `undefined`). The tests pin this, so don't "fix" it.
- **Node 22** in CI and the README, even though `engines` says `>=18`.

## Known issues and follow-ups

- `humanize()` lowercases acronyms (`API.md` → `Api`). Pages work around it with a frontmatter `title`.
