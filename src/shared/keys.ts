// las claves de react-query de lo que comparten los módulos. Lo de cada persona empieza por 'me', para poder invalidarlo
// entero al cambiar de perfil
export const queryKeys = {
  languages: ['languages'] as const,
  topics: ['topics'] as const,
  profile: ['me', 'profile'] as const,
  discover: ['me', 'discover'] as const,
  readings: (filters: object) => ['me', 'readings', filters] as const,
  reading: (slug: string) => ['me', 'reading', slug] as const,
  progress: (slug: string) => ['me', 'progress', slug] as const,
  notes: (slug: string) => ['me', 'notes', slug] as const,
  library: (q: string) => ['me', 'library', q] as const,
  vocabulary: (filters: object) => ['me', 'vocabulary', filters] as const,
  // el contenido de una versión no cambia nunca (ADR-0003 del backend)
  content: (slug: string, version: number) => ['content', slug, version] as const,
  translations: (slug: string, version: number, unit: string, language: string) => ['translations', slug, version, unit, language] as const,
  lookup: (slug: string, version: number, token: string) => ['me', 'lookup', slug, version, token] as const,
  entry: (key: string) => ['me', 'entry', key] as const,
  search: (q: string, study: string) => ['me', 'search', q, study] as const,
  history: ['me', 'dictionary-history'] as const,
  favorites: ['me', 'favorites'] as const
}
