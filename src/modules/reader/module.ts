import type { WasichaiModule } from '@wasichai/core'
import { READER_MODULE_ID, readerMessages } from './i18n'

// el lector inmersivo, sin el marco de la app: solo la lectura y su barra
export function readerModule(): WasichaiModule {
  return {
    id: READER_MODULE_ID,
    routes: [{ id: 'read', path: 'read/:slug', chrome: 'bare', lazy: () => import('./ReaderPage').then((m) => ({ default: m.ReaderPage })) }],
    i18n: readerMessages
  }
}
