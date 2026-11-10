import { MINUTES, type CommissionRequest, type Profile } from '../../shared/schemas'

// pedir una lectura a medida sin React (ADR-0016 del backend): lo que se propone según el perfil y lo que queda de cuota

export interface Quota {
  dailyLimit: number
  dailyUsed: number
  monthlyBooksLimit: number
  monthlyBooksUsed: number
  resetsAt: string | null
}

// la petición de partida: el idioma y el nivel del perfil, el largo más cercano a sus minutos diarios y, en los primeros
// niveles, un libro ilustrado
export function initialRequest(profile: Profile | null | undefined): CommissionRequest {
  const minutes = profile
    ? MINUTES.reduce((best, m) => (Math.abs(m - profile.dailyMinutes) < Math.abs(best - profile.dailyMinutes) ? m : best), MINUTES[0])
    : MINUTES[0]
  const level = profile?.level ?? 'A1'
  return {
    language: profile?.targetLanguage ?? '',
    level,
    minutes,
    kind: 'STORY',
    format: level === 'A1' || level === 'A2' ? 'PICTURE_BOOK' : 'TEXT',
    topics: (profile?.topics ?? []).slice(0, 1),
    prompt: null
  }
}

export const dailyLeft = (quota: Quota) => Math.max(0, quota.dailyLimit - quota.dailyUsed)
export const booksLeft = (quota: Quota) => Math.max(0, quota.monthlyBooksLimit - quota.monthlyBooksUsed)

// si se puede pedir ahora lo que está elegido
export function canAsk(quota: Quota | undefined, format: CommissionRequest['format']): boolean {
  if (!quota) return false
  return dailyLeft(quota) > 0 && (format === 'TEXT' || booksLeft(quota) > 0)
}

// lo que se manda: la idea sin espacios sobrantes, o nada
export const toRequest = (request: CommissionRequest): CommissionRequest => ({ ...request, prompt: request.prompt?.trim() || null })
