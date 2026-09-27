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

// Comparator for sidebar entries. Ordering rules (spec §5.3):
//   1. explicit integer order ascending (ties fall through to 3-4)
//   2. unordered entries after all ordered ones
//   3. directories before loose markdown files
//   4. alphabetical by route/link (or directory name when no link)
export function compareEntries(a, b) {
  const aHas = a.order !== undefined
  const bHas = b.order !== undefined
  if (aHas && bHas && a.order !== b.order) return a.order - b.order
  if (aHas !== bHas) return aHas ? -1 : 1
  if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
  if (a.sortName < b.sortName) return -1
  if (a.sortName > b.sortName) return 1
  return 0
}