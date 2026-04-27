import { useState, useEffect } from 'react'
import { parseFrontmatter } from '../lib/markdown'
import type { BlogMeta } from '../types/blog'

export function useBlogList() {
  const [posts, setPosts] = useState<BlogMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/content/blog/manifest.json')
      .then(res => res.json())
      .then(async (manifest: { slug: string; file: string }[]) => {
        const results: BlogMeta[] = []

        for (const entry of manifest) {
          const res = await fetch(`/content/blog/${entry.file}`)
          const raw = await res.text()
          const { frontmatter } = parseFrontmatter(raw)
          results.push({
            title: frontmatter.title as string,
            date: frontmatter.date as string,
            description: frontmatter.description as string,
            tags: (frontmatter.tags as string[]) || [],
            source: frontmatter.source as BlogMeta['source'],
            slug: entry.slug,
          })
        }

        // Sort by date, most recent first
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (!cancelled) {
          setPosts(results)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { posts, loading }
}
