import { fetchText, __clearFetchCache } from '../../lib/fetchCache'

describe('fetchText', () => {
  beforeEach(() => __clearFetchCache())
  afterEach(() => vi.restoreAllMocks())

  it('fetches a URL once and serves repeats from cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('hello') })
    vi.stubGlobal('fetch', fetchMock)

    const a = await fetchText('/x.md')
    const b = await fetchText('/x.md')

    expect(a).toBe('hello')
    expect(b).toBe('hello')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not cache a rejected fetch', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('ok') })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchText('/y.md')).rejects.toThrow()
    await expect(fetchText('/y.md')).resolves.toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
