# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

AGENTS.md (imported above) is the authoritative guide: commands, contribution workflow (separate branch + PR, never commit to `main`), and the sidebar/frontmatter rules.

## Architecture in brief

- `docs/` is the only source of truth for navigation. [scripts/generate-sidebar.mjs](scripts/generate-sidebar.mjs) scans it and writes the gitignored `docs/.vitepress/sidebar.gen.json`, which [docs/.vitepress/config.mjs](docs/.vitepress/config.mjs) loads as `themeConfig.sidebar` (empty sidebar + warning if the JSON is missing — hence always use the npm scripts).
- Tests ([test/generate-sidebar.test.mjs](test/generate-sidebar.test.mjs)) cover both the generator and the `normalizeBase`/`loadSidebar` exports of config.mjs.

## Running a single test

```
node --test --test-name-pattern="<name substring>" test/generate-sidebar.test.mjs
```

There is no linter configured.
