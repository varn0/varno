import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAtBottom } from '../../hooks/useAtBottom'

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void

// Instrumented mock: records each created instance so the test can fire
// the callback and assert disconnect().
let instances: Array<{
  callback: IOCallback
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  trigger: (isIntersecting: boolean) => void
}>

beforeEach(() => {
  instances = []
  class MockIO {
    callback: IOCallback
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
    constructor(cb: IOCallback) {
      this.callback = cb
      instances.push({
        callback: cb,
        observe: this.observe,
        disconnect: this.disconnect,
        trigger: (isIntersecting: boolean) =>
          cb([{ isIntersecting }]),
      })
    }
  }
  vi.stubGlobal('IntersectionObserver', MockIO)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useAtBottom', () => {
  it('starts not-at-bottom and observes the attached node', () => {
    const { result } = renderHook(() => useAtBottom())
    expect(result.current.atBottom).toBe(false)

    act(() => {
      result.current.ref(document.createElement('div'))
    })

    expect(instances).toHaveLength(1)
    expect(instances[0].observe).toHaveBeenCalledTimes(1)
  })

  it('flips atBottom true then false as the sentinel intersects and leaves', () => {
    const { result } = renderHook(() => useAtBottom())
    act(() => {
      result.current.ref(document.createElement('div'))
    })

    act(() => instances[0].trigger(true))
    expect(result.current.atBottom).toBe(true)

    act(() => instances[0].trigger(false))
    expect(result.current.atBottom).toBe(false)
  })

  it('disconnects the observer on unmount', () => {
    const { result, unmount } = renderHook(() => useAtBottom())
    act(() => {
      result.current.ref(document.createElement('div'))
    })
    const observer = instances[0]
    unmount()
    expect(observer.disconnect).toHaveBeenCalledTimes(1)
  })
})
