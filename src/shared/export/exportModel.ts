// exportar una lectura (ADR-0015 del backend): ePub para Apple Books, Kindle y demás, o una página para imprimir o
// guardar como PDF. Lo que se incluye además del texto y la portada lo elige la persona y se recuerda en este navegador
export type ExportFormat = 'epub' | 'html'

export interface ExportOptions {
  translations: boolean
  glossary: boolean
  notes: boolean
}

export const EXPORT_PARTS = ['translations', 'glossary', 'notes'] as const satisfies readonly (keyof ExportOptions)[]

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = { translations: true, glossary: true, notes: false }

const KEY = 'lesen.export'

export function exportPath(slug: string, version: number, format: ExportFormat, options: ExportOptions, language?: string): string {
  const query = new URLSearchParams({ format })
  for (const part of EXPORT_PARTS) if (options[part]) query.set(part, 'true')
  if (language) query.set('language', language)
  return `/lesen/readings/${encodeURIComponent(slug)}/versions/${version}/export?${query.toString()}`
}

export const exportFileName = (slug: string, version: number, format: ExportFormat) => `${slug}-v${version}.${format}`

// lo guardado se valida campo a campo: un valor viejo o roto vuelve al de por defecto
export function readExportOptions(raw: string | null): ExportOptions {
  let stored: Partial<Record<keyof ExportOptions, unknown>> = {}
  try {
    stored = raw ? (JSON.parse(raw) as typeof stored) : {}
  } catch {
    stored = {}
  }
  if (typeof stored !== 'object' || stored === null) stored = {}
  const pick = (key: keyof ExportOptions) => (typeof stored[key] === 'boolean' ? (stored[key] as boolean) : DEFAULT_EXPORT_OPTIONS[key])
  return { translations: pick('translations'), glossary: pick('glossary'), notes: pick('notes') }
}

export function loadExportOptions(): ExportOptions {
  try {
    return readExportOptions(localStorage.getItem(KEY))
  } catch {
    return DEFAULT_EXPORT_OPTIONS
  }
}

export function saveExportOptions(options: ExportOptions) {
  try {
    localStorage.setItem(KEY, JSON.stringify(options))
  } catch {
    // sin almacenamiento (ventana privada): se elige de nuevo la próxima vez
  }
}
