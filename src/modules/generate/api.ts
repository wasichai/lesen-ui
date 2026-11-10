import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useLesenApi } from '../../shared/api'
import { pollInterval } from '../../shared/commission'
import { retryNetwork } from '../../shared/retry'
import { commissionSchema, type CommissionRequest } from '../../shared/schemas'

const quotaSchema = z.object({
  dailyLimit: z.number().int(),
  dailyUsed: z.number().int(),
  monthlyBooksLimit: z.number().int(),
  monthlyBooksUsed: z.number().int(),
  resetsAt: z.string().nullable()
})

export function useQuota() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: ['me', 'generations', 'quota'], queryFn: () => get('/lesen/generations/quota', quotaSchema), retry: retryNetwork })
}

export function useMine(id: string | null) {
  const { get } = useLesenApi()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ['me', 'generation', id],
    queryFn: async () => {
      const commission = await get(`/lesen/generations/${encodeURIComponent(id!)}`, commissionSchema)
      if (commission.status === 'READY' || commission.status === 'FAILED') void queryClient.invalidateQueries({ queryKey: ['me', 'generations'] })
      return commission
    },
    enabled: id !== null,
    refetchInterval: (query) => pollInterval(query.state.data),
    retry: retryNetwork
  })
}

export function useAsk() {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CommissionRequest) => send('POST', '/lesen/generations', request, commissionSchema),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'generations'] })
  })
}
