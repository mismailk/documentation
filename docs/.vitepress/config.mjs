import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function normalizeBase(base) {
  if (base === './') return base
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base += '/'
  return base
}

function loadSidebar() {
  const file = path.join(__dirname, 'sidebar.gen.json')
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