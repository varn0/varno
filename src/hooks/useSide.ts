import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Side } from '../types/side'

export function useSide(): Side {
  const { pathname } = useLocation()
  const side: Side = pathname.startsWith('/creative') ? 'creative' : 'tech'

  useEffect(() => {
    document.documentElement.setAttribute('data-side', side)
  }, [side])

  return side
}
