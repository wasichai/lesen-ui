import type { WasichaiModule } from '@wasichai/core'
import { COMPREHENSION_MODULE_ID, comprehensionMessages } from './i18n'

// las preguntas de comprensión de una lectura y los resultados de cada intento (fase 4, ADR-0009 del backend)
export function comprehensionModule(): WasichaiModule {
  return {
    id: COMPREHENSION_MODULE_ID,
    routes: [
      { id: 'quiz', path: 'read/:slug/questions', chrome: 'bare', lazy: () => import('./QuizPage').then((m) => ({ default: m.QuizPage })) },
      { id: 'attempt', path: 'attempts/:id', chrome: 'bare', lazy: () => import('./ResultsPage').then((m) => ({ default: m.ResultsPage })) }
    ],
    i18n: comprehensionMessages
  }
}
