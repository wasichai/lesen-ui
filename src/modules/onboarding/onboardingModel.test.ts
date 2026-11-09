import { describe, expect, it } from 'vitest'
import { canAdvance, initialDraft, toggle, toRequest, withInterface } from './onboardingModel'

describe('onboarding', () => {
  it('no avanza sin idioma de estudio ni nivel', () => {
    const draft = initialDraft('es')
    expect(canAdvance('interface', draft)).toBe(true)
    expect(canAdvance('target', draft)).toBe(false)
    expect(canAdvance('level', draft)).toBe(false)
    expect(canAdvance('target', { ...draft, targetLanguage: 'de' })).toBe(true)
  })

  it('el idioma de estudio nunca es el de la interfaz', () => {
    const draft = { ...initialDraft('es'), targetLanguage: 'en' }
    expect(withInterface(draft, 'en').targetLanguage).toBeNull()
    expect(withInterface(draft, 'es').targetLanguage).toBe('en')
    expect(canAdvance('target', { ...draft, targetLanguage: 'es' })).toBe(false)
  })

  it('alterna objetivos y temas', () => {
    expect(toggle(['TRAVEL'], 'WORK')).toEqual(['TRAVEL', 'WORK'])
    expect(toggle(['TRAVEL', 'WORK'], 'TRAVEL')).toEqual(['WORK'])
  })

  it('envía el perfil completo y se niega con uno incompleto', () => {
    expect(() => toRequest(initialDraft('es'))).toThrow()
    const request = toRequest({ ...initialDraft('es'), targetLanguage: 'de', level: 'A2', levelEstimated: true })
    expect(request).toMatchObject({
      interfaceLanguage: 'es',
      targetLanguage: 'de',
      level: 'A2',
      levelEstimated: true,
      dailyMinutes: 10,
      difficulty: 'BALANCED'
    })
  })
})
