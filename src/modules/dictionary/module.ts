import type { WasichaiModule } from '@wasichai/core'
import { DICTIONARY_MODULE_ID, dictionaryMessages } from './i18n'

export function dictionaryModule(): WasichaiModule {
  return {
    id: DICTIONARY_MODULE_ID,
    routes: [
      { id: 'home', path: 'dictionary', chrome: 'bare', lazy: () => import('./DictionaryPage').then((m) => ({ default: m.DictionaryPage })) },
      { id: 'entry', path: 'dictionary/:key', chrome: 'bare', lazy: () => import('./EntryPage').then((m) => ({ default: m.EntryPage })) }
    ],
    i18n: dictionaryMessages
  }
}
