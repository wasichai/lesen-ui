import type { WasichaiModule } from '@wasichai/core'
import { appModule } from './modules/app/module'
import { comprehensionModule } from './modules/comprehension/module'
import { dictionaryModule } from './modules/dictionary/module'
import { discoverModule } from './modules/discover/module'
import { libraryModule } from './modules/library/module'
import { onboardingModule } from './modules/onboarding/module'
import { profileModule } from './modules/profile/module'
import { progressModule } from './modules/progress/module'
import { readerModule } from './modules/reader/module'
import { vocabularyModule } from './modules/vocabulary/module'

// los módulos de Lesen, además de coreModule, que WasichaiApp pone siempre (login y administración de la plataforma).
// un módulo por experiencia de quien lee; todos con chrome 'bare' y el marco propio de src/shared/LearnerLayout (ADR-0006)
export const modules: WasichaiModule[] = [
  appModule(),
  onboardingModule(),
  discoverModule(),
  readerModule(),
  comprehensionModule(),
  libraryModule(),
  vocabularyModule(),
  dictionaryModule(),
  progressModule(),
  profileModule()
]
