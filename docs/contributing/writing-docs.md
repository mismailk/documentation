---
title: Writing Documentation
---
# Writing Documentation

## Adding a page

Create a Markdown file inside the section you want it to belong to:

```bash
touch docs/contributing/code-of-conduct.md
```

Give it a title (see [Authoring Pages](/getting-started/authoring-pages)) and write the content. With `npm run docs:dev` running, the page appears in the sidebar on the next generation.

## Adding a section

A section is a directory with an `index.md` landing page:

```text
docs/
└── platform/
    ├── index.md    ← section title + landing page
    ├── features.md
    └── pricing.md
```

If `platform/index.md` has a frontmatter `title`, that becomes the section label; otherwise the directory name is humanized.

## Renaming or removing a page

The sidebar follows the filesystem, so `git mv` / `rm` is enough:

```bash
git mv docs/getting-started/authoring-pages.md docs/getting-started/metadata.md
rm docs/reference/commands.md
```

Regenerate (`npm run generate`) and the sidebar reflects the change. Remember to fix inbound links if any page pointed at the old route.

## Controlling order

Add an `order` to a page's frontmatter to pin its position within a section; otherwise sections sort directories-first then alphabetically. See [Ordering](/getting-started/authoring-pages#ordering).

## Style notes

- Keep one page per idea; let the filesystem be the outline.
- Prefer explicit frontmatter `title`s for link text that reads well.
- Link between pages with extensionless routes: `[Reference](/reference/commands)`.
- Run `npm run test` and `npm run docs:build` before committing to be sure nothing broke.