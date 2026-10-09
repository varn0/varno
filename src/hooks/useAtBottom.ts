import { useCallback, useEffect, useState } from 'react'

type UseAtBottom = {
  /** Callback ref — attach to the zero-height sentinel at the page's end. */
  ref: (node: HTMLDivElement | null) => void
  /** True when the sentinel is in the viewport (reader is at the bottom). */
  atBottom: boolean
}

export function useAtBottom(): UseAtBottom {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [atBottom, setAtBottom] = useState(false)

  const ref = useCallback((next: HTMLDivElement | null) => {
    setNode(next)
  }, [])

  useEffect(() => {
    // No IntersectionObserver (e.g. jsdom, very old browsers): never leave the
    // dog-ear permanently unreachable.
    if (typeof IntersectionObserver === 'undefined') {
      setAtBottom(true)
      return
    }
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        setAtBottom(entries[0]?.isIntersecting ?? false)
      },
      // The sentinel sits at the document's end, flush with the viewport bottom
      // at max scroll (and on short pages). The margin must be non-negative or
      // it would never intersect; a tiny positive bottom margin absorbs
      // sub-pixel rounding so the reveal reliably fires at the very bottom.
      { rootMargin: '0px 0px 1px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return { ref, atBottom }
}
