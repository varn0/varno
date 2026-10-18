const cache = new Map<string, Promise<string>>()

export function fetchText(url: string): Promise<string> {
  const cached = cache.get(url)
  if (cached) return cached

  const promise = fetch(url).then(res => {
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    return res.text()
  })

  // Keep successful fetches; evict failures so they can be retried.
  promise.catch(() => cache.delete(url))
  cache.set(url, promise)
  return promise
}

// Test-only helper.
export function __clearFetchCache(): void {
  cache.clear()
}
