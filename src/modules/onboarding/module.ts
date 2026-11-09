import type { WasichaiModule } from '@wasichai/core'
import { ONBOARDING_MODULE_ID, onboardingMessages } from './i18n'

// el primer paso: idiomas, nivel, intereses y ritmo. Fuera del marco (bare): sin menú hasta tener perfil
export function onboardingModule(): WasichaiModule {
  return {
    id: ONBOARDING_MODULE_ID,
    routes: [{ id: 'welcome', path: 'welcome', chrome: 'bare', lazy: () => import('./OnboardingPage').then((m) => ({ default: m.OnboardingPage })) }],
    i18n: onboardingMessages
  }
}
