import type { DIFFICULTIES, GOALS, Level } from '../../shared/schemas'

// el onboarding como datos puros: los pasos, cuándo se puede avanzar y qué se envía. La pantalla solo lo pinta
export const STEPS = ['interface', 'target', 'level', 'interests', 'habit'] as const
export type Step = (typeof STEPS)[number]

export interface Draft {
  interfaceLanguage: string
  targetLanguage: string | null
  level: Level | null
  levelEstimated: boolean
  goals: (typeof GOALS)[number][]
  topics: string[]
  dailyMinutes: number
  difficulty: (typeof DIFFICULTIES)[number]
}

export const DAILY_OPTIONS = [5, 10, 15, 20, 30] as const

// «no estoy seguro» empieza en A2: lo bastante fácil para disfrutar, y la persona lo cambia cuando quiera. Se guarda
// como estimación, nunca como medida
export const ESTIMATED_LEVEL: Level = 'A2'

export function initialDraft(interfaceLanguage: string): Draft {
  return {
    interfaceLanguage,
    targetLanguage: null,
    level: null,
    levelEstimated: false,
    goals: [],
    topics: [],
    dailyMinutes: 10,
    difficulty: 'BALANCED'
  }
}

export function canAdvance(step: Step, draft: Draft): boolean {
  switch (step) {
    case 'interface':
      return draft.interfaceLanguage.length > 0
    case 'target':
      return draft.targetLanguage !== null && draft.targetLanguage !== draft.interfaceLanguage
    case 'level':
      return draft.level !== null
    case 'interests':
      return true
    case 'habit':
      return draft.dailyMinutes > 0
  }
}

// al cambiar el idioma de interfaz, un idioma de estudio igual deja de valer
export function withInterface(draft: Draft, language: string): Draft {
  return { ...draft, interfaceLanguage: language, targetLanguage: draft.targetLanguage === language ? null : draft.targetLanguage }
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function toRequest(draft: Draft) {
  if (!draft.targetLanguage || !draft.level) throw new Error('onboarding incompleto')
  return {
    interfaceLanguage: draft.interfaceLanguage,
    targetLanguage: draft.targetLanguage,
    level: draft.level,
    levelEstimated: draft.levelEstimated,
    goals: draft.goals,
    topics: draft.topics,
    dailyMinutes: draft.dailyMinutes,
    difficulty: draft.difficulty
  }
}
