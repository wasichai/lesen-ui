export const LIBRARY_MODULE_ID = 'library'

const es = {
  title: 'Mis lecturas',
  lead: 'Lo que empezaste, lo que guardaste para después y lo que ya leíste.',
  search: 'Buscar en mis lecturas',
  tabs: {
    inProgress: 'En curso',
    bookmarked: 'Guardadas',
    completed: 'Leídas'
  },
  empty: {
    inProgress: 'Nada a medias. Elige una lectura nueva cuando quieras.',
    bookmarked: 'Guarda lecturas para después desde su ficha.',
    completed: 'Cuando termines una lectura, aparecerá aquí.',
    search: 'Nada coincide con «{{q}}».'
  },
  discover: 'Descubrir lecturas'
}

const en: typeof es = {
  title: 'My readings',
  lead: 'What you started, what you saved for later and what you’ve read.',
  search: 'Search my readings',
  tabs: {
    inProgress: 'In progress',
    bookmarked: 'Saved',
    completed: 'Read'
  },
  empty: {
    inProgress: 'Nothing half-read. Pick a new reading whenever you like.',
    bookmarked: 'Save readings for later from their page.',
    completed: 'When you finish a reading, it will show up here.',
    search: 'Nothing matches “{{q}}”.'
  },
  discover: 'Discover readings'
}

export const libraryMessages = { es, en }
