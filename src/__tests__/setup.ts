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

// jsdom has no window.matchMedia. Provide a no-op implementation so
// components that render useTheme (e.g. ThemeToggle, pulled in via
// TechHeader) don't crash during tests.
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
)
