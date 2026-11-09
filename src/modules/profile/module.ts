import type { WasichaiModule } from '@wasichai/core'
import { PROFILE_MODULE_ID, profileMessages } from './i18n'

export function profileModule(): WasichaiModule {
  return {
    id: PROFILE_MODULE_ID,
    routes: [{ id: 'home', path: 'profile', chrome: 'bare', lazy: () => import('./ProfilePage').then((m) => ({ default: m.ProfilePage })) }],
    i18n: profileMessages
  }
}
