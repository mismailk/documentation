---
title: Authoring Pages
order: 2
---
# Authoring Pages

Pages are plain Markdown files. Two frontmatter fields control how they appear in the sidebar.

## Titles

By default, the sidebar label is derived from the file name:

```text
installation.md       → Installation
user-management.md    → User Management
api-reference.md      → Api Reference
```

Set an explicit label with a frontmatter `title`:

```markdown
---
title: Installing the SDK
---
# Installing the SDK
```

A directory's `index.md` can set the section title the same way; without it, the directory name is humanized (`getting-started` → `Getting Started`).

## Ordering

Entries sort in this order:

1. Explicit integer `order`, ascending.
2. Entries without an `order` after all ordered ones.
3. Directories before loose Markdown files.
4. Alphabetically by route.

```markdown
---
title: Installation
order: 1
---
```

If every page relies on ordering alone, the filesystem is still the source of truth — nothing else needs to change.

## Routes

The URL follows the file path, with no extension:

```text
docs/getting-started/how-it-works.md → /getting-started/how-it-works
docs/getting-started/index.md        → /getting-started/
docs/index.md                        → /
```