import { describe, expect, it } from 'vitest'
import { DEFAULT_PREFERENCES, readPreferences, stepSize } from './readerPreferences'

describe('preferencias del lector', () => {
  it('sin nada guardado, o con algo roto, los valores por defecto', () => {
    expect(readPreferences(null)).toEqual(DEFAULT_PREFERENCES)
    expect(readPreferences('{no es json')).toEqual(DEFAULT_PREFERENCES)
  })

  it('valida cada campo por separado', () => {
    const prefs = readPreferences(JSON.stringify({ size: 23, leading: 'huge', theme: 'sepia', highlightSaved: 'yes', paragraphTranslations: true }))
    expect(prefs).toEqual({ ...DEFAULT_PREFERENCES, size: 23, theme: 'sepia', paragraphTranslations: true })
  })

  it('el tamaño sube y baja sin salirse de la escala', () => {
    expect(stepSize(21, 1)).toBe(23)
    expect(stepSize(18, -1)).toBe(18)
    expect(stepSize(29, 1)).toBe(29)
  })
})
