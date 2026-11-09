import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useLesenApi } from '../../shared/api'
import { entrySchema, entrySummarySchema } from '../../shared/entry'
import { queryKeys } from '../../shared/keys'
import { retryNetwork } from '../../shared/retry'

const summaries = z.array(entrySummarySchema)
const historySchema = z.array(z.object({ query: z.string(), entryKey: z.string().nullable() }))

export function useSearch(q: string, record: boolean) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: [...queryKeys.search(q, ''), record],
    queryFn: () => get(`/lesen/dictionary/search?q=${encodeURIComponent(q)}&limit=${record ? 20 : 8}${record ? '&record=true' : ''}`, summaries),
    enabled: q.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: record ? 0 : 60_000,
    retry: retryNetwork
  })
}

export function useHistory() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: queryKeys.history, queryFn: () => get('/lesen/dictionary/history', historySchema), retry: retryNetwork })
}

export function useFavorites() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: queryKeys.favorites, queryFn: () => get('/lesen/dictionary/favorites', summaries), retry: retryNetwork })
}

export function useEntry(key: string) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: queryKeys.entry(key),
    queryFn: () => get(`/lesen/dictionary/entries/${encodeURIComponent(key)}`, entrySchema),
    retry: retryNetwork
  })
}

export function useClearHistory() {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => send('DELETE', '/lesen/dictionary/history', undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.history })
  })
}

export function useFavorite(key: string) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (on: boolean) => send(on ? 'PUT' : 'DELETE', `/lesen/dictionary/favorites/${encodeURIComponent(key)}`, undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.entry(key) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites })
    }
  })
}

export function useSaveEntry(key: string) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => send('POST', '/lesen/vocabulary', { entryKey: key }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['me'] })
  })
}
