import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildManifest } from './src/lib/blogManifest'

const BLOG_DIR = join(__dirname, 'public', 'content', 'blog')

function generateBlogManifest(): void {
  const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  const inputs = files.map(file => ({
    slug: file.replace(/\.md$/, ''),
    file,
    raw: readFileSync(join(BLOG_DIR, file), 'utf8'),
  }))
  const entries = buildManifest(inputs).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  writeFileSync(join(BLOG_DIR, 'manifest.json'), JSON.stringify(entries, null, 2) + '\n')
}

function blogManifestPlugin(): Plugin {
  return {
    name: 'generate-blog-manifest',
    buildStart() {
      generateBlogManifest()
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), blogManifestPlugin()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          marked: ['marked'],
        },
      },
    },
  },
})
