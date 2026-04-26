import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useSide } from '../../hooks/useSide'
import type { ReactNode } from 'react'

function wrapper(initialEntries: string[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    )
  }
}

describe('useSide', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-side')
  })

  it('returns "tech" for root path', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/'])
    })
    expect(result.current).toBe('tech')
  })

  it('returns "tech" for /cv', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/cv'])
    })
    expect(result.current).toBe('tech')
  })

  it('returns "tech" for /blog/some-post', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/blog/some-post'])
    })
    expect(result.current).toBe('tech')
  })

  it('returns "creative" for /creative', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/creative'])
    })
    expect(result.current).toBe('creative')
  })

  it('returns "creative" for /creative/paintings', () => {
    const { result } = renderHook(() => useSide(), {
      wrapper: wrapper(['/creative/paintings'])
    })
    expect(result.current).toBe('creative')
  })

  it('sets data-side attribute on <html>', () => {
    renderHook(() => useSide(), {
      wrapper: wrapper(['/creative'])
    })
    expect(document.documentElement.getAttribute('data-side')).toBe('creative')
  })
})
