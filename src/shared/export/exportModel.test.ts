import { describe, expect, it } from 'vitest'
import { DEFAULT_EXPORT_OPTIONS, exportFileName, exportPath, readExportOptions } from './exportModel'

describe('exportModel', () => {
  it('asks only for the parts that were chosen', () => {
    expect(exportPath('der-alte-leuchtturm', 2, 'epub', { translations: true, glossary: false, notes: true }, 'es')).toBe(
      '/lesen/readings/der-alte-leuchtturm/versions/2/export?format=epub&translations=true&notes=true&language=es'
    )
    expect(exportPath('a b', 1, 'html', { translations: false, glossary: false, notes: false })).toBe('/lesen/readings/a%20b/versions/1/export?format=html')
  })

  it('names the file after the reading and its version', () => {
    expect(exportFileName('der-alte-leuchtturm', 1, 'epub')).toBe('der-alte-leuchtturm-v1.epub')
  })

  it('falls back to the defaults for missing or broken choices', () => {
    expect(readExportOptions(null)).toEqual(DEFAULT_EXPORT_OPTIONS)
    expect(readExportOptions('{broken')).toEqual(DEFAULT_EXPORT_OPTIONS)
    expect(readExportOptions('7')).toEqual(DEFAULT_EXPORT_OPTIONS)
    expect(readExportOptions('{"notes":true,"glossary":"yes"}')).toEqual({ ...DEFAULT_EXPORT_OPTIONS, notes: true })
  })
})
