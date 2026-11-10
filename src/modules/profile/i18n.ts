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
  weeklyDays: 'Días de lectura por semana',
  weeklyDaysHint: 'Los demás son de descanso: nunca rompen tu racha.',
  days_one: '{{count}} día',
  days_other: '{{count}} días',
  weeklySummary: 'Mostrarme el resumen de la semana al abrir la app',
  timeZone: 'Tus días se cuentan en la zona horaria {{zone}}.',
  useDeviceZone: 'Usar la de este dispositivo ({{zone}})',
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
  },
  mode: 'Claro u oscuro',
  identity: 'Identidad',
  identityLead: 'Cómo se ve Lesen. Se guarda en este dispositivo.',
  direction: {
    musgo: { name: 'Musgo', note: 'Calma natural; la de por defecto' },
    gaceta: { name: 'Gaceta', note: 'Editorial, como una revista literaria' },
    pulso: { name: 'Pulso', note: 'Vibrante y con energía' },
    atlas: { name: 'Atlas', note: 'Minimal, precisa y geométrica' },
    papel: { name: 'Papel y tinta', note: 'La clásica de Lesen' }
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
  weeklyDays: 'Reading days per week',
  weeklyDaysHint: 'The others are rest days: they never break your streak.',
  days_one: '{{count}} day',
  days_other: '{{count}} days',
  weeklySummary: 'Show me the weekly summary when I open the app',
  timeZone: 'Your days are counted in the {{zone}} time zone.',
  useDeviceZone: 'Use this device’s ({{zone}})',
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
  },
  mode: 'Light or dark',
  identity: 'Identity',
  identityLead: 'How Lesen looks. Saved on this device.',
  direction: {
    musgo: { name: 'Moss', note: 'Natural calm, the default' },
    gaceta: { name: 'Gazette', note: 'Editorial, like a literary magazine' },
    pulso: { name: 'Pulse', note: 'Vibrant and energetic' },
    atlas: { name: 'Atlas', note: 'Minimal, precise and geometric' },
    papel: { name: 'Paper & ink', note: 'The classic Lesen look' }
  }
}

export const profileMessages = { es, en }
