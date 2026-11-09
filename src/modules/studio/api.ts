import { ApiError, useApiClient } from '@wasichai/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useLesenApi } from '../../shared/api'
import { parseContract } from '../../shared/contract'
import { retryNetwork } from '../../shared/retry'
import {
  checkSchema,
  draftSchema,
  draftSummarySchema,
  historySchema,
  mediaSchema,
  publishedReadingSchema,
  type Document,
  type Draft,
  type Question
} from './contract'

const KEY = ['studio'] as const

export function useDrafts() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: [...KEY, 'drafts'], queryFn: () => get('/lesen/studio/drafts', z.array(draftSummarySchema)), retry: retryNetwork })
}

export function usePublished() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: [...KEY, 'readings'], queryFn: () => get('/lesen/studio/readings', z.array(publishedReadingSchema)), retry: retryNetwork })
}

export function useDraft(id: string) {
  const { get } = useLesenApi()
  return useQuery({ queryKey: [...KEY, 'draft', id], queryFn: () => get(`/lesen/studio/drafts/${encodeURIComponent(id)}`, draftSchema), retry: retryNetwork })
}

export function useCheck(id: string, revision: number | undefined) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: [...KEY, 'check', id, revision],
    queryFn: () => get(`/lesen/studio/drafts/${encodeURIComponent(id)}/check`, checkSchema),
    enabled: revision !== undefined,
    retry: retryNetwork
  })
}

export function useHistory(slug: string) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: [...KEY, 'history', slug],
    queryFn: () => get(`/lesen/studio/readings/${encodeURIComponent(slug)}/history`, historySchema),
    retry: retryNetwork
  })
}

function useStudioMutation<I>(run: (input: I) => Promise<Draft | unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: run,
    onSuccess: (result) => {
      const parsed = draftSchema.safeParse(result)
      if (parsed.success) queryClient.setQueryData([...KEY, 'draft', parsed.data.id], parsed.data)
      void queryClient.invalidateQueries({ queryKey: KEY })
      // lo publicado cambia el catálogo de quien lee
      void queryClient.invalidateQueries({ queryKey: ['me'] })
    }
  })
}

export function useCreateDraft() {
  const { send } = useLesenApi()
  return useStudioMutation((input: { from: string } | { slug: string; language: string; level: string; title: string }) =>
    send('POST', '/lesen/studio/drafts', input, draftSchema)
  )
}

export function useSaveDraft(id: string) {
  const { send } = useLesenApi()
  return useStudioMutation((input: { revision: number; document: Document; questions: Question[] }) =>
    send('PUT', `/lesen/studio/drafts/${encodeURIComponent(id)}`, input, draftSchema)
  )
}

export function useStep(id: string, step: 'submit' | 'return' | 'publish') {
  const { send } = useLesenApi()
  return useStudioMutation((note: string) => send('POST', `/lesen/studio/drafts/${encodeURIComponent(id)}/${step}`, { note: note || null }, draftSchema))
}

export function useDiscard(id: string) {
  const { send } = useLesenApi()
  return useStudioMutation(() => send('DELETE', `/lesen/studio/drafts/${encodeURIComponent(id)}`, undefined))
}

export function useRemoveAudio(id: string) {
  const { send } = useLesenApi()
  return useStudioMutation(() => send('DELETE', `/lesen/studio/drafts/${encodeURIComponent(id)}/audio`, undefined, draftSchema))
}

// los envíos con archivos van como multipart. El cliente de core pone siempre Content-Type: application/json, que rompe el
// límite del cuerpo multipart: aquí se usa su token y su base con fetch, y los errores llegan como ApiError igual que con él
// (pedido aguas arriba a wasichai-ui: no fijar el tipo cuando el cuerpo es FormData)
function useUpload() {
  const client = useApiClient()
  return async <T>(path: string, form: FormData, schema: z.ZodType<T>): Promise<T> => {
    const token = client.getToken()
    const response = await fetch(`${client.baseUrl}${path}`, {
      method: 'POST',
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
    const text = await response.text()
    if (!response.ok) {
      let problem: { detail?: string; title?: string; errors?: { field: string; message: string }[] } = {}
      try {
        problem = JSON.parse(text)
      } catch {
        problem = {}
      }
      throw new ApiError(response.status, problem.detail ?? problem.title ?? `HTTP ${response.status}`, problem.errors ?? [])
    }
    return parseContract(schema, path, text ? JSON.parse(text) : null)
  }
}

export function useAttachAudio(id: string) {
  const upload = useUpload()
  return useStudioMutation((input: { audio: File; timings: File; durationMs: number; voice: string; license: string }) => {
    const form = new FormData()
    form.append('audio', input.audio)
    form.append('timings', input.timings)
    form.append('durationMs', String(Math.round(input.durationMs)))
    form.append('voice', input.voice)
    form.append('license', input.license)
    return upload(`/lesen/studio/drafts/${encodeURIComponent(id)}/audio`, form, draftSchema)
  })
}

export function useUploadCover() {
  const upload = useUpload()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return upload('/lesen/studio/covers', form, mediaSchema)
    }
  })
}

export function useAddEntry() {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      language: string
      entry: { key: string; lemma: string; pos: string; forms: string[]; senses: { translations: Record<string, string[]> }[] }
    }) => send('POST', '/lesen/studio/dictionary/entries', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...KEY, 'check'] })
  })
}
