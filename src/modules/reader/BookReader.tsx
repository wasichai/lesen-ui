import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { buttonClass } from '../../shared/ui'
import { useMediaQuery } from '../../shared/useMediaQuery'
import { altText, bookViews, swipeStep, firstWordOfView, positionOfView, viewOfSentence, viewOfWord } from './bookModel'
import type { BookPage, ReadingContent } from './contract'
import { READER_MODULE_ID } from './i18n'
import type { ReaderIndex } from './readerModel'
import { ReaderText } from './ReaderText'

type TextProps = Omit<ComponentProps<typeof ReaderText>, 'paragraphs' | 'onMoveTo'>

// el libro ilustrado (ADR-0014 del backend): una vista por página, o dos en escritorio, y el texto de cada página con las
// mismas palabras, traducciones y audio que un texto. Todas las páginas están en el documento; solo se ve la vista actual,
// así el teclado y la voz pueden ir a una palabra de otra página (se pasa de página antes de llegar). Sin animaciones:
// pasar de página es inmediato, también para quien pide movimiento reducido
export function BookReader({
  content,
  pages,
  index,
  accent,
  interfaceLanguage,
  anchor,
  onPosition,
  text,
  after
}: {
  content: ReadingContent
  pages: BookPage[]
  index: ReaderIndex
  accent: string | null
  interfaceLanguage: string
  // una oración a la que ir (la guardada, una nota, la que suena): cambia y el libro pasa a su página
  anchor: { sentence: string; at: number } | null
  onPosition: (sentence: string | null, last: boolean) => void
  text: TextProps
  // lo que va al final del libro (terminar la lectura), solo en la última vista
  after: ReactNode
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  // dos páginas a la vez solo con sitio de verdad para las dos
  const wide = useMediaQuery('(min-width: 1024px)')
  const views = useMemo(() => bookViews(pages, content, wide), [pages, content, wide])
  const [at, setAt] = useState(() => viewOfSentence(views, anchor?.sentence ?? null))
  const position = useRef<string | null>(anchor?.sentence ?? null)
  const current = Math.min(at, views.length - 1)

  // al cambiar de ancho, la misma oración sigue a la vista
  const previousViews = useRef(views)
  useEffect(() => {
    if (previousViews.current === views) return
    previousViews.current = views
    setAt(viewOfSentence(views, position.current))
  }, [views])
  useEffect(() => {
    if (anchor) setAt(viewOfSentence(views, anchor.sentence))
    // solo cuando llega un ancla nueva
  }, [anchor?.sentence, anchor?.at])

  const { currentWord, setCurrentWord } = text
  useEffect(() => {
    position.current = positionOfView(views, current)
    onPosition(position.current, current === views.length - 1)
    // el tabstop del texto queda en la página que se ve
    const view = views[current]
    const first = firstWordOfView(view, index)
    if (first && (!currentWord || !view!.sentences.includes(index.sentenceOfWord.get(currentWord) ?? ''))) setCurrentWord(first)
    // al cambiar de vista
  }, [current, views])

  const section = useRef<HTMLElement>(null)
  // al pasar de página, si el principio del libro quedó por encima, se vuelve a él (sin animación con movimiento reducido)
  const go = useCallback(
    (target: number) => {
      setAt(Math.max(0, Math.min(views.length - 1, target)))
      requestAnimationFrame(() => {
        const top = section.current?.getBoundingClientRect().top ?? 0
        const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (top < 0) section.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
      })
    },
    [views.length]
  )
  // el teclado del texto va a una palabra de otra página: primero se pasa de página, sincrónicamente, para poder enfocarla
  const onMoveTo = useCallback(
    (wordId: string) => {
      const target = viewOfWord(views, index, wordId)
      if (target !== current) flushSync(() => setAt(target))
    },
    [current, index, views]
  )

  // deslizar en pantallas táctiles: a la izquierda, la siguiente
  const touch = useRef<{ x: number; y: number } | null>(null)
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).dataset.token) return
    if (event.key === 'PageDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      go(current + 1)
    } else if (event.key === 'PageUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      go(current - 1)
    }
  }

  const pageNumbers = (view: number) => {
    let first = 1
    for (let i = 0; i < view; i++) first += views[i]!.pages.reduce((n, p) => n + p.span, 0)
    const count = views[view]!.pages.reduce((n, p) => n + p.span, 0)
    return { first, last: first + count - 1 }
  }
  const total = pages.reduce((n, p) => n + p.span, 0)
  const { first, last } = pageNumbers(current)

  return (
    <section ref={section} aria-label={t('book.label')} className="scroll-mt-20 font-sans">
      <div
        onKeyDown={onKeyDown}
        onTouchStart={(event) => (touch.current = { x: event.touches[0]!.clientX, y: event.touches[0]!.clientY })}
        onTouchEnd={(event) => {
          const start = touch.current
          touch.current = null
          if (!start) return
          const dx = event.changedTouches[0]!.clientX - start.x
          const dy = event.changedTouches[0]!.clientY - start.y
          const step = swipeStep(dx, dy)
          if (step !== 0) go(current + step)
        }}
      >
        {views.map((view, i) => (
          <div
            key={view.pages.map((p) => p.id).join('-')}
            hidden={i !== current}
            className={`grid gap-4 ${wide && view.pages.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
            data-book-view={i}
          >
            {view.pages.map((page) => (
              <PageView
                key={page.id}
                page={page}
                wide={wide}
                content={content}
                accent={accent}
                interfaceLanguage={interfaceLanguage}
                text={{ ...text, onMoveTo }}
              />
            ))}
          </div>
        ))}
      </div>

      <nav aria-label={t('book.navigation')} className="mt-6 flex items-center justify-between gap-3">
        <button type="button" className={buttonClass('secondary', 'md')} disabled={current === 0} onClick={() => go(current - 1)}>
          <ChevronLeft aria-hidden className="size-5" />
          {t('book.previous')}
        </button>
        <p className="text-center text-secondary text-ink-muted" aria-live="polite" data-testid="book-page">
          {first === last ? t('book.page', { page: first, total }) : t('book.pages', { first, last, total })}
        </p>
        <button type="button" className={buttonClass('secondary', 'md')} disabled={current === views.length - 1} onClick={() => go(current + 1)}>
          {t('book.next')}
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </nav>
      {current === views.length - 1 && after}
    </section>
  )
}

// una página con su maqueta. El texto usa el tamaño y el interlineado del lector; la ilustración se adapta al hueco
function PageView({
  page,
  wide,
  content,
  accent,
  interfaceLanguage,
  text
}: {
  page: BookPage
  wide: boolean
  content: ReadingContent
  accent: string | null
  interfaceLanguage: string
  text: Omit<ComponentProps<typeof ReaderText>, 'paragraphs'>
}) {
  const paragraphs = content.paragraphs.filter((p) => page.paragraphs.includes(p.id))
  const words = paragraphs.length > 0 ? <ReaderText {...text} paragraphs={paragraphs} /> : null
  const art = (className: string) => <Art page={page} accent={accent} language={interfaceLanguage} className={className} />
  const spread = page.span === 2
  const frame = `relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised ${spread && wide ? 'aspect-[3/2]' : spread ? '' : 'sm:aspect-[3/4]'}`
  const pad = 'p-6 sm:p-8'
  switch (page.layout) {
    case 'IMAGE_TOP':
      return (
        <article data-page={page.id} data-layout={page.layout} className={`${frame} flex flex-col`}>
          {art('aspect-[4/3] w-full shrink-0')}
          <div className={pad}>{words}</div>
        </article>
      )
    case 'IMAGE_BOTTOM':
      return (
        <article data-page={page.id} data-layout={page.layout} className={`${frame} flex flex-col justify-between`}>
          <div className={pad}>{words}</div>
          {art('aspect-[4/3] w-full shrink-0')}
        </article>
      )
    case 'TEXT_OVER_IMAGE':
      // la banda del texto es opaca: el contraste no depende de la ilustración
      return (
        <article data-page={page.id} data-layout={page.layout} className={`${frame} flex min-h-[28rem] flex-col justify-end`}>
          {art('absolute inset-0 size-full')}
          <div className={`relative m-4 rounded-[var(--radius-md)] bg-surface-raised shadow-sm ${pad}`}>{words}</div>
        </article>
      )
    case 'VIGNETTE':
      return (
        <article data-page={page.id} data-layout={page.layout} className={`${frame} ${pad}`}>
          {art('float-right mb-3 ml-4 aspect-square w-2/5 rounded-full')}
          {words}
        </article>
      )
    case 'TEXT_ONLY':
      return (
        <article data-page={page.id} data-layout={page.layout} className={`${frame} flex flex-col justify-center ${pad}`}>
          {words}
        </article>
      )
    case 'IMAGE_ONLY':
      return (
        <article data-page={page.id} data-layout={page.layout} className={`${frame} ${spread && !wide ? 'aspect-[3/2]' : 'aspect-[3/4]'}`}>
          {art('absolute inset-0 size-full')}
          {words}
        </article>
      )
    case 'SPREAD_IMAGE_LEFT':
    case 'SPREAD_IMAGE_RIGHT': {
      const left = page.layout === 'SPREAD_IMAGE_LEFT'
      return (
        <article data-page={page.id} data-layout={page.layout} className={`${frame} grid ${wide ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {art(`${wide ? 'h-full' : 'aspect-[3/4]'} w-full ${left || !wide ? '' : 'order-2'}`)}
          <div className={`flex flex-col justify-center ${pad}`}>{words}</div>
        </article>
      )
    }
    case 'PANORAMA':
      return (
        <article data-page={page.id} data-layout={page.layout} className={`${frame} flex flex-col`}>
          {art('aspect-[12/5] w-full shrink-0')}
          <div className={pad}>{words}</div>
        </article>
      )
  }
}

// la ilustración de la página, o un hueco que dice que falta: nunca una imagen inventada
function Art({ page, accent, language, className }: { page: BookPage; accent: string | null; language: string; className: string }) {
  const { t } = useTranslation(READER_MODULE_ID)
  const illustration = page.illustration
  if (!illustration)
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-surface-muted p-6 text-center text-secondary text-ink-muted ${className}`}
        style={{ borderTop: `6px solid ${accent ?? 'var(--border)'}` }}
      >
        <ImageOff aria-hidden className="size-6" />
        {t('book.illustrationMissing')}
      </div>
    )
  return (
    <div className={`overflow-hidden bg-surface-muted ${className}`} style={{ backgroundColor: accent ?? undefined }}>
      <img
        src={illustration.src}
        alt={altText(illustration.alt, language)}
        lang={language}
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />
    </div>
  )
}
