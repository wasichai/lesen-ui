import type { WasichaiModule } from '@wasichai/core'
import { LIBRARY_MODULE_ID, libraryMessages } from './i18n'

export function libraryModule(): WasichaiModule {
  return {
    id: LIBRARY_MODULE_ID,
    routes: [
      { id: 'home', path: 'library', chrome: 'bare', lazy: () => import('./LibraryPage').then((m) => ({ default: m.LibraryPage })) },
      { id: 'list', path: 'library/lists/:id', chrome: 'bare', lazy: () => import('./ListPage').then((m) => ({ default: m.ListPage })) }
    ],
    i18n: libraryMessages
  }
}
