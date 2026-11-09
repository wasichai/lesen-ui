import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useLesenApi } from './api'
import { retryNetwork } from './retry'
import { readingCardSchema } from './schemas'

// las listas de lecturas propias (lists/** del backend): las gestiona Mis lecturas y la ficha de una lectura añade o quita
export const listSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number().int().nonnegative(),
  contains: z.boolean().nullable(),
  updatedAt: z.string()
})
export type ListSummary = z.infer<typeof listSummarySchema>

export const listViewSchema = z.object({ id: z.string(), name: z.string(), updatedAt: z.string(), readings: z.array(readingCardSchema) })
export type ListView = z.infer<typeof listViewSchema>

export const LIST_NAME_MAX = 80

const listsKey = (reading?: string) => ['me', 'lists', reading ?? ''] as const

export function useLists(reading?: string, enabled = true) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: listsKey(reading),
    queryFn: () => get(`/lesen/lists${reading ? `?reading=${encodeURIComponent(reading)}` : ''}`, z.array(listSummarySchema)),
    enabled,
    retry: retryNetwork
  })
}

export function useList(id: string) {
  const { get } = useLesenApi()
  return useQuery({ queryKey: ['me', 'list', id], queryFn: () => get(`/lesen/lists/${encodeURIComponent(id)}`, listViewSchema), retry: retryNetwork })
}

function useInvalidateLists() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: ['me', 'lists'] }), queryClient.invalidateQueries({ queryKey: ['me', 'list'] })]).then(
      () => undefined
    )
}

export function useCreateList() {
  const { send } = useLesenApi()
  const invalidate = useInvalidateLists()
  return useMutation({ mutationFn: (name: string) => send('POST', '/lesen/lists', { name }, listViewSchema), onSuccess: invalidate })
}

export function useRenameList(id: string) {
  const { send } = useLesenApi()
  const invalidate = useInvalidateLists()
  return useMutation({ mutationFn: (name: string) => send('PATCH', `/lesen/lists/${encodeURIComponent(id)}`, { name }, listViewSchema), onSuccess: invalidate })
}

export function useDeleteList(id: string) {
  const { send } = useLesenApi()
  const invalidate = useInvalidateLists()
  return useMutation({ mutationFn: () => send('DELETE', `/lesen/lists/${encodeURIComponent(id)}`, undefined), onSuccess: invalidate })
}

// poner o quitar una lectura de una lista
export function useListReading() {
  const { send } = useLesenApi()
  const invalidate = useInvalidateLists()
  return useMutation({
    mutationFn: ({ list, slug, on }: { list: string; slug: string; on: boolean }) =>
      send(on ? 'PUT' : 'DELETE', `/lesen/lists/${encodeURIComponent(list)}/readings/${encodeURIComponent(slug)}`, undefined),
    onSettled: invalidate
  })
}
