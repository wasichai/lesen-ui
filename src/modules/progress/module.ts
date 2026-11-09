import type { WasichaiModule } from '@wasichai/core'
import { PROGRESS_MODULE_ID, progressMessages } from './i18n'

// el progreso de quien lee: el panel (lectura, vocabulario, comprensión, metas y logros) y el resumen de cada semana
export function progressModule(): WasichaiModule {
  return {
    id: PROGRESS_MODULE_ID,
    routes: [
      { id: 'home', path: 'progress', chrome: 'bare', lazy: () => import('./ProgressPage').then((m) => ({ default: m.ProgressPage })) },
      { id: 'week', path: 'progress/week', chrome: 'bare', lazy: () => import('./WeekPage').then((m) => ({ default: m.WeekPage })) }
    ],
    i18n: progressMessages
  }
}
