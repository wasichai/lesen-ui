export const PROGRESS_MODULE_ID = 'progress'

const es = {
  title: 'Tu progreso',
  lead: 'Lo que has leído y aprendido, a tu ritmo. Un día sin leer también es parte del camino.',
  language: 'En {{language}}',
  kind: {
    MEASURED: 'medido',
    ESTIMATED: 'estimado',
    MEASUREDHint: 'Lo contamos al leer, guardar o responder.',
    ESTIMATEDHint: 'Es una estimación: no podemos saberlo con certeza.'
  },
  legend: 'Cada cifra dice si la medimos o la estimamos.',
  today: {
    title: 'Hoy',
    minutes: '{{minutes}} de {{goal}} min',
    met: 'Meta de hoy cumplida. ¡Bien hecho!',
    progress: 'Llevas {{minutes}} min de tu meta de {{goal}}.',
    rest: 'Hoy aún no has leído. Cuando quieras, aquí estará.',
    goalLabel: 'Meta diaria'
  },
  streak: {
    title: 'Tu semana',
    weeks_one: '{{count}} semana seguida',
    weeks_other: '{{count}} semanas seguidas',
    days: '{{active}} de {{target}} días esta semana',
    metThisWeek_one: 'Semana cumplida. Llevas {{count}} semana seguida.',
    metThisWeek_other: 'Semana cumplida. Llevas {{count}} semanas seguidas.',
    ongoing_one: 'Llevas {{count}} semana seguida. Te quedan {{left}} días de lectura para esta.',
    ongoing_other: 'Llevas {{count}} semanas seguidas. Te quedan {{left}} días de lectura para esta.',
    start: 'Lee {{left}} días esta semana y empiezas una racha. Los demás son de descanso.',
    best: 'Tu mejor racha: {{count}}',
    rest: 'Los días de descanso no rompen la racha.',
    edit: 'Cambiar metas'
  },
  days: {
    title: 'Últimos 28 días',
    caption: 'Minutos leídos por día en los últimos 28 días',
    day: 'Día',
    minutes: 'Minutos',
    goalMet: 'Meta cumplida',
    yes: 'sí',
    no: '—',
    summary: 'Leíste {{active}} de los últimos 28 días.'
  },
  reading: {
    title: 'Lectura',
    completed: 'Lecturas terminadas',
    started: 'Lecturas empezadas',
    minutes: 'Tiempo leyendo',
    wordsRead: 'Palabras leídas',
    thisWeek: 'Esta semana: {{minutes}} min y {{completed}} terminadas'
  },
  vocabulary: {
    title: 'Vocabulario',
    encountered: 'Encontradas',
    saved: 'Guardadas',
    learning: 'Aprendiendo',
    mastered: 'Dominadas',
    due: 'Para repasar',
    growth: 'Palabras guardadas por semana',
    growthCaption: 'Palabras guardadas en cada una de las últimas 8 semanas',
    week: 'Semana del {{date}}',
    review: 'Repasar ahora'
  },
  comprehension: {
    title: 'Comprensión',
    average: 'Media',
    answered: 'Respuestas corregidas',
    none: 'Cuando respondas las preguntas de una lectura, verás aquí cómo la entiendes.',
    byType: 'Por tipo de pregunta',
    byLevel: 'Por nivel',
    answeredCount_one: '{{count}} respuesta',
    answeredCount_other: '{{count}} respuestas',
    note: 'Cuenta el primer intento de cada lectura; lo parcial vale la mitad.',
    type: {
      MULTIPLE_CHOICE: 'Opción múltiple',
      TRUE_FALSE: 'Verdadero o falso',
      COMPLETION: 'Completar',
      MATCHING: 'Relacionar',
      ORDERING: 'Ordenar',
      SHORT_ANSWER: 'Respuesta breve',
      VOCABULARY_IN_CONTEXT: 'Vocabulario en contexto',
      MAIN_IDEA: 'Idea principal',
      INFERENCE: 'Inferencia',
      DETAIL: 'Detalle'
    }
  },
  level: {
    title: 'Tu nivel',
    estimated: 'Nivel {{level}}, estimado',
    UP: 'Entiendes muy bien lo de tu nivel. Te proponemos alguna lectura del siguiente.',
    STEADY: 'Seguimos con lecturas de tu nivel.',
    DOWN: 'Te proponemos alguna lectura un poco más sencilla para afianzar.',
    few: 'Con más preguntas respondidas podremos afinar la estimación.',
    profile: 'Cambiar nivel en el perfil'
  },
  achievements: {
    title: 'Logros',
    recent: 'Tus últimos logros',
    all: 'Todos los logros',
    earned: 'Conseguido el {{date}}',
    progress: '{{value}} de {{threshold}}',
    none: 'Tus logros aparecerán aquí a medida que leas.',
    code: {
      FIRST_READING: 'Primera lectura terminada',
      READINGS_5: '5 lecturas terminadas',
      READINGS_20: '20 lecturas terminadas',
      FIRST_HOUR: 'Tu primera hora leyendo',
      TEN_HOURS: '10 horas leyendo',
      FIRST_WORD: 'Primera palabra guardada',
      WORDS_50: '50 palabras guardadas',
      FIRST_REVIEW: 'Primer repaso',
      REVIEWS_100: '100 repasos',
      FIRST_ASSESSMENT: 'Primeras preguntas respondidas',
      DAYS_10: '10 días leyendo',
      FIRST_WEEK: 'Primera semana cumplida',
      STREAK_4: '4 semanas seguidas'
    }
  },
  week: {
    title: 'Resumen semanal',
    open: 'Ver el resumen de la semana',
    current: 'Esta semana',
    previous: 'Semana anterior',
    next: 'Semana siguiente',
    days: 'Días',
    minutes: 'Minutos leídos',
    completed: 'Lecturas terminadas',
    wordsRead: 'Palabras leídas',
    wordsSaved: 'Palabras guardadas',
    wordsReviewed: 'Repasos',
    assessments: 'Cuestionarios',
    met: 'Semana cumplida: {{active}} de {{target}} días.',
    progress: '{{active}} de {{target}} días de lectura.',
    quiet: 'Una semana tranquila. Cada semana empieza de nuevo.',
    earned: 'Conseguiste esta semana',
    caption: 'Minutos leídos cada día de la semana',
    back: 'Volver al progreso'
  },
  hours: '{{hours}} h {{minutes}} min',
  minutesOnly: '{{minutes}} min'
}

const en: typeof es = {
  title: 'Your progress',
  lead: 'What you have read and learned, at your own pace. A day without reading is part of the journey too.',
  language: 'In {{language}}',
  kind: {
    MEASURED: 'measured',
    ESTIMATED: 'estimated',
    MEASUREDHint: 'We count it as you read, save or answer.',
    ESTIMATEDHint: 'It’s an estimate: we can’t know it for sure.'
  },
  legend: 'Every number says whether we measured or estimated it.',
  today: {
    title: 'Today',
    minutes: '{{minutes}} of {{goal}} min',
    met: 'Today’s goal reached. Well done!',
    progress: 'You have read {{minutes}} min of your {{goal}} min goal.',
    rest: 'No reading yet today. Whenever you’re ready, it’ll be here.',
    goalLabel: 'Daily goal'
  },
  streak: {
    title: 'Your week',
    weeks_one: '{{count}} week in a row',
    weeks_other: '{{count}} weeks in a row',
    days: '{{active}} of {{target}} days this week',
    metThisWeek_one: 'Week done. That’s {{count}} week in a row.',
    metThisWeek_other: 'Week done. That’s {{count}} weeks in a row.',
    ongoing_one: '{{count}} week in a row so far. {{left}} reading days to go this week.',
    ongoing_other: '{{count}} weeks in a row so far. {{left}} reading days to go this week.',
    start: 'Read on {{left}} days this week to start a streak. The other days are for resting.',
    best: 'Your best streak: {{count}}',
    rest: 'Rest days never break your streak.',
    edit: 'Change goals'
  },
  days: {
    title: 'Last 28 days',
    caption: 'Minutes read each day over the last 28 days',
    day: 'Day',
    minutes: 'Minutes',
    goalMet: 'Goal reached',
    yes: 'yes',
    no: '—',
    summary: 'You read on {{active}} of the last 28 days.'
  },
  reading: {
    title: 'Reading',
    completed: 'Readings finished',
    started: 'Readings started',
    minutes: 'Time reading',
    wordsRead: 'Words read',
    thisWeek: 'This week: {{minutes}} min and {{completed}} finished'
  },
  vocabulary: {
    title: 'Vocabulary',
    encountered: 'Encountered',
    saved: 'Saved',
    learning: 'Learning',
    mastered: 'Mastered',
    due: 'Due for review',
    growth: 'Words saved per week',
    growthCaption: 'Words saved in each of the last 8 weeks',
    week: 'Week of {{date}}',
    review: 'Review now'
  },
  comprehension: {
    title: 'Comprehension',
    average: 'Average',
    answered: 'Graded answers',
    none: 'Once you answer the questions of a reading, you’ll see how well you understand here.',
    byType: 'By question type',
    byLevel: 'By level',
    answeredCount_one: '{{count}} answer',
    answeredCount_other: '{{count}} answers',
    note: 'Only the first attempt at each reading counts; partial answers count as half.',
    type: {
      MULTIPLE_CHOICE: 'Multiple choice',
      TRUE_FALSE: 'True or false',
      COMPLETION: 'Fill in the gaps',
      MATCHING: 'Matching',
      ORDERING: 'Ordering',
      SHORT_ANSWER: 'Short answer',
      VOCABULARY_IN_CONTEXT: 'Vocabulary in context',
      MAIN_IDEA: 'Main idea',
      INFERENCE: 'Inference',
      DETAIL: 'Detail'
    }
  },
  level: {
    title: 'Your level',
    estimated: 'Level {{level}}, estimated',
    UP: 'You understand your level very well. We’ll suggest some readings from the next one.',
    STEADY: 'We’ll keep suggesting readings at your level.',
    DOWN: 'We’ll suggest some slightly easier readings to build confidence.',
    few: 'With more answered questions we can refine the estimate.',
    profile: 'Change level in your profile'
  },
  achievements: {
    title: 'Achievements',
    recent: 'Your latest achievements',
    all: 'All achievements',
    earned: 'Earned on {{date}}',
    progress: '{{value}} of {{threshold}}',
    none: 'Your achievements will show up here as you read.',
    code: {
      FIRST_READING: 'First reading finished',
      READINGS_5: '5 readings finished',
      READINGS_20: '20 readings finished',
      FIRST_HOUR: 'Your first hour of reading',
      TEN_HOURS: '10 hours of reading',
      FIRST_WORD: 'First word saved',
      WORDS_50: '50 words saved',
      FIRST_REVIEW: 'First review',
      REVIEWS_100: '100 reviews',
      FIRST_ASSESSMENT: 'First questions answered',
      DAYS_10: '10 days of reading',
      FIRST_WEEK: 'First week done',
      STREAK_4: '4 weeks in a row'
    }
  },
  week: {
    title: 'Weekly summary',
    open: 'See the weekly summary',
    current: 'This week',
    previous: 'Previous week',
    next: 'Next week',
    days: 'Days',
    minutes: 'Minutes read',
    completed: 'Readings finished',
    wordsRead: 'Words read',
    wordsSaved: 'Words saved',
    wordsReviewed: 'Reviews',
    assessments: 'Quizzes',
    met: 'Week done: {{active}} of {{target}} days.',
    progress: '{{active}} of {{target}} reading days.',
    quiet: 'A quiet week. Every week starts fresh.',
    earned: 'Earned this week',
    caption: 'Minutes read on each day of the week',
    back: 'Back to progress'
  },
  hours: '{{hours}} h {{minutes}} min',
  minutesOnly: '{{minutes}} min'
}

export const progressMessages = { es, en }
