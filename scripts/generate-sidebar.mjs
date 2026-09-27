import fs from 'node:fs'
import matter from 'gray-matter'

// Convert a file name or directory name into a readable title.
// e.g. 'user-management.md' -> 'User Management', 'api-reference' -> 'Api Reference'
// Ruling (see ledger): every word is Title Cased (uppercase first letter,
// lowercase the rest) — the plan's prose said "lowercase words except the
// first", but its own pinned expectation is 'API.md' -> 'Api', which only
// the uniform rule satisfies ('My Page.md' -> 'My Page' still holds).
export function humanize(name) {
  const base = name.replace(/\.md$/, '')
  return base
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Parse just the `title` and `order` fields from a document's frontmatter.
// Always returns both keys; values may be undefined when absent.
export function parseMeta(content) {
  const { data } = matter(content)
  return {
    title: data.title,
    order: Number.isInteger(data.order) ? data.order : undefined,
  }
}

// Read a Markdown file's frontmatter meta.
export function readMeta(file) {
  return parseMeta(fs.readFileSync(file, 'utf8'))
}

// Map a docs-root-relative Markdown path to its extensionless route.
// 'getting-started/index.md' -> '/getting-started/', 'api/users.md' -> '/api/users'
export function routeFor(relPath) {
  const clean = relPath.replace(/\.md$/, '')
  const isIndex = clean === 'index' || clean.endsWith('/index')
  return isIndex ? `/${clean.replace(/index$/, '')}` : `/${clean}`
}