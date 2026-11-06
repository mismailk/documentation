import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// The <main> element of a built page, or '' when there is none. Comparing this
// substring ignores layout, head and asset changes and focuses on page content.
export function extractMain(html) {
  const match = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)
  return match ? match[0] : ''
}

function collectHtml(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectHtml(full))
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full)
  }
  return files.sort()
}

// CLI entry: compare the <main> content of every .html under a subdirectory
// (default: everything) between two built sites. Prints `same: N` plus one
// `differs: <path>` line per difference, and exits 1 if anything differs.
export function main(argv = process.argv.slice(2)) {
  const [distA, distB, subdir] = argv
  if (!distA || !distB) {
    console.error('usage: node scripts/compare-doc-html.mjs <distA> <distB> [subdir]')
    return 2
  }

  const rootA = subdir ? path.join(distA, subdir) : distA
  const rootB = subdir ? path.join(distB, subdir) : distB
  let same = 0
  let differs = 0

  for (const file of collectHtml(rootA)) {
    const relPath = path.relative(rootA, file).split(path.sep).join('/')
    const other = path.join(rootB, path.relative(rootA, file))
    const a = extractMain(fs.readFileSync(file, 'utf8'))
    const b = fs.existsSync(other) ? extractMain(fs.readFileSync(other, 'utf8')) : null
    if (b !== null && a === b) {
      same += 1
    } else {
      differs += 1
      console.log(`differs: ${relPath}`)
    }
  }

  console.log(`same: ${same}`)
  return differs === 0 ? 0 : 1
}

// Only run when invoked directly; importing this module must not compare.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main()
}
