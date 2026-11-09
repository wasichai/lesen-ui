import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useLesenApi } from '../../shared/api'
import { retryNetwork } from '../../shared/retry'
import { achievementSchema, dashboardSchema, weeklySchema } from './contract'

export function useDashboard() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: ['me', 'progress-dashboard'], queryFn: () => get('/lesen/progress/dashboard', dashboardSchema), retry: retryNetwork })
}

// la semana que contiene el día dado (AAAA-MM-DD); sin él, la en curso
export function useWeekly(week: string | null) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: ['me', 'progress-weekly', week ?? ''],
    queryFn: () => get(`/lesen/progress/weekly${week ? `?week=${encodeURIComponent(week)}` : ''}`, weeklySchema),
    placeholderData: keepPreviousData,
    retry: retryNetwork
  })
}

export function useAchievements() {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: ['me', 'progress-achievements'],
    queryFn: () => get('/lesen/progress/achievements', z.array(achievementSchema)),
    retry: retryNetwork
  })
}
