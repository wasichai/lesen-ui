import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLesenApi } from '../../shared/api'
import { retryNetwork } from '../../shared/retry'
import { assessmentSchema, attemptSchema, readingRefSchema, sentencesSchema, type AnswerInput, type Attempt } from './contract'

const keys = {
  assessment: (slug: string, version: number) => ['me', 'assessment', slug, version] as const,
  attempt: (id: string) => ['me', 'attempt', id] as const
}

export function useReadingRef(slug: string) {
  const { get } = useLesenApi()
  return useQuery({ queryKey: ['reading-ref', slug], queryFn: () => get(`/lesen/readings/${slug}`, readingRefSchema), retry: retryNetwork })
}

export function useAssessment(slug: string, version: number | undefined) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: keys.assessment(slug, version ?? 0),
    queryFn: () => get(`/lesen/readings/${slug}/versions/${version}/assessment`, assessmentSchema),
    enabled: version !== undefined,
    retry: retryNetwork
  })
}

export function useSubmitAttempt(assessmentId: string) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (answers: AnswerInput[]) => send('POST', `/lesen/assessments/${assessmentId}/attempts`, { answers }, attemptSchema),
    onSuccess: (attempt) => {
      queryClient.setQueryData(keys.attempt(attempt.id), attempt)
      void queryClient.invalidateQueries({ queryKey: ['me', 'assessment'] })
    }
  })
}

// mientras el asistente corrige alguna respuesta (PENDING), se vuelve a pedir cada dos segundos
export function useAttempt(id: string) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: keys.attempt(id),
    queryFn: () => get(`/lesen/attempts/${id}`, attemptSchema),
    refetchInterval: (query) => ((query.state.data as Attempt | undefined)?.summary.pending ? 2000 : false),
    retry: retryNetwork
  })
}

export function useSelfAssessment(attemptId: string) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ questionId, result }: { questionId: string; result: 'CORRECT' | 'PARTIAL' | 'INCORRECT' }) =>
      send('POST', `/lesen/attempts/${attemptId}/answers/${questionId}/self-assessment`, { result }, attemptSchema),
    onSuccess: (attempt) => {
      queryClient.setQueryData(keys.attempt(attempt.id), attempt)
      void queryClient.invalidateQueries({ queryKey: ['me', 'assessment'] })
    }
  })
}

// las oraciones de la versión, para citar lo que sostiene cada respuesta; la versión es inmutable
export function useSentences(slug: string, version: number) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: ['sentences', slug, version],
    queryFn: () => get(`/lesen/readings/${slug}/versions/${version}/content`, sentencesSchema),
    staleTime: Infinity,
    retry: retryNetwork
  })
}
