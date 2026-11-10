// los textos compartidos de Lesen (espacio de nombres «app»): el marco, los niveles, los objetivos, las clases de palabra y
// los estados comunes. Cada módulo tiene además los suyos
export const APP_NAMESPACE = 'app'

const es = {
  commission: {
    progress: 'Avance del encargo',
    status: {
      QUEUED: 'En cola',
      WRITING: 'Escribiendo el texto',
      ILLUSTRATING: 'Dibujando las ilustraciones',
      READY: 'Listo',
      FAILED: 'No salió'
    },
    reason: {
      REFUSED: 'El modelo no quiso escribir esta petición. Prueba con otra idea.',
      UNREADABLE: 'La respuesta no se pudo leer, ni después de corregirla.',
      CHECKS: 'El texto no pasó las comprobaciones de nivel, largo o vocabulario, ni después de corregirlo.',
      ERROR: 'Algo falló en el servidor. Vuelve a intentarlo más tarde.',
      other: 'No se pudo terminar ({{reason}}).'
    },
    directedBy: {
      agent: 'Arte dirigido con Claude, revisado página a página',
      generation: 'Arte a partir de la biblia visual del texto',
      redraw: 'Página dibujada de nuevo'
    },
    illustrations_one: '{{count}} ilustración dibujada',
    illustrations_other: '{{count}} ilustraciones dibujadas'
  },
  nav: {
    label: 'Navegación principal',
    discover: 'Descubrir',
    library: 'Mis lecturas',
    vocabulary: 'Vocabulario',
    dictionary: 'Diccionario',
    progress: 'Progreso',
    profile: 'Perfil',
    // la barra de pestañas del móvil: seis secciones en 360 px, con nombres cortos
    tab: {
      discover: 'Descubrir',
      library: 'Lecturas',
      vocabulary: 'Palabras',
      dictionary: 'Diccionario',
      progress: 'Progreso',
      profile: 'Perfil'
    },
    skip: 'Saltar al contenido',
    signOut: 'Cerrar sesión',
    studio: 'Estudio'
  },
  studio: {
    label: 'Estudio',
    nav: 'Estudio editorial',
    drafts: 'Lecturas y borradores',
    toReader: 'Ir a leer',
    forbidden: 'El estudio es para el equipo editorial',
    forbiddenBody: 'Tu cuenta no tiene permiso para escribir ni publicar lecturas. Si debería tenerlo, pídeselo a quien administra.'
  },
  level: {
    A1: 'Inicial',
    A2: 'Básico',
    B1: 'Intermedio',
    B2: 'Intermedio alto',
    C1: 'Avanzado',
    C2: 'Maestría',
    canDo: {
      A1: 'Entiendo frases muy simples y palabras conocidas.',
      A2: 'Sigo textos breves sobre temas cotidianos.',
      B1: 'Leo historias y artículos sencillos sin perderme.',
      B2: 'Leo artículos con opiniones y matices.',
      C1: 'Leo textos largos y complejos con soltura.',
      C2: 'Leo casi cualquier cosa como en mi idioma.'
    }
  },
  goal: {
    TRAVEL: 'Viajar',
    WORK: 'Trabajo',
    STUDY: 'Estudios',
    CULTURE: 'Cultura',
    FAMILY: 'Familia y amistades',
    FUN: 'Por gusto',
    EXAM: 'Un examen'
  },
  difficulty: {
    COMFORTABLE: 'Cómoda',
    BALANCED: 'Equilibrada',
    CHALLENGING: 'Retadora',
    hint: {
      COMFORTABLE: 'Lecturas de tu nivel y un poco más fáciles.',
      BALANCED: 'Lecturas de tu nivel.',
      CHALLENGING: 'Lecturas de tu nivel y un poco más difíciles.'
    }
  },
  pos: {
    noun: 'sustantivo',
    verb: 'verbo',
    adjective: 'adjetivo',
    adverb: 'adverbio',
    pronoun: 'pronombre',
    article: 'artículo',
    preposition: 'preposición',
    conjunction: 'conjunción',
    numeral: 'numeral',
    interjection: 'interjección',
    particle: 'partícula',
    determiner: 'determinante',
    'proper-noun': 'nombre propio',
    phrase: 'expresión',
    contraction: 'contracción'
  },
  grammar: {
    gender: 'Género',
    plural: 'Plural',
    past: 'Pasado',
    participle: 'Participio',
    auxiliary: 'Auxiliar',
    separable: 'Separable',
    comparative: 'Comparativo',
    superlative: 'Superlativo',
    case: 'Caso',
    yes: 'sí',
    no: 'no',
    m: 'masculino',
    f: 'femenino',
    n: 'neutro'
  },
  language: {
    es: 'español',
    en: 'inglés',
    de: 'alemán'
  },
  reading: {
    minutes_one: '{{count}} min',
    minutes_other: '{{count}} min',
    words: '{{count}} palabras',
    level: 'Nivel {{level}}',
    progress: '{{percent}} % leído',
    completed: 'Leída',
    continue: 'Seguir leyendo',
    start: 'Empezar a leer',
    reread: 'Volver a leer',
    bookmarked: 'Guardada para después',
    noCover: 'Sin portada',
    pictureBook: 'Libro ilustrado'
  },
  export: {
    open: 'Exportar',
    title: 'Exportar la lectura',
    body: 'Llévatela a otra app de lectura: un ePub para Apple Books, Kindle y otros lectores, o una página para imprimir o guardar como PDF.',
    include: 'Incluir',
    always: 'El texto y la portada van siempre.',
    part: { translations: 'Traducciones', glossary: 'Glosario', notes: 'Mis notas' },
    partHint: {
      translations: 'Bajo cada párrafo, en tu idioma. Si falta alguna, se dice.',
      glossary: 'Las palabras del texto que están en el diccionario.',
      notes: 'Las oraciones que guardaste, con tus notas.'
    },
    epub: 'Descargar ePub',
    print: 'Imprimir o guardar como PDF',
    apps: 'Apple Books abre el ePub directamente. Para Kindle, envíalo con «Send to Kindle».',
    busy: 'Preparando el archivo…',
    downloaded: 'Listo: el ePub está en tus descargas.',
    printed: 'Listo: elige «Guardar como PDF» en el diálogo de impresión.',
    forbidden: 'Tu cuenta no puede incluir notas. Quita «Mis notas» y vuelve a intentarlo.',
    failed: 'No pudimos preparar el archivo. Revisa tu conexión y vuelve a intentarlo.'
  },
  state: {
    loading: 'Cargando…',
    retry: 'Reintentar',
    error: 'Algo no salió bien',
    errorBody: 'No pudimos cargar esto. Revisa tu conexión y vuelve a intentarlo.',
    notFound: 'No lo encontramos',
    notFoundBody: 'Puede que ya no exista o que el enlace esté incompleto.',
    contract: 'Esta versión de la app no entiende la respuesta del servidor. Recarga la página.'
  },
  action: {
    close: 'Cerrar',
    back: 'Volver',
    save: 'Guardar',
    cancel: 'Cancelar',
    remove: 'Quitar'
  }
}

const en: typeof es = {
  commission: {
    progress: 'Progress of the request',
    status: {
      QUEUED: 'Queued',
      WRITING: 'Writing the text',
      ILLUSTRATING: 'Drawing the illustrations',
      READY: 'Ready',
      FAILED: 'It did not work out'
    },
    reason: {
      REFUSED: 'The model declined to write this request. Try another idea.',
      UNREADABLE: 'The answer could not be read, not even after correcting it.',
      CHECKS: 'The text did not pass the level, length or vocabulary checks, not even after correcting it.',
      ERROR: 'Something failed on the server. Try again later.',
      other: 'It could not be finished ({{reason}}).'
    },
    directedBy: {
      agent: 'Art directed with Claude, reviewed page by page',
      generation: 'Art from the text’s visual bible',
      redraw: 'Page drawn again'
    },
    illustrations_one: '{{count}} illustration drawn',
    illustrations_other: '{{count}} illustrations drawn'
  },
  nav: {
    label: 'Main navigation',
    discover: 'Discover',
    library: 'My readings',
    vocabulary: 'Vocabulary',
    dictionary: 'Dictionary',
    progress: 'Progress',
    profile: 'Profile',
    tab: {
      discover: 'Discover',
      library: 'Readings',
      vocabulary: 'Words',
      dictionary: 'Dictionary',
      progress: 'Progress',
      profile: 'Profile'
    },
    skip: 'Skip to content',
    signOut: 'Sign out',
    studio: 'Studio'
  },
  studio: {
    label: 'Studio',
    nav: 'Editorial studio',
    drafts: 'Readings and drafts',
    toReader: 'Go read',
    forbidden: 'The studio is for the editorial team',
    forbiddenBody: 'Your account cannot write or publish readings. If it should, ask whoever runs the platform.'
  },
  level: {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper intermediate',
    C1: 'Advanced',
    C2: 'Proficient',
    canDo: {
      A1: 'I understand very simple sentences and familiar words.',
      A2: 'I can follow short texts about everyday topics.',
      B1: 'I read simple stories and articles without getting lost.',
      B2: 'I read articles with opinions and nuance.',
      C1: 'I read long, complex texts with ease.',
      C2: 'I read almost anything as in my own language.'
    }
  },
  goal: {
    TRAVEL: 'Travel',
    WORK: 'Work',
    STUDY: 'Studies',
    CULTURE: 'Culture',
    FAMILY: 'Family and friends',
    FUN: 'Just for fun',
    EXAM: 'An exam'
  },
  difficulty: {
    COMFORTABLE: 'Comfortable',
    BALANCED: 'Balanced',
    CHALLENGING: 'Challenging',
    hint: {
      COMFORTABLE: 'Readings at your level and a little easier.',
      BALANCED: 'Readings at your level.',
      CHALLENGING: 'Readings at your level and a little harder.'
    }
  },
  pos: {
    noun: 'noun',
    verb: 'verb',
    adjective: 'adjective',
    adverb: 'adverb',
    pronoun: 'pronoun',
    article: 'article',
    preposition: 'preposition',
    conjunction: 'conjunction',
    numeral: 'numeral',
    interjection: 'interjection',
    particle: 'particle',
    determiner: 'determiner',
    'proper-noun': 'proper noun',
    phrase: 'phrase',
    contraction: 'contraction'
  },
  grammar: {
    gender: 'Gender',
    plural: 'Plural',
    past: 'Past',
    participle: 'Participle',
    auxiliary: 'Auxiliary',
    separable: 'Separable',
    comparative: 'Comparative',
    superlative: 'Superlative',
    case: 'Case',
    yes: 'yes',
    no: 'no',
    m: 'masculine',
    f: 'feminine',
    n: 'neuter'
  },
  language: {
    es: 'Spanish',
    en: 'English',
    de: 'German'
  },
  reading: {
    minutes_one: '{{count}} min',
    minutes_other: '{{count}} min',
    words: '{{count}} words',
    level: 'Level {{level}}',
    progress: '{{percent}}% read',
    completed: 'Read',
    continue: 'Continue reading',
    start: 'Start reading',
    reread: 'Read again',
    bookmarked: 'Saved for later',
    noCover: 'No cover',
    pictureBook: 'Picture book'
  },
  export: {
    open: 'Export',
    title: 'Export the reading',
    body: 'Take it to another reading app: an ePub for Apple Books, Kindle and other readers, or a page to print or save as PDF.',
    include: 'Include',
    always: 'The text and the cover are always included.',
    part: { translations: 'Translations', glossary: 'Glossary', notes: 'My notes' },
    partHint: {
      translations: 'Below each paragraph, in your language. If one is missing, it says so.',
      glossary: 'The words of the text that are in the dictionary.',
      notes: 'The sentences you saved, with your notes.'
    },
    epub: 'Download ePub',
    print: 'Print or save as PDF',
    apps: 'Apple Books opens the ePub directly. For Kindle, send it with “Send to Kindle”.',
    busy: 'Preparing the file…',
    downloaded: 'Done: the ePub is in your downloads.',
    printed: 'Done: choose “Save as PDF” in the print dialog.',
    forbidden: 'Your account cannot include notes. Untick “My notes” and try again.',
    failed: 'We could not prepare the file. Check your connection and try again.'
  },
  state: {
    loading: 'Loading…',
    retry: 'Try again',
    error: 'Something went wrong',
    errorBody: "We couldn't load this. Check your connection and try again.",
    notFound: "We couldn't find it",
    notFoundBody: 'It may no longer exist, or the link may be incomplete.',
    contract: "This version of the app doesn't understand the server's answer. Reload the page."
  },
  action: {
    close: 'Close',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    remove: 'Remove'
  }
}

export const appMessages = { es, en }

// el valor de un rasgo gramatical en palabras: sí/no, y m/f/n como género
export function grammarValue(value: unknown, t: (key: string) => string): string {
  if (typeof value === 'boolean') return value ? t('grammar.yes') : t('grammar.no')
  if (value === 'm' || value === 'f' || value === 'n') return t(`grammar.${value}`)
  return String(value)
}
