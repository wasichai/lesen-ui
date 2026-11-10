import { describe, expect, it } from 'vitest'
import type { Profile } from '../../shared/schemas'
import { booksLeft, canAsk, dailyLeft, initialRequest, toRequest, type Quota } from './generateModel'

const profile: Profile = {
  interfaceLanguage: 'es',
  targetLanguage: 'de',
  level: 'A2',
  levelEstimated: false,
  goals: [],
  topics: ['travel', 'nature'],
  dailyMinutes: 6,
  difficulty: 'BALANCED'
}
const quota = (dailyUsed: number, monthlyBooksUsed: number): Quota => ({ dailyLimit: 3, dailyUsed, monthlyBooksLimit: 4, monthlyBooksUsed, resetsAt: null })

describe('pedir una lectura a medida', () => {
  it('propone el idioma, el nivel y el largo del perfil, y un libro en los primeros niveles', () => {
    expect(initialRequest(profile)).toMatchObject({ language: 'de', level: 'A2', minutes: 5, format: 'PICTURE_BOOK', topics: ['travel'] })
    expect(initialRequest({ ...profile, level: 'B2', dailyMinutes: 15 })).toMatchObject({ minutes: 8, format: 'TEXT' })
    expect(initialRequest(null)).toMatchObject({ language: '', level: 'A1', minutes: 2 })
  })

  it('la cuota dice si se puede pedir, y un libro gasta también la del mes', () => {
    expect(dailyLeft(quota(1, 0))).toBe(2)
    expect(booksLeft(quota(0, 5))).toBe(0)
    expect(canAsk(quota(0, 4), 'PICTURE_BOOK')).toBe(false)
    expect(canAsk(quota(0, 4), 'TEXT')).toBe(true)
    expect(canAsk(quota(3, 0), 'TEXT')).toBe(false)
    expect(canAsk(undefined, 'TEXT')).toBe(false)
  })

  it('la idea va sin espacios sobrantes, o no va', () => {
    expect(toRequest({ ...initialRequest(profile), prompt: '  un faro  ' }).prompt).toBe('un faro')
    expect(toRequest({ ...initialRequest(profile), prompt: '   ' }).prompt).toBeNull()
  })
})
