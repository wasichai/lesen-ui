import type { BookPage, ReadingContent } from './contract'
import type { ReaderIndex } from './readerModel'

// el libro ilustrado sin React (ADR-0014 del backend): qué páginas se ven juntas y dónde cae cada oración

// lo que se ve a la vez: una página, o dos en escritorio (una doble página, o dos páginas sueltas seguidas)
export interface BookView {
  pages: BookPage[]
  // las oraciones de la vista, en orden
  sentences: string[]
}

export function isBook(content: ReadingContent): content is ReadingContent & { pages: BookPage[] } {
  return content.format === 'PICTURE_BOOK' && content.pages !== null && content.pages.length > 0
}

// en escritorio, dos páginas sueltas seguidas forman una vista; una doble página va sola. En el móvil, una página por vista
// (la doble página se apila: ilustración y texto, una mitad tras otra)
export function bookViews(pages: BookPage[], content: ReadingContent, wide: boolean): BookView[] {
  const sentencesOf = new Map(content.paragraphs.map((p) => [p.id, p.sentences.map((s) => s.id)]))
  const groups: BookPage[][] = []
  for (const page of pages) {
    const last = groups.at(-1)
    if (wide && page.span === 1 && last && last.length === 1 && last[0]!.span === 1) last.push(page)
    else groups.push([page])
  }
  return groups.map((group) => ({ pages: group, sentences: group.flatMap((page) => page.paragraphs.flatMap((id) => sentencesOf.get(id) ?? [])) }))
}

// la vista donde está una oración; sin ella (o sin oración), la primera
export function viewOfSentence(views: BookView[], sentenceId: string | null): number {
  if (!sentenceId) return 0
  const at = views.findIndex((view) => view.sentences.includes(sentenceId))
  return at === -1 ? 0 : at
}

export function viewOfWord(views: BookView[], index: ReaderIndex, wordId: string): number {
  return viewOfSentence(views, index.sentenceOfWord.get(wordId) ?? null)
}

// la primera palabra de una vista: donde entra el foco del teclado al pasar de página. Una vista sin texto no tiene
export function firstWordOfView(view: BookView | undefined, index: ReaderIndex): string | null {
  for (const id of view?.sentences ?? []) {
    const at = index.sentenceAt.get(id)
    const word = at === undefined ? undefined : index.sentences[at]!.tokens.find((token) => token.kind === 'WORD')
    if (word) return word.id
  }
  return null
}

// la posición de una vista: su primera oración, o la última de las vistas anteriores si es una página sin texto (una
// pausa no hace retroceder la posición)
export function positionOfView(views: BookView[], at: number): string | null {
  for (let i = Math.min(at, views.length - 1); i >= 0; i--) {
    const sentences = views[i]!.sentences
    if (sentences.length > 0) return i === at ? sentences[0]! : sentences.at(-1)!
  }
  return null
}

// el texto alternativo en el idioma de la interfaz; si falta, en inglés o el primero que haya. Sin ninguno, vacío: la
// ilustración es entonces decorativa y el texto de la página lo cuenta
export function altText(alt: Record<string, string>, language: string): string {
  return alt[language] ?? alt.en ?? Object.values(alt)[0] ?? ''
}

// deslizar en una pantalla táctil: un gesto claramente horizontal pasa de página (a la izquierda, la siguiente)
export function swipeStep(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) <= 60 || Math.abs(dx) <= Math.abs(dy) * 1.5) return 0
  return dx < 0 ? 1 : -1
}
