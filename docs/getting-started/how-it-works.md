---
title: How It Works
order: 1
---
# How It Works

The sidebar is a build artifact derived from the filesystem. The pipeline has four steps:

1. **Scan.** `npm run generate` runs `scripts/generate-sidebar.mjs`, which walks `docs/` recursively:
   - Directories become navigation **groups**.
   - Markdown files become navigation **items**.
   - A directory's `index.md` becomes that group's landing page and title — it is never emitted as its own duplicated item.
   - Hidden entries (`.vitepress`, dotfiles) and non-Markdown files are ignored.
2. **Serialize.** The derived tree is written to `docs/.vitepress/sidebar.gen.json` — a gitignored build artifact, not source code.
3. **Consume.** `docs/.vitepress/config.mjs` reads that JSON at build/dev time and exposes it as `themeConfig.sidebar`. If the file is missing (for example, someone ran `vitepress build docs` directly), the config warns and falls back to an empty sidebar instead of crashing.
4. **Wire up.** `npm run docs:dev` and `npm run docs:build` run the generator *before* starting VitePress, so the sidebar always matches the filesystem.

Because generation is deterministic (a byte-wise name pre-sort plus a stable comparator), the same tree always produces the same artifact.