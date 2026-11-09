export const VOCABULARY_MODULE_ID = 'vocabulary'

const es = {
  title: 'Vocabulario',
  lead: 'Las palabras que guardaste, con la oración donde las encontraste.',
  count_one: '{{count}} palabra guardada',
  count_other: '{{count}} palabras guardadas',
  search: 'Buscar en mi vocabulario',
  reviewSoon: 'Pronto podrás repasarlas con repaso espaciado: te preguntaremos cada palabra justo antes de que se te olvide.',
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
  discover: 'Buscar algo para leer',
  more: 'Mostrar más'
}

const en: typeof es = {
  title: 'Vocabulary',
  lead: 'The words you saved, with the sentence where you found them.',
  count_one: '{{count}} saved word',
  count_other: '{{count}} saved words',
  search: 'Search my vocabulary',
  reviewSoon: 'Soon you’ll review them with spaced repetition: we’ll ask about each word just before you’d forget it.',
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
  discover: 'Find something to read',
  more: 'Show more'
}

export const vocabularyMessages = { es, en }
