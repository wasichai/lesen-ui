import { describe, expect, it } from 'vitest'
import type { ReviewCard } from './contract'
import { modeFor, sentenceOf, waitBetween } from './reviewModel'

const card = (context: string | null) => ({ item: { context } }) as unknown as ReviewCard

describe('reviewModel', () => {
  it('alternates the ways of asking and skips the sentence when there is none', () => {
    expect([0, 1, 2, 3].map((i) => modeFor(card('Mia wohnt am Meer.'), i))).toEqual(['context', 'meaning', 'recall', 'context'])
    expect([0, 1, 2].map((i) => modeFor(card(null), i))).toEqual(['meaning', 'recall', 'meaning'])
  })

  it('finds the sentence of a token', () => {
    expect(sentenceOf('p12s3t40')).toBe('p12s3')
    expect(sentenceOf(null)).toBeNull()
    expect(sentenceOf('p1s2')).toBeNull()
  })

  it('reads the wait in the clearest unit', () => {
    const now = new Date('2026-01-01T09:00:00Z')
    expect(waitBetween(now, '2026-01-01T09:00:20Z')).toEqual({ unit: 'minute', count: 1 })
    expect(waitBetween(now, '2026-01-01T09:10:00Z')).toEqual({ unit: 'minute', count: 10 })
    expect(waitBetween(now, '2026-01-01T15:00:00Z')).toEqual({ unit: 'hour', count: 6 })
    expect(waitBetween(now, '2026-01-17T09:00:00Z')).toEqual({ unit: 'day', count: 16 })
    expect(waitBetween(now, '2026-05-01T09:00:00Z')).toEqual({ unit: 'month', count: 4 })
  })
})
