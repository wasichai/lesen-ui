import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orNull, useLesenApi } from '../../shared/api'
import { queryKeys } from '../../shared/keys'
import { retryNetwork } from '../../shared/retry'
import { readingDetailSchema } from '../../shared/schemas'
import { contentSchema, lookupSchema, noteSchema, progressSchema, savedKeysSchema, translationsSchema } from './contract'

const path = (slug: string) => `/lesen/readings/${encodeURIComponent(slug)}`

export function useReadingDetail(slug: string) {
  const { get } = useLesenApi()
  return useQuery({ queryKey: queryKeys.reading(slug), queryFn: () => get(path(slug), readingDetailSchema), retry: retryNetwork })
}

// el texto de una versión publicada no cambia nunca: se pide una vez
export function useContent(slug: string, version: number | undefined) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: queryKeys.content(slug, version ?? 0),
    queryFn: () => get(`${path(slug)}/versions/${version}/content`, contentSchema),
    enabled: version !== undefined,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    retry: retryNetwork
  })
}

export function useProgress(slug: string) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: queryKeys.progress(slug),
    queryFn: () => orNull(get(`${path(slug)}/progress`, progressSchema)),
    staleTime: Infinity,
    retry: retryNetwork
  })
}

export function useSavedKeys(language: string | undefined) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: ['me', 'saved-keys', language],
    queryFn: () => get(`/lesen/vocabulary/keys?language=${encodeURIComponent(language ?? '')}`, savedKeysSchema),
    enabled: language !== undefined,
    retry: retryNetwork
  })
}

export function useLookup(slug: string, version: number, token: string | null) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: queryKeys.lookup(slug, version, token ?? ''),
    queryFn: () =>
      get(`/lesen/dictionary/lookup?reading=${encodeURIComponent(slug)}&version=${version}&token=${encodeURIComponent(token ?? '')}`, lookupSchema),
    enabled: token !== null,
    staleTime: 5 * 60_000,
    retry: retryNetwork
  })
}

// traducciones escritas por una persona. Una oración: 404 si no hay (se dice así). Todos los párrafos: una lista
export function useTranslations(slug: string, version: number, unit: 'SENTENCE' | 'PARAGRAPH', ref: string | null, language: string, enabled: boolean) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: [...queryKeys.translations(slug, version, unit, language), ref],
    queryFn: () =>
      orNull(
        get(
          `${path(slug)}/versions/${version}/translations?unit=${unit}&language=${language}${ref ? `&ref=${encodeURIComponent(ref)}` : ''}`,
          translationsSchema
        )
      ),
    enabled,
    staleTime: Infinity,
    retry: retryNetwork
  })
}

export function useSaveWord(slug: string, version: number) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (word: { entryKey: string; tokenRef: string }) =>
      send('POST', '/lesen/vocabulary', { entryKey: word.entryKey, reading: slug, version, tokenRef: word.tokenRef }),
    onSuccess: (_, word) => {
      queryClient.setQueriesData<string[]>({ queryKey: ['me', 'saved-keys'] }, (keys) =>
        keys && !keys.includes(word.entryKey) ? [...keys, word.entryKey] : keys
      )
      void queryClient.invalidateQueries({ queryKey: ['me', 'lookup'] })
      void queryClient.invalidateQueries({ queryKey: ['me', 'vocabulary'] })
    }
  })
}

export function useNotes(slug: string) {
  const { get } = useLesenApi()
  return useQuery({ queryKey: queryKeys.notes(slug), queryFn: () => get(`${path(slug)}/notes`, noteSchema.array()), retry: retryNetwork })
}

export function useAddNote(slug: string, version: number) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (note: { sentenceRef: string; note?: string }) => send('POST', `${path(slug)}/notes`, { version, ...note }, noteSchema),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes(slug) })
  })
}

export function useDeleteNote(slug: string) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => send('DELETE', `/lesen/notes/${encodeURIComponent(id)}`, undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes(slug) })
  })
}

export function useComplete(slug: string) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { version: number; secondsRead: number }) => send('POST', `${path(slug)}/completion`, body, progressSchema),
    onSuccess: (progress) => {
      queryClient.setQueryData(queryKeys.progress(slug), progress)
      void queryClient.invalidateQueries({ queryKey: ['me'], predicate: (query) => query.queryKey[1] !== 'progress' })
    }
  })
}
