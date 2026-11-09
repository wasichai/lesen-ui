export const VOCABULARY_MODULE_ID = 'vocabulary'

const es = {
  title: 'Vocabulario',
  lead: 'Las palabras que guardaste, con la oración donde las encontraste.',
  count_one: '{{count}} palabra guardada',
  count_other: '{{count}} palabras guardadas',
  search: 'Buscar en mi vocabulario',
  due: {
    title_one: 'Hoy toca repasar {{count}} palabra',
    title_other: 'Hoy toca repasar {{count}} palabras',
    none: 'Nada que repasar ahora',
    body: 'Cada palabra vuelve justo antes de que se te olvide. Unos minutos bastan.',
    start: 'Repasar ahora',
    today_one: 'Hoy repasaste {{count}} palabra.',
    today_other: 'Hoy repasaste {{count}} palabras.'
  },
  filter: 'Estado',
  all: 'Todas',
  dueOn: 'Próximo repaso: {{date}}',
  dueNow: 'Toca repasarla',
  review: {
    title: 'Repaso',
    progress: '{{current}} de {{total}}',
    stop: 'Terminar por hoy',
    ask: {
      context: '¿Qué significa la palabra marcada?',
      meaning: '¿Qué significa?',
      recall: '¿Cómo se dice?'
    },
    show: 'Mostrar respuesta',
    rate: '¿Cómo te fue?',
    returns: 'Vuelve en',
    rating: {
      AGAIN: 'Otra vez',
      HARD: 'Difícil',
      GOOD: 'Bien',
      EASY: 'Fácil'
    },
    wait: {
      minute_one: '{{count}} min',
      minute_other: '{{count}} min',
      hour_one: '{{count}} h',
      hour_other: '{{count}} h',
      day_one: '{{count}} día',
      day_other: '{{count}} días',
      month_one: '{{count}} mes',
      month_other: '{{count}} meses'
    },
    listen: 'Escuchar la oración',
    done_one: 'Repasaste {{count}} palabra',
    done_other: 'Repasaste {{count}} palabras',
    doneBody: 'Cada una vuelve cuando toca. Las que marcaste «Otra vez» aparecen de nuevo en unos minutos.',
    more: 'Ver si queda alguna',
    back: 'Volver al vocabulario',
    empty: 'Nada que repasar ahora',
    emptyBody: 'Guarda palabras mientras lees y aparecerán aquí.',
    next: 'La próxima palabra vuelve el {{date}}.'
  },
  status: {
    SAVED: 'Guardada',
    LEARNING: 'Aprendiendo',
    FAMILIAR: 'Conocida',
    MASTERED: 'Dominada'
  },
  from: 'De «{{title}}»',
  savedOn: 'Guardada el {{date}}',
  note: 'Nota',
  addNote: 'Añadir nota',
  editNote: 'Editar nota',
  saveNote: 'Guardar nota',
  cancel: 'Cancelar',
  remove: 'Quitar «{{word}}» del vocabulario',
  removed: '«{{word}}» ya no está en tu vocabulario.',
  undo: 'Deshacer',
  openEntry: 'Ver en el diccionario',
  empty: 'Tu vocabulario está vacío',
  emptyBody: 'Mientras lees, toca una palabra y elige «Guardar en mi vocabulario».',
  emptySearch: 'Ninguna palabra coincide con «{{q}}».',
  emptyStatus: 'Ninguna palabra en «{{status}}» por ahora.',
  discover: 'Buscar algo para leer',
  more: 'Mostrar más'
}

const en: typeof es = {
  title: 'Vocabulary',
  lead: 'The words you saved, with the sentence where you found them.',
  count_one: '{{count}} saved word',
  count_other: '{{count}} saved words',
  search: 'Search my vocabulary',
  due: {
    title_one: '{{count}} word to review today',
    title_other: '{{count}} words to review today',
    none: 'Nothing to review right now',
    body: 'Each word comes back just before you’d forget it. A few minutes are enough.',
    start: 'Review now',
    today_one: 'You reviewed {{count}} word today.',
    today_other: 'You reviewed {{count}} words today.'
  },
  filter: 'Status',
  all: 'All',
  dueOn: 'Next review: {{date}}',
  dueNow: 'Due for review',
  review: {
    title: 'Review',
    progress: '{{current}} of {{total}}',
    stop: 'Stop for today',
    ask: {
      context: 'What does the marked word mean?',
      meaning: 'What does it mean?',
      recall: 'How do you say it?'
    },
    show: 'Show answer',
    rate: 'How did it go?',
    returns: 'Comes back in',
    rating: {
      AGAIN: 'Again',
      HARD: 'Hard',
      GOOD: 'Good',
      EASY: 'Easy'
    },
    wait: {
      minute_one: '{{count}} min',
      minute_other: '{{count}} min',
      hour_one: '{{count}} h',
      hour_other: '{{count}} h',
      day_one: '{{count}} day',
      day_other: '{{count}} days',
      month_one: '{{count}} month',
      month_other: '{{count}} months'
    },
    listen: 'Listen to the sentence',
    done_one: 'You reviewed {{count}} word',
    done_other: 'You reviewed {{count}} words',
    doneBody: 'Each one comes back when it’s due. The ones you marked “Again” come back in a few minutes.',
    more: 'Check if any are left',
    back: 'Back to vocabulary',
    empty: 'Nothing to review right now',
    emptyBody: 'Save words while you read and they’ll show up here.',
    next: 'The next word comes back on {{date}}.'
  },
  status: {
    SAVED: 'Saved',
    LEARNING: 'Learning',
    FAMILIAR: 'Familiar',
    MASTERED: 'Mastered'
  },
  from: 'From “{{title}}”',
  savedOn: 'Saved on {{date}}',
  note: 'Note',
  addNote: 'Add note',
  editNote: 'Edit note',
  saveNote: 'Save note',
  cancel: 'Cancel',
  remove: 'Remove “{{word}}” from vocabulary',
  removed: '“{{word}}” is no longer in your vocabulary.',
  undo: 'Undo',
  openEntry: 'See in the dictionary',
  empty: 'Your vocabulary is empty',
  emptyBody: 'While reading, tap a word and choose “Save to my vocabulary”.',
  emptySearch: 'No word matches “{{q}}”.',
  emptyStatus: 'No words in “{{status}}” for now.',
  discover: 'Find something to read',
  more: 'Show more'
}

export const vocabularyMessages = { es, en }
