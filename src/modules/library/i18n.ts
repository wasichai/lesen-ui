export const LIBRARY_MODULE_ID = 'library'

const es = {
  title: 'Mis lecturas',
  lead: 'Lo que empezaste, lo que guardaste para después y lo que ya leíste.',
  search: 'Buscar en mis lecturas',
  tabs: {
    inProgress: 'En curso',
    bookmarked: 'Guardadas',
    completed: 'Leídas',
    lists: 'Listas'
  },
  empty: {
    inProgress: 'Nada a medias. Elige una lectura nueva cuando quieras.',
    bookmarked: 'Guarda lecturas para después desde su ficha.',
    completed: 'Cuando termines una lectura, aparecerá aquí.',
    search: 'Nada coincide con «{{q}}».'
  },
  custom: {
    title: 'Mis lecturas a medida',
    ask: 'Pedir una',
    none: 'Todavía no pediste ninguna: escritas para ti, a tu nivel.',
    format: { PICTURE_BOOK: 'Libro ilustrado', TEXT: 'Lectura' }
  },
  discover: 'Descubrir lecturas',
  lists: {
    new: 'Nueva lista',
    placeholder: 'Para el viaje, con mi hija…',
    create: 'Crear lista',
    rename: 'Cambiar el nombre',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Borrar la lista',
    confirm: '¿Borrar «{{name}}»? Las lecturas siguen en el catálogo; solo desaparece la lista.',
    duplicate: 'Ya tienes una lista con ese nombre.',
    error: 'No pudimos guardar la lista. Inténtalo de nuevo.',
    empty: 'Aún no tienes listas',
    emptyBody: 'Agrupa lecturas a tu manera. También puedes añadirlas desde la ficha de cada una.',
    emptyList: 'Esta lista está vacía',
    emptyListBody: 'Añade lecturas desde su ficha con «Añadir a una lista».',
    count_one: '{{count}} lectura',
    count_other: '{{count}} lecturas',
    back: 'Volver a mis listas',
    removeReading: 'Quitar «{{title}}» de la lista'
  }
}

const en: typeof es = {
  title: 'My readings',
  lead: 'What you started, what you saved for later and what you’ve read.',
  search: 'Search my readings',
  tabs: {
    inProgress: 'In progress',
    bookmarked: 'Saved',
    completed: 'Read',
    lists: 'Lists'
  },
  empty: {
    inProgress: 'Nothing half-read. Pick a new reading whenever you like.',
    bookmarked: 'Save readings for later from their page.',
    completed: 'When you finish a reading, it will show up here.',
    search: 'Nothing matches “{{q}}”.'
  },
  custom: {
    title: 'My custom readings',
    ask: 'Ask for one',
    none: 'You have not asked for any yet: written for you, at your level.',
    format: { PICTURE_BOOK: 'Picture book', TEXT: 'Reading' }
  },
  discover: 'Discover readings',
  lists: {
    new: 'New list',
    placeholder: 'For the trip, with my daughter…',
    create: 'Create list',
    rename: 'Rename',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete list',
    confirm: 'Delete “{{name}}”? The readings stay in the catalogue; only the list goes away.',
    duplicate: 'You already have a list with that name.',
    error: "We couldn't save the list. Please try again.",
    empty: 'No lists yet',
    emptyBody: 'Group readings your way. You can also add them from each reading’s page.',
    emptyList: 'This list is empty',
    emptyListBody: 'Add readings from their page with “Add to a list”.',
    count_one: '{{count}} reading',
    count_other: '{{count}} readings',
    back: 'Back to my lists',
    removeReading: 'Remove “{{title}}” from the list'
  }
}

export const libraryMessages = { es, en }
