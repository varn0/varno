import { useState, useEffect } from 'react'
import type { BlogMeta } from '../types/blog'

interface ManifestEntry extends BlogMeta {
  file: string
}

export function useBlogList() {
  const [posts, setPosts] = useState<BlogMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/content/blog/manifest.json')
      .then(res => res.json())
      .then((manifest: ManifestEntry[]) => {
        if (cancelled) return
        const results: BlogMeta[] = manifest.map(entry => ({
          title: entry.title,
          date: entry.date,
          description: entry.description,
          tags: entry.tags ?? [],
          source: entry.source,
          slug: entry.slug,
        }))
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setPosts(results)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { posts, loading }
}
