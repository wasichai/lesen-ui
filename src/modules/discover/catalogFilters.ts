import { LEVELS, type Level } from '../../shared/schemas'

// los filtros del catálogo viven en la URL (se comparten, se recargan, el botón atrás funciona). Esto los traduce entre
// la URL, la pantalla y la API, sin React
export const DURATIONS = ['short', 'medium', 'long'] as const
export type Duration = (typeof DURATIONS)[number]
export const SORTS = ['RECENT', 'POPULAR', 'LEVEL', 'DURATION', 'TITLE'] as const
export type Sort = (typeof SORTS)[number]

export interface Filters {
  language: string | null
  levels: Level[]
  topic: string | null
  duration: Duration | null
  q: string
  sort: Sort
}

// minutos estimados de cada duración (inclusivos)
export const DURATION_RANGE: Record<Duration, [number | null, number | null]> = {
  short: [null, 3],
  medium: [4, 6],
  long: [7, null]
}

export function parseFilters(params: URLSearchParams, defaultLanguage: string | null): Filters {
  const levels = params.getAll('level').filter((level): level is Level => (LEVELS as readonly string[]).includes(level))
  const duration = params.get('duration')
  const sort = params.get('sort')
  const language = params.get('language')
  return {
    language: language === 'all' ? null : (language ?? defaultLanguage),
    levels: [...new Set(levels)],
    topic: params.get('topic')?.slice(0, 120) || null,
    duration: (DURATIONS as readonly string[]).includes(duration ?? '') ? (duration as Duration) : null,
    q: (params.get('q') ?? '').slice(0, 64),
    sort: (SORTS as readonly string[]).includes(sort ?? '') ? (sort as Sort) : 'RECENT'
  }
}

export function toSearchParams(filters: Filters, defaultLanguage: string | null): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.language !== defaultLanguage) params.set('language', filters.language ?? 'all')
  for (const level of filters.levels) params.append('level', level)
  if (filters.topic) params.set('topic', filters.topic)
  if (filters.duration) params.set('duration', filters.duration)
  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.sort !== 'RECENT') params.set('sort', filters.sort)
  return params
}

export function toApiQuery(filters: Filters, page: number): string {
  const params = new URLSearchParams()
  if (filters.language) params.set('language', filters.language)
  for (const level of filters.levels) params.append('level', level)
  if (filters.topic) params.set('topic', filters.topic)
  if (filters.duration) {
    const [min, max] = DURATION_RANGE[filters.duration]
    if (min !== null) params.set('minMinutes', String(min))
    if (max !== null) params.set('maxMinutes', String(max))
  }
  if (filters.q.trim()) params.set('q', filters.q.trim())
  params.set('sort', filters.sort)
  params.set('page', String(page))
  params.set('size', '12')
  return params.toString()
}

export function activeCount(filters: Filters): number {
  return filters.levels.length + (filters.topic ? 1 : 0) + (filters.duration ? 1 : 0) + (filters.q.trim() ? 1 : 0)
}
