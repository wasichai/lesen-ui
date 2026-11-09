import type { ReviewCard } from './contract'

// tres maneras de preguntar por una palabra, que se alternan en la sesión: reconocerla en su oración, decir qué significa
// la palabra suelta y, al revés, decir la palabra a partir de su traducción. Sin oración guardada, solo las dos últimas
export type Mode = 'context' | 'meaning' | 'recall'

export function modeFor(card: ReviewCard, index: number): Mode {
  const modes: Mode[] = card.item.context ? ['context', 'meaning', 'recall'] : ['meaning', 'recall']
  return modes[index % modes.length]!
}

// el id de la oración de un token (p3s2t5 → p3s2)
export function sentenceOf(tokenRef: string | null): string | null {
  return tokenRef?.match(/^(p\d+s\d+)t\d+$/)?.[1] ?? null
}

export type Wait = { unit: 'minute' | 'hour' | 'day' | 'month'; count: number }

// cuánto falta para la próxima vez, en la unidad que se lee mejor
export function waitBetween(from: Date, to: string): Wait {
  const minutes = Math.max(1, Math.round((new Date(to).getTime() - from.getTime()) / 60_000))
  if (minutes < 60) return { unit: 'minute', count: minutes }
  if (minutes < 24 * 60) return { unit: 'hour', count: Math.round(minutes / 60) }
  const days = Math.round(minutes / (24 * 60))
  if (days < 45) return { unit: 'day', count: days }
  return { unit: 'month', count: Math.round(days / 30) }
}
