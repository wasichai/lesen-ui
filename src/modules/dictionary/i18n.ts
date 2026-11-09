export const DICTIONARY_MODULE_ID = 'dictionary'

const es = {
  title: 'Diccionario',
  lead: 'Busca en {{language}} o en {{ui}}: «Leuchtturm» o «faro».',
  search: 'Buscar una palabra',
  searchButton: 'Buscar',
  suggestions: 'Sugerencias',
  results_one: '{{count}} resultado',
  results_other: '{{count}} resultados',
  none: 'No encontramos «{{q}}».',
  noneBody: 'El diccionario crece con cada lectura. Prueba con otra forma de la palabra.',
  history: 'Búsquedas recientes',
  clearHistory: 'Borrar historial',
  favorites: 'Favoritas',
  noFavorites: 'Marca palabras con la estrella para tenerlas a mano.',
  matched: {
    LEMMA: '',
    FORM: 'forma',
    TRANSLATION: 'por traducción',
    FAVORITE: ''
  },
  entry: {
    back: 'Volver al diccionario',
    favorite: 'Añadir a favoritas',
    unfavorite: 'Quitar de favoritas',
    save: 'Guardar en mi vocabulario',
    saved: 'En tu vocabulario',
    meaning: 'Acepción {{n}}',
    translations: 'Traducciones',
    definition: 'Definición',
    examples: 'Ejemplos',
    synonyms: 'Sinónimos',
    antonyms: 'Antónimos',
    related: 'Relacionadas',
    note: 'Uso',
    forms: 'Formas',
    grammar: 'Gramática',
    readings: 'Aparece en',
    occurrences_one: '{{count}} vez',
    occurrences_other: '{{count}} veces',
    read: 'Leer'
  }
}

const en: typeof es = {
  title: 'Dictionary',
  lead: 'Search in {{language}} or in {{ui}}: “Leuchtturm” or “lighthouse”.',
  search: 'Search for a word',
  searchButton: 'Search',
  suggestions: 'Suggestions',
  results_one: '{{count}} result',
  results_other: '{{count}} results',
  none: "We didn't find “{{q}}”.",
  noneBody: 'The dictionary grows with every reading. Try another form of the word.',
  history: 'Recent searches',
  clearHistory: 'Clear history',
  favorites: 'Favorites',
  noFavorites: 'Star words to keep them handy.',
  matched: {
    LEMMA: '',
    FORM: 'form',
    TRANSLATION: 'by translation',
    FAVORITE: ''
  },
  entry: {
    back: 'Back to the dictionary',
    favorite: 'Add to favorites',
    unfavorite: 'Remove from favorites',
    save: 'Save to my vocabulary',
    saved: 'In your vocabulary',
    meaning: 'Sense {{n}}',
    translations: 'Translations',
    definition: 'Definition',
    examples: 'Examples',
    synonyms: 'Synonyms',
    antonyms: 'Antonyms',
    related: 'Related',
    note: 'Usage',
    forms: 'Forms',
    grammar: 'Grammar',
    readings: 'Appears in',
    occurrences_one: '{{count}} time',
    occurrences_other: '{{count}} times',
    read: 'Read'
  }
}

export const dictionaryMessages = { es, en }
