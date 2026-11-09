import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { z } from 'zod'
import { useLesenApi } from './api'
import { retryNetwork } from './retry'

// las metas de quien lee (progress/goals del backend): los minutos al día viven en el perfil, el resto en el progreso.
// Las usan el panel de progreso y el perfil
export const goalsSchema = z.object({
  dailyMinutes: z.number().int(),
  weeklyDays: z.number().int().min(1).max(7),
  timeZone: z.string(),
  weeklySummary: z.boolean(),
  configured: z.boolean()
})
export type Goals = z.infer<typeof goalsSchema>
export type GoalsChange = Partial<Pick<Goals, 'dailyMinutes' | 'weeklyDays' | 'timeZone' | 'weeklySummary'>>

export const GOALS_KEY = ['me', 'goals'] as const

export function useGoals() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: GOALS_KEY, queryFn: () => get('/lesen/progress/goals', goalsSchema), retry: retryNetwork })
}

export function useSaveGoals() {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (change: GoalsChange) => send('PUT', '/lesen/progress/goals', change, goalsSchema),
    onSuccess: async (saved) => {
      queryClient.setQueryData(GOALS_KEY, saved)
      // la zona horaria cambia los días del panel y los minutos al día, el perfil
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    }
  })
}

// la zona horaria del dispositivo (IANA), o null si el navegador no la sabe
export function deviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

// la primera vez, los días del progreso se cuentan en la zona del dispositivo; después solo cambia si la persona lo pide
export function useDeviceTimeZoneOnce(goals: Goals | undefined) {
  const save = useSaveGoals()
  const { mutate, isIdle } = save
  useEffect(() => {
    const zone = deviceTimeZone()
    if (goals && !goals.configured && zone && isIdle) mutate({ timeZone: zone })
  }, [goals, isIdle, mutate])
}
