// las claves de ruta de cada módulo, para useWasichaiLinks().to(...). Viven aquí y no en cada módulo para que el marco
// (LearnerLayout) y los enlaces entre módulos no importen otro módulo: un módulo solo importa shared y lo suyo
export const ROUTES = {
  welcome: 'onboarding:welcome',
  discover: 'discover:home',
  explore: 'discover:explore',
  reading: 'discover:reading',
  reader: 'reader:read',
  library: 'library:home',
  vocabulary: 'vocabulary:home',
  dictionary: 'dictionary:home',
  entry: 'dictionary:entry',
  profile: 'profile:home'
} as const

export type RouteName = keyof typeof ROUTES
