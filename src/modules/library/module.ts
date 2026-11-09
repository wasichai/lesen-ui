import type { WasichaiModule } from '@wasichai/core'
import { LIBRARY_MODULE_ID, libraryMessages } from './i18n'

export function libraryModule(): WasichaiModule {
  return {
    id: LIBRARY_MODULE_ID,
    routes: [{ id: 'home', path: 'library', chrome: 'bare', lazy: () => import('./LibraryPage').then((m) => ({ default: m.LibraryPage })) }],
    i18n: libraryMessages
  }
}
