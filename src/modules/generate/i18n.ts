export const GENERATE_MODULE_ID = 'generate'

const es = {
  title: 'Pide tu lectura',
  lead: 'Una lectura o un libro ilustrado escrito para ti: a tu nivel, con las palabras que estás aprendiendo y sobre lo que quieras. Es solo tuyo.',
  ask: 'Pedir una lectura',
  quota: 'Te quedan {{daily}} para hoy y {{books}} libros ilustrados este mes.',
  resets: 'Vuelve a haber el {{when}}.',
  format: 'Formato',
  formats: { PICTURE_BOOK: 'Libro ilustrado', TEXT: 'Texto' },
  language: 'Idioma',
  level: 'Nivel',
  kind: 'Tipo de texto',
  kinds: { STORY: 'Cuento', ARTICLE: 'Artículo', DIALOGUE: 'Diálogo', LETTER: 'Carta' },
  minutes: 'Largo',
  minutesValue_one: '{{count}} minuto',
  minutesValue_other: '{{count}} minutos',
  prompt: 'Tu idea (opcional)',
  promptHint: 'De qué trata, el tono, quién sale. No pongas datos personales: la lectura es inventada.',
  submit: 'Pedir',
  noQuota: 'No te quedan lecturas por ahora.',
  unavailable: 'Las lecturas a medida no están disponibles en este servidor.',
  error: 'No se pudo pedir. Revisa los datos y vuelve a intentarlo.',
  read: 'Leer ahora',
  mine: 'Mis lecturas a medida',
  status: { QUEUED: 'en cola', WRITING: 'escribiéndose', ILLUSTRATING: 'dibujándose', READY: 'lista', FAILED: 'no salió' }
}

const en: typeof es = {
  title: 'Ask for your reading',
  lead: 'A reading or a picture book written for you: at your level, with the words you are learning and about whatever you like. It is yours only.',
  ask: 'Ask for a reading',
  quota: 'You have {{daily}} left today and {{books}} picture books this month.',
  resets: 'More on {{when}}.',
  format: 'Format',
  formats: { PICTURE_BOOK: 'Picture book', TEXT: 'Text' },
  language: 'Language',
  level: 'Level',
  kind: 'Kind of text',
  kinds: { STORY: 'Story', ARTICLE: 'Article', DIALOGUE: 'Dialogue', LETTER: 'Letter' },
  minutes: 'Length',
  minutesValue_one: '{{count}} minute',
  minutesValue_other: '{{count}} minutes',
  prompt: 'Your idea (optional)',
  promptHint: 'What it is about, the tone, who is in it. Leave out personal details: the reading is fiction.',
  submit: 'Ask',
  noQuota: 'You have no readings left for now.',
  unavailable: 'Custom readings are not available on this server.',
  error: 'It could not be requested. Check the data and try again.',
  read: 'Read now',
  mine: 'My custom readings',
  status: { QUEUED: 'queued', WRITING: 'being written', ILLUSTRATING: 'being drawn', READY: 'ready', FAILED: 'did not work out' }
}

export const generateMessages = { es, en }
