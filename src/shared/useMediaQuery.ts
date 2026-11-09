import { useSyncExternalStore } from 'react'

// una media query como estado. Sin matchMedia (jsdom), false
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window.matchMedia !== 'function') return () => {}
      const list = window.matchMedia(query)
      list.addEventListener('change', notify)
      return () => list.removeEventListener('change', notify)
    },
    () => (typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false),
    () => false
  )
}

// dispositivos sin hover fiable (táctiles): las palabras se abren al tocar, nunca al pasar por encima
export const useCanHover = () => useMediaQuery('(hover: hover) and (pointer: fine)')
export const useIsWide = () => useMediaQuery('(min-width: 768px)')
