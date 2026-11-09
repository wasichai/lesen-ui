// las claves de ruta de cada módulo, para useWasichaiLinks().to(...). Viven aquí y no en cada módulo para que el marco
// (LearnerLayout) y los enlaces entre módulos no importen otro módulo: un módulo solo importa shared y lo suyo
export const ROUTES = {
  welcome: 'onboarding:welcome',
  discover: 'discover:home',
  explore: 'discover:explore',
  reading: 'discover:reading',
  reader: 'reader:read',
  library: 'library:home',
  list: 'library:list',
  quiz: 'comprehension:quiz',
  attempt: 'comprehension:attempt',
  vocabulary: 'vocabulary:home',
  review: 'vocabulary:review',
  dictionary: 'dictionary:home',
  entry: 'dictionary:entry',
  progress: 'progress:home',
  week: 'progress:week',
  profile: 'profile:home',
  studio: 'studio:home',
  studioDraft: 'studio:draft',
  studioHistory: 'studio:history'
} as const

export type RouteName = keyof typeof ROUTES
