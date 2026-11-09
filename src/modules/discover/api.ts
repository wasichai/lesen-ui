import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useLesenApi } from '../../shared/api'
import { pageOf } from '../../shared/contract'
import { queryKeys } from '../../shared/keys'
import { retryNetwork } from '../../shared/retry'
import { readingCardSchema, readingDetailSchema } from '../../shared/schemas'
import { toApiQuery, type Filters } from './catalogFilters'
import { discoverSchema } from './contract'

export function useDiscover() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: queryKeys.discover, queryFn: () => get('/lesen/discover', discoverSchema), retry: retryNetwork })
}

export function useReadings(filters: Filters, page: number) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: queryKeys.readings({ ...filters, page }),
    queryFn: () => get(`/lesen/readings?${toApiQuery(filters, page)}`, pageOf(readingCardSchema)),
    placeholderData: keepPreviousData,
    retry: retryNetwork
  })
}

export function useReadingDetail(slug: string) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: queryKeys.reading(slug),
    queryFn: () => get(`/lesen/readings/${encodeURIComponent(slug)}`, readingDetailSchema),
    retry: retryNetwork
  })
}
