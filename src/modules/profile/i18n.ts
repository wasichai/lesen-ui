export const PROFILE_MODULE_ID = 'profile'

const es = {
  title: 'Perfil',
  lead: 'Tus idiomas, tu nivel y cómo te gusta leer. Cambia lo que quieras cuando quieras.',
  languages: 'Idiomas',
  interface: 'Idioma de la app',
  target: 'Idioma que lees',
  level: 'Tu nivel',
  levelEstimated: 'Es una estimación: ajústalo cuando lo veas claro.',
  goals: 'Para qué aprendes',
  topics: 'Temas que te interesan',
  habit: 'Ritmo',
  daily: 'Minutos al día',
  minutes: '{{count}} min',
  difficulty: 'Dificultad de las lecturas',
  appearance: 'Apariencia de la app',
  save: 'Guardar cambios',
  saving: 'Guardando…',
  saved: 'Cambios guardados.',
  error: 'No pudimos guardar. Inténtalo de nuevo.',
  theme: {
    system: 'Como el sistema',
    lesen: 'Claro',
    lesenDark: 'Oscuro'
  }
}

const en: typeof es = {
  title: 'Profile',
  lead: 'Your languages, your level and how you like to read. Change anything, any time.',
  languages: 'Languages',
  interface: 'App language',
  target: 'Language you read',
  level: 'Your level',
  levelEstimated: 'It’s an estimate: adjust it when you feel sure.',
  goals: 'Why you are learning',
  topics: 'Topics you like',
  habit: 'Pace',
  daily: 'Minutes a day',
  minutes: '{{count}} min',
  difficulty: 'Reading difficulty',
  appearance: 'App appearance',
  save: 'Save changes',
  saving: 'Saving…',
  saved: 'Changes saved.',
  error: "We couldn't save. Please try again.",
  theme: {
    system: 'Match the system',
    lesen: 'Light',
    lesenDark: 'Dark'
  }
}

export const profileMessages = { es, en }
