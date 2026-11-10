import { describe, expect, it } from 'vitest'
import { altText, bookViews, swipeStep, firstWordOfView, isBook, positionOfView, viewOfSentence, viewOfWord } from './bookModel'
import type { BookPage, ReadingContent } from './contract'
import { content as CONTENT } from './test/fixtures'
import { indexContent } from './readerModel'

const page = (id: string, span: 1 | 2, paragraphs: string[], layout: BookPage['layout'] = 'IMAGE_TOP'): BookPage => ({
  id,
  span,
  layout,
  paragraphs,
  illustration: { src: `/api/lesen/public/illustrations/${id}.png`, alt: { es: `Imagen ${id}`, en: `Picture ${id}` } }
})

// tres párrafos: p1 (dos oraciones), p2 y p3
const BOOK: ReadingContent = {
  ...CONTENT,
  paragraphs: [
    ...CONTENT.paragraphs,
    { id: 'p3', sentences: [{ id: 'p3s1', tokens: [{ id: 'p3s1t1', text: 'Tschüss', kind: 'WORD', space: false, entry: null }] }] }
  ],
  format: 'PICTURE_BOOK',
  layout: 'IMAGE_TOP',
  pages: [page('g1', 1, ['p1']), page('g2', 1, ['p2']), page('g3', 2, [], 'IMAGE_ONLY'), page('g4', 1, ['p3'])]
}

describe('modelo del libro ilustrado', () => {
  const index = indexContent(BOOK)
  const pages = BOOK.pages!

  it('un libro es el que tiene páginas; un texto no', () => {
    expect(isBook(BOOK)).toBe(true)
    expect(isBook(CONTENT)).toBe(false)
    expect(isBook({ ...BOOK, pages: [] })).toBe(false)
  })

  it('en escritorio junta dos páginas sueltas; la doble página va sola, y en el móvil una por vista', () => {
    const wide = bookViews(pages, BOOK, true)
    expect(wide.map((v) => v.pages.map((p) => p.id))).toEqual([['g1', 'g2'], ['g3'], ['g4']])
    expect(wide[0]!.sentences).toEqual(['p1s1', 'p1s2', 'p2s1'])
    expect(wide[1]!.sentences).toEqual([])
    const narrow = bookViews(pages, BOOK, false)
    expect(narrow.map((v) => v.pages.map((p) => p.id))).toEqual([['g1'], ['g2'], ['g3'], ['g4']])
  })

  it('encuentra la vista de una oración o de una palabra, y la primera palabra de cada vista', () => {
    const views = bookViews(pages, BOOK, false)
    expect(viewOfSentence(views, 'p2s1')).toBe(1)
    expect(viewOfSentence(views, null)).toBe(0)
    expect(viewOfSentence(views, 'nada')).toBe(0)
    expect(viewOfWord(views, index, 'p3s1t1')).toBe(3)
    expect(firstWordOfView(views[0], index)).toBe('p1s1t1')
    expect(firstWordOfView(views[2], index)).toBeNull()
  })

  it('la posición de una página sin texto es la última oración leída, nunca hacia atrás', () => {
    const views = bookViews(pages, BOOK, false)
    expect(positionOfView(views, 0)).toBe('p1s1')
    expect(positionOfView(views, 2)).toBe('p2s1')
    expect(positionOfView(views, 3)).toBe('p3s1')
  })

  it('el texto alternativo sale en el idioma de la interfaz, con respaldo', () => {
    expect(altText({ es: 'Hola', en: 'Hi' }, 'es')).toBe('Hola')
    expect(altText({ en: 'Hi' }, 'de')).toBe('Hi')
    expect(altText({}, 'es')).toBe('')
  })

  it('solo un gesto claramente horizontal pasa de página', () => {
    expect(swipeStep(-120, 10)).toBe(1)
    expect(swipeStep(120, 10)).toBe(-1)
    expect(swipeStep(40, 0)).toBe(0)
    expect(swipeStep(-100, 90)).toBe(0)
  })
})
