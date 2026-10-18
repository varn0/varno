import { renderHook, waitFor } from '@testing-library/react'
import { useBlogList } from '../../hooks/useBlogList'

describe('useBlogList', () => {
  afterEach(() => vi.restoreAllMocks())

  it('fetches only the manifest and maps entries without per-post requests', async () => {
    const manifest = [
      { slug: 'old', file: 'old.md', title: 'Old', date: '2024-01-01', description: 'o', tags: [], source: 'original' },
      { slug: 'new', file: 'new.md', title: 'New', date: '2025-01-01', description: 'n', tags: ['t'], source: 'linkedin' },
    ]
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve(manifest) })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useBlogList())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/content/blog/manifest.json')
    expect(result.current.posts.map(p => p.slug)).toEqual(['new', 'old'])
    expect(result.current.posts[0].title).toBe('New')
  })
})
