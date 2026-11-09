import type { WasichaiModule } from '@wasichai/core'
import { STUDIO_MODULE_ID, studioMessages } from './i18n'

// el estudio editorial (ADR-0012 del backend): lecturas y borradores, el editor de cada borrador y el historial de cada lectura.
// Con su propio marco (StudioLayout): quien escribe y publica no necesita perfil de lectora
export function studioModule(): WasichaiModule {
  return {
    id: STUDIO_MODULE_ID,
    routes: [
      { id: 'home', path: 'studio', chrome: 'bare', lazy: () => import('./StudioPage').then((m) => ({ default: m.StudioPage })) },
      { id: 'draft', path: 'studio/drafts/:id', chrome: 'bare', lazy: () => import('./DraftPage').then((m) => ({ default: m.DraftPage })) },
      { id: 'history', path: 'studio/readings/:slug', chrome: 'bare', lazy: () => import('./HistoryPage').then((m) => ({ default: m.HistoryPage })) }
    ],
    i18n: studioMessages
  }
}
