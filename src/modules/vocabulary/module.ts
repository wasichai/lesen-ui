import type { WasichaiModule } from '@wasichai/core'
import { VOCABULARY_MODULE_ID, vocabularyMessages } from './i18n'

export function vocabularyModule(): WasichaiModule {
  return {
    id: VOCABULARY_MODULE_ID,
    routes: [{ id: 'home', path: 'vocabulary', chrome: 'bare', lazy: () => import('./VocabularyPage').then((m) => ({ default: m.VocabularyPage })) }],
    i18n: vocabularyMessages
  }
}
