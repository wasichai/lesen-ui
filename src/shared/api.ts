import { ApiError, useApiClient } from '@wasichai/core'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { z } from 'zod'
import { parseContract } from './contract'
import { queryKeys } from './keys'
import { retryNetwork } from './retry'
import { languageCatalogSchema, profileSchema, topicTreeSchema } from './schemas'

// las llamadas a /api/lesen con el cliente de @wasichai/core (token, problem+json → ApiError) y el contrato validado con zod
export function useLesenApi() {
  const client = useApiClient()
  const get = useCallback(
    async <T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> => parseContract(schema, path, await client.request<unknown>(path, init)),
    [client]
  )
  const send = useCallback(
    async <T>(method: string, path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> => {
      const answer = await client.request<unknown>(path, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body)
      })
      return (schema ? parseContract(schema, path, answer) : answer) as T
    },
    [client]
  )
  return { get, send }
}

export const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404

// sin datos todavía (404) es una respuesta, no un fallo: el perfil antes del onboarding, el progreso antes de empezar
export async function orNull<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

export function useLanguages() {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: queryKeys.languages,
    queryFn: () => get('/lesen/public/languages', languageCatalogSchema),
    staleTime: Infinity,
    retry: retryNetwork
  })
}

export function useTopics() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: queryKeys.topics, queryFn: () => get('/lesen/public/topics', topicTreeSchema), staleTime: 10 * 60_000, retry: retryNetwork })
}

// el perfil de aprendizaje; null mientras la persona no completó el onboarding
export function useProfile() {
  const { get } = useLesenApi()
  return useQuery({ queryKey: queryKeys.profile, queryFn: () => orNull(get('/lesen/learner/profile', profileSchema)), staleTime: 60_000, retry: retryNetwork })
}
