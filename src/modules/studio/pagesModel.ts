import { PAGE_LAYOUTS, type PageLayout } from '../../shared/schemas'
import type { Document, DraftIllustration, DraftPage } from './contract'

// las páginas de un libro ilustrado en el estudio, sin React (ADR-0014 del backend): repartir los párrafos, elegir la
// maqueta del libro y la de cada página, y lo que la comprobación del servidor dirá, para verlo antes de guardar

export const LAYOUTS = Object.keys(PAGE_LAYOUTS) as PageLayout[]

export const isBookDocument = (doc: Document) => doc.format === 'PICTURE_BOOK'

// la maqueta que se verá: la de la página o la del libro
export const effectiveLayout = (doc: Document, page: DraftPage): PageLayout | null => page.layout ?? doc.layout

// las maquetas que caben en un ancho
export const layoutsFor = (span: 1 | 2) => LAYOUTS.filter((layout) => (PAGE_LAYOUTS[layout].spans as readonly number[]).includes(span))

const emptyIllustration = (): DraftIllustration => ({ file: null, alt: {}, scene: null })

// pasar un texto a libro: una página por párrafo, con la maqueta del libro. Volver a texto quita páginas y maqueta
export function toBook(doc: Document, layout: PageLayout = 'IMAGE_TOP'): Document {
  if (isBookDocument(doc)) return doc
  return {
    ...doc,
    format: 'PICTURE_BOOK',
    layout,
    pages: doc.paragraphs.map(() => ({ span: 1, layout: null, paragraphs: 1, illustration: emptyIllustration() }))
  }
}

export const toText = (doc: Document): Document => ({ ...doc, format: 'TEXT', layout: null, pages: [] })

// el primer párrafo (índice) de cada página
export function pageStarts(pages: DraftPage[]): number[] {
  const starts: number[] = []
  let next = 0
  for (const page of pages) {
    starts.push(next)
    next += page.paragraphs
  }
  return starts
}

// la página que lleva un párrafo; uno más allá del reparto cae en la última página con texto
export function pageOfParagraph(pages: DraftPage[], paragraph: number): number {
  const starts = pageStarts(pages)
  const at = pages.findIndex((page, g) => paragraph < starts[g]! + page.paragraphs)
  if (at !== -1) return at
  for (let g = pages.length - 1; g >= 0; g--) if (pages[g]!.paragraphs > 0) return g
  return Math.max(0, pages.length - 1)
}

const mapPage = (doc: Document, g: number, change: (page: DraftPage) => DraftPage): Document => ({
  ...doc,
  pages: doc.pages.map((page, i) => (i === g ? change(page) : page))
})

export const updatePage = (doc: Document, g: number, change: Partial<DraftPage>) => mapPage(doc, g, (page) => ({ ...page, ...change }))

export const updateIllustration = (doc: Document, g: number, change: Partial<DraftIllustration>) =>
  mapPage(doc, g, (page) => ({ ...page, illustration: { ...(page.illustration ?? emptyIllustration()), ...change } }))

// cambiar el ancho de una página: si su maqueta no cabe en el nuevo, vuelve a la del libro (o a una que quepa)
export function setSpan(doc: Document, g: number, span: 1 | 2): Document {
  return mapPage(doc, g, (page) => {
    const layout = page.layout ?? doc.layout
    const fits = layout !== null && (PAGE_LAYOUTS[layout].spans as readonly number[]).includes(span)
    const fallback = doc.layout && (PAGE_LAYOUTS[doc.layout].spans as readonly number[]).includes(span) ? null : (layoutsFor(span)[0] ?? null)
    return { ...page, span, layout: fits ? page.layout : fallback }
  })
}

// partir una página: los primeros `keep` párrafos se quedan y el resto pasa a una página nueva detrás
export function splitPage(doc: Document, g: number, keep: number): Document {
  const page = doc.pages[g]
  if (!page || keep <= 0 || keep >= page.paragraphs) return doc
  const rest: DraftPage = { span: 1, layout: null, paragraphs: page.paragraphs - keep, illustration: emptyIllustration() }
  return { ...doc, pages: [...doc.pages.slice(0, g), { ...page, paragraphs: keep }, rest, ...doc.pages.slice(g + 1)] }
}

// unir una página con la siguiente: sus párrafos pasan a esta, que conserva su maqueta y su ilustración
export function mergeWithNext(doc: Document, g: number): Document {
  const page = doc.pages[g]
  const next = doc.pages[g + 1]
  if (!page || !next) return doc
  return { ...doc, pages: [...doc.pages.slice(0, g), { ...page, paragraphs: page.paragraphs + next.paragraphs }, ...doc.pages.slice(g + 2)] }
}

// una página sin texto (solo ilustración) detrás de otra
export function addImagePage(doc: Document, after: number): Document {
  const page: DraftPage = { span: 1, layout: 'IMAGE_ONLY', paragraphs: 0, illustration: emptyIllustration() }
  return { ...doc, pages: [...doc.pages.slice(0, after + 1), page, ...doc.pages.slice(after + 1)] }
}

// quitar una página: sus párrafos pasan a la anterior (o a la siguiente si es la primera). El libro conserva una
export function removePage(doc: Document, g: number): Document {
  const page = doc.pages[g]
  if (!page || doc.pages.length === 1) return doc
  const target = g === 0 ? 1 : g - 1
  const pages = doc.pages.map((p, i) => (i === target ? { ...p, paragraphs: p.paragraphs + page.paragraphs } : p)).filter((_, i) => i !== g)
  return { ...doc, pages }
}

// el texto cambió de párrafos: la página donde se añadió o quitó uno lo gana o lo pierde, y el reparto sigue cuadrando
export function paragraphAdded(doc: Document, at: number): Document {
  if (!isBookDocument(doc) || doc.pages.length === 0) return doc
  const g = pageOfParagraph(doc.pages, Math.max(0, at - 1))
  return updatePage(doc, g, { paragraphs: doc.pages[g]!.paragraphs + 1 })
}

export function paragraphRemoved(doc: Document, at: number): Document {
  if (!isBookDocument(doc) || doc.pages.length === 0) return doc
  const g = pageOfParagraph(doc.pages, at)
  return updatePage(doc, g, { paragraphs: Math.max(0, doc.pages[g]!.paragraphs - 1) })
}

// lo que la comprobación del servidor dirá de las páginas, para verlo al editar: un código por página (las claves de i18n)
export type PageProblem = 'span' | 'textless' | 'needsText' | 'illustration' | 'alt'

export function pageProblems(doc: Document, page: DraftPage, interfaceLanguages: string[]): PageProblem[] {
  const layout = effectiveLayout(doc, page)
  if (!layout) return []
  const spec = PAGE_LAYOUTS[layout]
  const problems: PageProblem[] = []
  if (!(spec.spans as readonly number[]).includes(page.span)) problems.push('span')
  if (spec.textless && page.paragraphs > 0) problems.push('textless')
  if (!spec.textless && page.paragraphs === 0) problems.push('needsText')
  if (spec.illustrated && !page.illustration?.file) problems.push('illustration')
  if (spec.illustrated && page.illustration?.file && interfaceLanguages.some((l) => !page.illustration?.alt[l]?.trim())) problems.push('alt')
  return problems
}

// cuántos párrafos reparten las páginas frente a los que tiene el texto
export const pagesBalance = (doc: Document) => doc.pages.reduce((n, page) => n + page.paragraphs, 0) - doc.paragraphs.length
