export const ONBOARDING_MODULE_ID = 'onboarding'

const es = {
  title: 'Bienvenida a Lesen',
  step: 'Paso {{current}} de {{total}}',
  next: 'Continuar',
  back: 'Atrás',
  finish: 'Empezar a leer',
  saving: 'Guardando…',
  error: 'No pudimos guardar tu perfil. Inténtalo de nuevo.',
  interface: {
    eyebrow: 'Hola',
    heading: 'Aprende un idioma leyendo historias que te gustan',
    body: 'Lee, toca cualquier palabra que no conozcas y guárdala para después. Primero, ¿en qué idioma quieres usar la app?'
  },
  target: {
    heading: '¿Qué idioma quieres leer?',
    body: 'Podrás añadir otros más adelante.'
  },
  level: {
    heading: '¿Cómo lees en {{language}} hoy?',
    body: 'Elige lo que mejor te describa. Puedes cambiarlo cuando quieras.',
    unsure: 'No estoy segura o seguro',
    unsureBody: 'Empezamos por A2 y ajustas sobre la marcha. Es una estimación, no una nota.'
  },
  interests: {
    heading: '¿Qué te gustaría leer?',
    body: 'Elige lo que te llame. Así recomendamos mejor.',
    goals: 'Para qué aprendes',
    topics: 'Temas'
  },
  habit: {
    heading: 'Un ritmo que te siente bien',
    body: 'Unos minutos al día bastan. Sin rachas que castiguen: si un día no lees, no pasa nada.',
    daily: 'Minutos al día',
    minutes: '{{count}} min',
    difficulty: 'Dificultad de las lecturas'
  }
}

const en: typeof es = {
  title: 'Welcome to Lesen',
  step: 'Step {{current}} of {{total}}',
  next: 'Continue',
  back: 'Back',
  finish: 'Start reading',
  saving: 'Saving…',
  error: "We couldn't save your profile. Please try again.",
  interface: {
    eyebrow: 'Hello',
    heading: 'Learn a language by reading stories you enjoy',
    body: 'Read, tap any word you don’t know and save it for later. First, which language should the app speak?'
  },
  target: {
    heading: 'Which language do you want to read?',
    body: 'You can add more later.'
  },
  level: {
    heading: 'How do you read {{language}} today?',
    body: 'Pick what describes you best. You can change it any time.',
    unsure: "I'm not sure",
    unsureBody: 'We start at A2 and you adjust as you go. It’s an estimate, not a grade.'
  },
  interests: {
    heading: 'What would you like to read?',
    body: 'Pick whatever catches your eye. It helps us recommend.',
    goals: 'Why you are learning',
    topics: 'Topics'
  },
  habit: {
    heading: 'A pace that suits you',
    body: 'A few minutes a day is enough. No punishing streaks: if you skip a day, that’s fine.',
    daily: 'Minutes a day',
    minutes: '{{count}} min',
    difficulty: 'Reading difficulty'
  }
}

export const onboardingMessages = { es, en }
