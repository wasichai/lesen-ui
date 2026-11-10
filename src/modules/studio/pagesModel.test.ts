import { describe, expect, it } from 'vitest'
import type { Document } from './contract'
import { addParagraph, issueTab, removeParagraph, tabsFor } from './draftModel'
import {
  addImagePage,
  effectiveLayout,
  layoutsFor,
  mergeWithNext,
  pageOfParagraph,
  pageProblems,
  pagesBalance,
  removePage,
  setSpan,
  splitPage,
  toBook,
  toText,
  updateIllustration,
  updatePage
} from './pagesModel'

const text = (n: number): Document => ({
  slug: 'x',
  language: 'de',
  level: 'A1',
  topics: [],
  featured: false,
  title: 'T',
  summary: 'S',
  paragraphs: Array.from({ length: n }, (_, i) => ({ sentences: [{ text: `Satz ${i + 1}.`, translations: {}, senses: {} }], translations: {} })),
  format: 'TEXT',
  layout: null,
  pages: []
})
const counts = (d: Document) => d.pages.map((p) => p.paragraphs)

describe('las páginas de un libro en el estudio', () => {
  it('un texto pasa a libro con una página por párrafo, y vuelve a texto sin páginas', () => {
    const book = toBook(text(3))
    expect(book.format).toBe('PICTURE_BOOK')
    expect(book.layout).toBe('IMAGE_TOP')
    expect(counts(book)).toEqual([1, 1, 1])
    expect(tabsFor(book)).toContain('pages')
    expect(tabsFor(text(1))).not.toContain('pages')
    const back = toText(book)
    expect(back.pages).toEqual([])
    expect(back.layout).toBeNull()
  })

  it('parte, une, añade y quita páginas sin perder párrafos', () => {
    let d = toBook(text(3))
    d = mergeWithNext(d, 0)
    expect(counts(d)).toEqual([2, 1])
    d = splitPage(d, 0, 1)
    expect(counts(d)).toEqual([1, 1, 1])
    d = addImagePage(d, 0)
    expect(counts(d)).toEqual([1, 0, 1, 1])
    expect(d.pages[1]!.layout).toBe('IMAGE_ONLY')
    d = removePage(d, 2)
    expect(counts(d)).toEqual([1, 1, 1])
    expect(pagesBalance(d)).toBe(0)
    expect(splitPage(d, 0, 1)).toBe(d)
  })

  it('añadir o quitar un párrafo en el texto ajusta su página', () => {
    let d = mergeWithNext(toBook(text(3)), 0)
    d = addParagraph(d, 0)
    expect(counts(d)).toEqual([3, 1])
    d = removeParagraph(d, 3)
    expect(counts(d)).toEqual([3, 0])
    expect(pagesBalance(d)).toBe(0)
    expect(pageOfParagraph(d.pages, 2)).toBe(0)
    expect(pageOfParagraph(d.pages, 9)).toBe(0)
  })

  it('la maqueta de una página es la suya o la del libro, y un ancho nuevo la ajusta', () => {
    let d = toBook(text(2))
    expect(effectiveLayout(d, d.pages[0]!)).toBe('IMAGE_TOP')
    d = setSpan(d, 0, 2)
    expect(d.pages[0]!.span).toBe(2)
    expect(layoutsFor(2)).toContain(d.pages[0]!.layout)
    d = updatePage(d, 1, { layout: 'TEXT_ONLY' })
    d = setSpan(d, 1, 1)
    expect(d.pages[1]!.layout).toBe('TEXT_ONLY')
  })

  it('dice antes de guardar lo que la comprobación pedirá', () => {
    let d = toBook(text(1))
    expect(pageProblems(d, d.pages[0]!, ['es', 'en'])).toEqual(['illustration'])
    d = updateIllustration(d, 0, { file: 'bild.png', alt: { es: 'Una imagen' } })
    expect(pageProblems(d, d.pages[0]!, ['es', 'en'])).toEqual(['alt'])
    d = updatePage(d, 0, { layout: 'IMAGE_ONLY' })
    expect(pageProblems(d, d.pages[0]!, ['es'])).toEqual(['textless'])
    d = updatePage(d, 0, { layout: 'PANORAMA' })
    expect(pageProblems(d, d.pages[0]!, ['es'])).toEqual(['span'])
    expect(issueTab({ code: 'ILLUSTRATION_MISSING', ref: 'g1', detail: null })).toBe('pages')
    expect(issueTab({ code: 'FIELD', ref: 'pages[0].layout', detail: 'x' })).toBe('pages')
  })
})
