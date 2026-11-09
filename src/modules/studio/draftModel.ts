import type { Document, DraftParagraph, DraftSentence, Issue, Item, Question, QuestionType, SentenceRef } from './contract'

// la lógica del editor del estudio, sin React: cambios del documento, preguntas nuevas de cada tipo y a qué pestaña lleva
// cada hallazgo de la comprobación

export type Tab = 'details' | 'text' | 'questions' | 'audio' | 'review'
export const TABS: Tab[] = ['details', 'text', 'questions', 'audio', 'review']

// el slug a partir del título: minúsculas, sin acentos, palabras unidas por guiones
export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

// los ids que tendrán las oraciones y los párrafos al publicar (ADR-0004 del backend): por posición
export const paragraphId = (p: number) => `p${p + 1}`
export const sentenceId = (p: number, s: number) => `p${p + 1}s${s + 1}`

// las oraciones para citar en las preguntas: las del documento que se edita (sus ids son por posición) con las palabras
// que el servidor tokenizó al guardar, mientras la oración siga igual; si cambió, sus palabras llegan al guardar
export function localSentences(doc: Document, saved: SentenceRef[]): SentenceRef[] {
  const byId = new Map(saved.map((s) => [s.id, s]))
  return doc.paragraphs.flatMap((paragraph, p) =>
    paragraph.sentences.map((sentence, s) => {
      const id = sentenceId(p, s)
      const text = sentence.text.trim()
      const server = byId.get(id)
      return { id, text, words: server && server.text === text ? server.words : [] }
    })
  )
}

// los idiomas en que se traduce: los de interfaz menos el de la lectura
export const translateInto = (interfaceLanguages: string[], readingLanguage: string) => interfaceLanguages.filter((l) => l !== readingLanguage)

const emptySentence = (): DraftSentence => ({ text: '', translations: {}, senses: {} })
const emptyParagraph = (): DraftParagraph => ({ sentences: [emptySentence()], translations: {} })

const mapParagraph = (doc: Document, p: number, change: (paragraph: DraftParagraph) => DraftParagraph): Document => ({
  ...doc,
  paragraphs: doc.paragraphs.map((paragraph, i) => (i === p ? change(paragraph) : paragraph))
})

export const updateParagraph = (doc: Document, p: number, change: Partial<DraftParagraph>) => mapParagraph(doc, p, (paragraph) => ({ ...paragraph, ...change }))

export const updateSentence = (doc: Document, p: number, s: number, change: Partial<DraftSentence>) =>
  mapParagraph(doc, p, (paragraph) => ({
    ...paragraph,
    sentences: paragraph.sentences.map((sentence, i) => (i === s ? { ...sentence, ...change } : sentence))
  }))

export const addSentence = (doc: Document, p: number, after: number) =>
  mapParagraph(doc, p, (paragraph) => ({
    ...paragraph,
    sentences: [...paragraph.sentences.slice(0, after + 1), emptySentence(), ...paragraph.sentences.slice(after + 1)]
  }))

// quitar la última oración de un párrafo quita el párrafo; el documento conserva siempre uno
export function removeSentence(doc: Document, p: number, s: number): Document {
  const paragraph = doc.paragraphs[p]
  if (!paragraph) return doc
  if (paragraph.sentences.length > 1) return mapParagraph(doc, p, (x) => ({ ...x, sentences: x.sentences.filter((_, i) => i !== s) }))
  return removeParagraph(doc, p)
}

export const addParagraph = (doc: Document, after: number): Document => ({
  ...doc,
  paragraphs: [...doc.paragraphs.slice(0, after + 1), emptyParagraph(), ...doc.paragraphs.slice(after + 1)]
})

export function removeParagraph(doc: Document, p: number): Document {
  const paragraphs = doc.paragraphs.filter((_, i) => i !== p)
  return { ...doc, paragraphs: paragraphs.length ? paragraphs : [emptyParagraph()] }
}

export function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item!)
  return next
}

export const moveParagraph = (doc: Document, p: number, delta: number): Document => ({ ...doc, paragraphs: move(doc.paragraphs, p, delta) })

// el siguiente id libre: q1, q2… para preguntas; a, b, c… para opciones
export function nextQuestionId(questions: Question[]): string {
  const used = new Set(questions.map((q) => q.id))
  let n = questions.length + 1
  while (used.has(`q${n}`)) n++
  return `q${n}`
}

export function nextItemId(items: Item[], style: 'letter' | 'number' = 'letter'): string {
  const used = new Set(items.map((i) => i.id))
  for (let n = 0; n < 200; n++) {
    const id = style === 'number' ? String(n + 1) : n < 26 ? String.fromCharCode(97 + n) : `x${n}`
    if (!used.has(id)) return id
  }
  return `i${items.length + 1}`
}

export const CHOICE_TYPES: QuestionType[] = ['MULTIPLE_CHOICE', 'VOCABULARY_IN_CONTEXT', 'MAIN_IDEA', 'INFERENCE', 'DETAIL']
export const isChoice = (type: QuestionType) => CHOICE_TYPES.includes(type)

// una pregunta nueva del tipo pedido, citando la oración dada si la hay
export function newQuestion(type: QuestionType, questions: Question[], sentence?: SentenceRef): Question {
  const refs = sentence ? [sentence.id] : []
  const option = (id: string): Item => ({ id, text: {} })
  const spec: Record<string, unknown> = isChoice(type)
    ? { options: [option('a'), option('b')], correct: [], ...(type === 'VOCABULARY_IN_CONTEXT' ? { token: sentence?.words[0]?.id ?? '' } : {}) }
    : type === 'TRUE_FALSE'
      ? { correct: true }
      : type === 'COMPLETION'
        ? { sentence: sentence?.id ?? '', blanks: [], bank: [] }
        : type === 'MATCHING'
          ? {
              left: [
                { id: '1', text: '' },
                { id: '2', text: '' }
              ],
              right: [option('a'), option('b')],
              pairs: {}
            }
          : type === 'ORDERING'
            ? { items: [option('a'), option('b')], order: ['a', 'b'] }
            : { model: {}, rubric: {} }
  return { id: nextQuestionId(questions), type, difficulty: 1, prompt: {}, explanation: {}, refs, spec }
}

// lo que se guarda: el orden correcto de una pregunta de ordenar es el de sus elementos en el editor; el banco sin huecos
export function normalizeQuestion(question: Question): Question {
  if (question.type === 'ORDERING') {
    const items = (question.spec.items as Item[] | undefined) ?? []
    return { ...question, spec: { ...question.spec, order: items.map((i) => i.id) } }
  }
  if (question.type === 'COMPLETION') {
    const bank = ((question.spec.bank as string[] | undefined) ?? []).map((b) => b.trim()).filter(Boolean)
    return { ...question, spec: { ...question.spec, bank } }
  }
  return question
}

// la pestaña donde se arregla cada hallazgo
export function issueTab(issue: Issue): Tab {
  switch (issue.code) {
    case 'FIELD':
      return issue.ref === 'paragraphs' || issue.ref?.startsWith('paragraphs[') ? 'text' : 'details'
    case 'TRANSLATION_MISSING':
    case 'UNCHANGED':
      return 'text'
    case 'QUESTION':
    case 'NO_QUESTIONS':
    case 'PROMPT_MISSING':
    case 'EXPLANATION_MISSING':
    case 'QUESTIONS_LOCKED':
      return 'questions'
    case 'AUDIO':
    case 'NO_AUDIO':
    case 'AUDIO_UNALIGNED':
    case 'AUDIO_MULTIWORD':
      return 'audio'
    default:
      return 'review'
  }
}

// los hallazgos agrupados por código, en el orden en que llegan
export function groupIssues(issues: Issue[]): [string, Issue[]][] {
  const groups = new Map<string, Issue[]>()
  for (const issue of issues) groups.set(issue.code, [...(groups.get(issue.code) ?? []), issue])
  return [...groups]
}

// la clave de una entrada nueva del diccionario: idioma y lema en minúsculas (de:garten)
export const entryKey = (language: string, lemma: string) => `${language}:${lemma.trim().toLowerCase()}`

// las formas escritas con comas («Gärten, Gartens») como lista sin repetir
export const splitList = (text: string) => [
  ...new Set(
    text
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
  )
]

// el borrador cambió respecto a lo guardado
export const isDirty = (saved: { document: Document; questions: Question[] }, edited: { document: Document; questions: Question[] }) =>
  JSON.stringify(saved.document) !== JSON.stringify(edited.document) || JSON.stringify(saved.questions) !== JSON.stringify(edited.questions)

// la duración de un audio en el navegador, para mandarla con él (el servidor no decodifica el archivo)
export function audioDuration(file: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      Number.isFinite(audio.duration) && audio.duration > 0 ? resolve(Math.round(audio.duration * 1000)) : reject(new Error('no duration'))
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable audio'))
    }
    audio.src = url
  })
}
