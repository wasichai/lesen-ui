import type { WasichaiModule } from '@wasichai/core'
import { GENERATE_MODULE_ID, generateMessages } from './i18n'

// pedir una lectura a medida (ADR-0016 del backend)
export function generateModule(): WasichaiModule {
  return {
    id: GENERATE_MODULE_ID,
    routes: [{ id: 'home', path: 'request', chrome: 'bare', lazy: () => import('./GeneratePage').then((m) => ({ default: m.GeneratePage })) }],
    i18n: generateMessages
  }
}
