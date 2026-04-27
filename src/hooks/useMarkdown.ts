import { useState, useEffect } from 'react'
import { parseFrontmatter, renderMarkdown } from '../lib/markdown'

interface UseMarkdownResult<T> {
  data: T | null
  html: string
  loading: boolean
  error: string | null
}

export function useMarkdown<T extends Record<string, unknown>>(url: string): UseMarkdownResult<T> {
  const [state, setState] = useState<UseMarkdownResult<T>>({
    data: null,
    html: '',
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}`)
        return res.text()
      })
      .then(raw => {
        if (cancelled) return
        const { frontmatter, body } = parseFrontmatter(raw)
        const html = renderMarkdown(body)
        setState({ data: frontmatter as T, html, loading: false, error: null })
      })
      .catch(err => {
        if (cancelled) return
        setState({ data: null, html: '', loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [url])

  return state
}
