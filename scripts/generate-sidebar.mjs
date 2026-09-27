import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
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
// Always returns both keys; values may be undefined when absent. Malformed
// YAML (a doc authoring typo) must not crash the generator — it degrades to
// the fallback values instead.
export function parseMeta(content) {
  try {
    const { data } = matter(content)
    return {
      title: data.title,
      order: Number.isInteger(data.order) ? data.order : undefined,
    }
  } catch {
    return { title: undefined, order: undefined }
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

// Recursively build the sidebar array for a docs directory.
// Directories become groups (with an optional clickable link when they
// contain an index.md); loose .md files become items. The root index.md,
// hidden entries, and non-markdown files are excluded.
export function buildSidebar(docsDir) {
  return buildDir(docsDir, '', true)
}

function buildDir(dirPath, relDir, isRoot) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const collected = []
  for (const entry of entries) {
    const name = entry.name
    if (name.startsWith('.')) continue
    const rel = relDir ? `${relDir}/${name}` : name
    if (entry.isDirectory()) {
      const indexPath = path.join(dirPath, name, 'index.md')
      const hasIndex = fs.existsSync(indexPath)
      collected.push({
        kind: 'dir',
        name,
        rel,
        indexMeta: hasIndex ? readMeta(indexPath) : undefined,
      })
    } else if (name.endsWith('.md') && name !== 'index.md') {
      // index.md at any depth is the parent directory's landing page —
      // consumed above as directory metadata, never emitted as its own item.
      collected.push({
        kind: 'file',
        name,
        rel,
        meta: readMeta(path.join(dirPath, name)),
      })
    }
  }

  // Ruling (see ledger): directories sort by their bare name, not their
  // route — routeFor('only-index/index.md') yields '/only-index/', whose
  // leading '/' sorts before letter-leading names and breaks the pinned
  // expected order ('Only Index' must sort after 'Guides').
  const sortable = collected.map((node) => {
    if (node.kind === 'dir') {
      return { node, isDir: true, order: node.indexMeta?.order, sortName: node.name }
    }
    return { node, isDir: false, order: node.meta.order, sortName: routeFor(node.rel) }
  })

  // Determinism: byte-wise name sort first (fs readdir order is not
  // guaranteed), then a stable sort by the spec comparator.
  sortable.sort((a, b) => (a.node.name < b.node.name ? -1 : a.node.name > b.node.name ? 1 : 0))
  sortable.sort(compareEntries)

  return sortable.map(({ node }) => {
    if (node.kind === 'dir') {
      const group = {
        text: node.indexMeta?.title ?? humanize(node.name),
        items: buildDir(path.join(dirPath, node.name), node.rel, false),
      }
      if (node.indexMeta) group.link = routeFor(`${node.rel}/index.md`)
      return group
    }
    return { text: node.meta.title ?? humanize(node.name), link: routeFor(node.rel) }
  })
}

// Serialize a sidebar for the generated artifact file.
export function renderArtifact(sidebar) {
  return `${JSON.stringify(sidebar, null, 2)}\n`
}

// Write a sidebar to an artifact file, creating parent directories.
export function writeArtifact(sidebar, outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, renderArtifact(sidebar))
}

// CLI entry: scan the repo's docs/ directory and write the sidebar artifact.
// Run as `node scripts/generate-sidebar.mjs` (or via `npm run generate`).
export function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const docsDir = path.join(repoRoot, 'docs')
  const outFile = path.join(repoRoot, 'docs', '.vitepress', 'sidebar.gen.json')
  const sidebar = buildSidebar(docsDir)
  writeArtifact(sidebar, outFile)
  console.log(`Generated ${outFile} (${sidebar.length} top-level items)`)
}

// Only run when invoked directly; importing this module must not scan.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}