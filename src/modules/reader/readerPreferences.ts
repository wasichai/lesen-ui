import { useCallback, useState } from 'react'
import type { ReaderTheme } from '../../theme/themes'

// cómo le gusta leer a cada persona, en este navegador (lesen.reader). Nada de esto es del servidor
export const SIZES = [18, 20, 21, 23, 26, 29] as const
export const LEADINGS = { compact: 1.55, comfortable: 1.75, airy: 1.95 } as const
export type Leading = keyof typeof LEADINGS

export interface ReaderPreferences {
  size: (typeof SIZES)[number]
  leading: Leading
  theme: ReaderTheme
  highlightSaved: boolean
  paragraphTranslations: boolean
  followPosition: boolean
}

export const DEFAULT_PREFERENCES: ReaderPreferences = {
  size: 21,
  leading: 'comfortable',
  theme: 'light',
  highlightSaved: true,
  paragraphTranslations: false,
  followPosition: true
}

const KEY = 'lesen.reader'

// lo guardado se valida campo a campo: un valor viejo o roto vuelve a su valor por defecto, no rompe el lector
export function readPreferences(raw: string | null): ReaderPreferences {
  let stored: Partial<Record<keyof ReaderPreferences, unknown>> = {}
  try {
    stored = raw ? (JSON.parse(raw) as typeof stored) : {}
  } catch {
    stored = {}
  }
  const pick = <K extends keyof ReaderPreferences>(key: K, valid: (value: unknown) => boolean): ReaderPreferences[K] =>
    valid(stored[key]) ? (stored[key] as ReaderPreferences[K]) : DEFAULT_PREFERENCES[key]
  return {
    size: pick('size', (v) => (SIZES as readonly unknown[]).includes(v)),
    leading: pick('leading', (v) => typeof v === 'string' && v in LEADINGS),
    theme: pick('theme', (v) => v === 'light' || v === 'sepia' || v === 'dark'),
    highlightSaved: pick('highlightSaved', (v) => typeof v === 'boolean'),
    paragraphTranslations: pick('paragraphTranslations', (v) => typeof v === 'boolean'),
    followPosition: pick('followPosition', (v) => typeof v === 'boolean')
  }
}

export function stepSize(size: ReaderPreferences['size'], step: 1 | -1): ReaderPreferences['size'] {
  const at = SIZES.indexOf(size)
  return SIZES[Math.max(0, Math.min(SIZES.length - 1, at + step))]!
}

export function useReaderPreferences() {
  const [preferences, setPreferences] = useState<ReaderPreferences>(() => {
    try {
      return readPreferences(localStorage.getItem(KEY))
    } catch {
      return DEFAULT_PREFERENCES
    }
  })
  const update = useCallback((change: Partial<ReaderPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...change }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // sin almacenamiento (modo privado): vale para esta sesión
      }
      return next
    })
  }, [])
  return { preferences, update }
}
