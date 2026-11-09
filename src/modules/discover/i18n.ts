export const DISCOVER_MODULE_ID = 'discover'

const es = {
  home: {
    title: 'Descubrir',
    greeting: {
      morning: 'Buenos días',
      afternoon: 'Buenas tardes',
      evening: 'Buenas noches'
    },
    named: '{{greeting}}, {{name}}',
    lead: 'Hoy toca leer en {{language}}. Tu meta: {{minutes}} minutos, a tu ritmo.',
    featured: 'Destacada',
    continue: 'Sigue donde lo dejaste',
    recommended: 'Para ti',
    recommendedLead: 'Elegidas por tu nivel y lo que te interesa.',
    topics: 'Explora por temas',
    fresh: 'Recién publicadas',
    collections: 'Colecciones',
    readings_one: '{{count}} lectura',
    readings_other: '{{count}} lecturas',
    all: 'Ver todo el catálogo',
    details: 'Ver detalles',
    reason: {
      LEVEL: 'A tu nivel',
      TOPIC: 'De tus temas',
      NEW: 'Nueva'
    },
    empty: 'Aún no hay lecturas en {{language}}',
    emptyBody: 'Pronto llegarán. Mientras, mira lo que hay en otros idiomas.'
  },
  explore: {
    title: 'Catálogo',
    lead: 'Todas las lecturas. Filtra por idioma, nivel, tema y duración.',
    search: 'Buscar lecturas',
    searchPlaceholder: 'Título, tema o idea…',
    language: 'Idioma',
    allLanguages: 'Todos',
    level: 'Nivel',
    topic: 'Tema',
    allTopics: 'Todos los temas',
    duration: 'Duración',
    durations: {
      short: 'Hasta 3 min',
      medium: '4–6 min',
      long: '7 min o más'
    },
    sort: 'Ordenar',
    sorts: {
      RECENT: 'Más recientes',
      POPULAR: 'Más leídas',
      LEVEL: 'Por nivel',
      DURATION: 'Más cortas primero',
      TITLE: 'Por título'
    },
    filters: 'Filtros',
    filtersCount: 'Filtros ({{count}})',
    clear: 'Quitar filtros',
    results_one: '{{count}} lectura',
    results_other: '{{count}} lecturas',
    empty: 'Nada coincide con estos filtros',
    emptyBody: 'Prueba con otro nivel o quita algún filtro.',
    more: 'Mostrar más',
    page: 'Página {{page}} de {{total}}',
    previous: 'Anterior',
    next: 'Siguiente'
  },
  detail: {
    back: 'Volver',
    by: 'En {{language}}',
    words: '{{count}} palabras',
    paragraphs_one: '{{count}} párrafo',
    paragraphs_other: '{{count}} párrafos',
    bookmark: 'Guardar para después',
    bookmarked: 'Guardada',
    related: 'Si te gusta esta, prueba',
    collections: 'En las colecciones',
    progress: 'Llevas el {{percent}} %',
    done: 'Ya la leíste. ¿Otra vez?'
  }
}

const en: typeof es = {
  home: {
    title: 'Discover',
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    },
    named: '{{greeting}}, {{name}}',
    lead: 'Time to read some {{language}}. Your goal: {{minutes}} minutes, at your own pace.',
    featured: 'Featured',
    continue: 'Pick up where you left off',
    recommended: 'For you',
    recommendedLead: 'Chosen for your level and interests.',
    topics: 'Explore by topic',
    fresh: 'Just published',
    collections: 'Collections',
    readings_one: '{{count}} reading',
    readings_other: '{{count}} readings',
    all: 'See the whole catalog',
    details: 'See details',
    reason: {
      LEVEL: 'Your level',
      TOPIC: 'Your topics',
      NEW: 'New'
    },
    empty: 'No readings in {{language}} yet',
    emptyBody: 'They’re on their way. Meanwhile, see what’s available in other languages.'
  },
  explore: {
    title: 'Catalog',
    lead: 'Every reading. Filter by language, level, topic and length.',
    search: 'Search readings',
    searchPlaceholder: 'Title, topic or idea…',
    language: 'Language',
    allLanguages: 'All',
    level: 'Level',
    topic: 'Topic',
    allTopics: 'All topics',
    duration: 'Length',
    durations: {
      short: 'Up to 3 min',
      medium: '4–6 min',
      long: '7 min or more'
    },
    sort: 'Sort',
    sorts: {
      RECENT: 'Newest',
      POPULAR: 'Most read',
      LEVEL: 'By level',
      DURATION: 'Shortest first',
      TITLE: 'By title'
    },
    filters: 'Filters',
    filtersCount: 'Filters ({{count}})',
    clear: 'Clear filters',
    results_one: '{{count}} reading',
    results_other: '{{count}} readings',
    empty: 'Nothing matches these filters',
    emptyBody: 'Try another level or remove a filter.',
    more: 'Show more',
    page: 'Page {{page}} of {{total}}',
    previous: 'Previous',
    next: 'Next'
  },
  detail: {
    back: 'Back',
    by: 'In {{language}}',
    words: '{{count}} words',
    paragraphs_one: '{{count}} paragraph',
    paragraphs_other: '{{count}} paragraphs',
    bookmark: 'Save for later',
    bookmarked: 'Saved',
    related: 'If you like this one, try',
    collections: 'In the collections',
    progress: 'You are {{percent}}% through',
    done: 'You’ve read it. Again?'
  }
}

export const discoverMessages = { es, en }
