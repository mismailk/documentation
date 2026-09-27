import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Normalize a site base path: start and end with a slash, unless it is the
// relocatable './'. Exported for testing.
export function normalizeBase(base) {
  if (base === './') return base
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base += '/'
  return base
}

// Read the generated sidebar artifact as JSON. Falls back to an empty
// sidebar with a warning when the artifact is missing or unreadable, so a
// direct `vitepress build docs` (without `npm run generate`) still builds.
// `dir` defaults to this config file's directory; exported for testing.
export function loadSidebar(dir = __dirname) {
  const file = path.join(dir, 'sidebar.gen.json')
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    console.warn('[vitepress] sidebar.gen.json is missing — run `npm run generate` (docs:dev/docs:build do this automatically). Using an empty sidebar.')
    return []
  }
}

export default defineConfig({
  lang: 'en-US',
  title: 'Documentation',
  description: 'A VitePress documentation site with filesystem-driven navigation.',
  base: normalizeBase(process.env.VITEPRESS_BASE || '/'),
  themeConfig: {
    search: { provider: 'local' },
    sidebar: loadSidebar(),
  },
})