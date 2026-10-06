import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom has no IntersectionObserver. Provide a no-op global so components that
// render useAtBottom don't crash. Tests that need to drive intersection
// callbacks install their own instrumented mock (see useAtBottom.test.tsx).
class NoopIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []
}

vi.stubGlobal('IntersectionObserver', NoopIntersectionObserver)
