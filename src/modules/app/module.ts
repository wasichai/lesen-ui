import type { WasichaiModule } from '@wasichai/core'
import { APP_NAMESPACE, appMessages } from '../../shared/appMessages'

// solo textos: los compartidos por el marco y los componentes de src/shared
export function appModule(): WasichaiModule {
  return { id: APP_NAMESPACE, i18n: appMessages }
}
