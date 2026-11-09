import { useWasichaiLinks } from '@wasichai/core'
import { ArrowLeft, Bookmark, Maximize2, Minimize2, NotebookText, Type } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useProfile } from '../../shared/api'
import { LevelBadge } from '../../shared/LevelBadge'
import { useBookmark } from '../../shared/mutations'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { Sheet } from '../../shared/Sheet'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useCanHover, useIsWide } from '../../shared/useMediaQuery'
import { useRovingToolbar } from '../../shared/useRovingToolbar'
import { READER_THEMES } from '../../theme/themes'
import { useContent, useProgress, useReadingDetail, useSavedKeys } from './api'
import type { Progress, ReadingContent, Token } from './contract'
import { EndOfReading } from './EndOfReading'
import { READER_MODULE_ID } from './i18n'
import { NotesSheet } from './NotesSheet'
import { indexContent, remainingMinutes } from './readerModel'
import { LEADINGS, useReaderPreferences } from './readerPreferences'
import { ReaderSettings } from './ReaderSettings'
import { ReaderText, type WordEvents } from './ReaderText'
import { useReadingPosition } from './useReadingPosition'
import { WordDetails } from './WordDetails'
import { WordPreview } from './WordPreview'

export function ReaderPage() {
  const slug = useParams().slug ?? ''
  const detail = useReadingDetail(slug)
  const progress = useProgress(slug)
  // la versión que la persona empezó, si sigue existiendo; si no, la vigente (ADR-0003 del backend)
  const version = progress.isPending ? undefined : (progress.data?.version ?? detail.data?.reading.version)
  const content = useContent(slug, detail.data ? version : undefined)
  // una sola fuente de preferencias: el tema del contenedor y la barra del lector leen la misma
  const readerPreferences = useReaderPreferences()
  const theme = READER_THEMES[readerPreferences.preferences.theme]
  const error = detail.error ?? progress.error ?? content.error
  return (
    <div data-theme={theme.id} style={{ colorScheme: theme.colorScheme }} className="min-h-dvh bg-surface text-ink">
      {error ? (
        <ProblemState error={error} onRetry={() => void Promise.all([detail.refetch(), progress.refetch(), content.refetch()])} />
      ) : detail.data && content.data && !progress.isPending ? (
        <Reader slug={slug} reading={detail.data} content={content.data} stored={progress.data ?? null} prefs={readerPreferences} />
      ) : (
        <div className="mx-auto max-w-measure px-5 pt-24">
          <Skeleton className="h-12 w-3/4" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="mt-6 h-28 w-full" />
          ))}
        </div>
      )}
    </div>
  )
}

type Detail = NonNullable<ReturnType<typeof useReadingDetail>['data']>

function Reader({
  slug,
  reading: detail,
  content,
  stored,
  prefs
}: {
  slug: string
  reading: Detail
  content: ReadingContent
  stored: Progress | null
  prefs: ReturnType<typeof useReaderPreferences>
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  const links = useWasichaiLinks()
  const reading = detail.reading
  usePageTitle(reading.title)
  const profile = useProfile()
  const translationLanguage = profile.data?.interfaceLanguage ?? 'en'
  const { preferences, update } = prefs
  const index = useMemo(() => indexContent(content), [content])
  const savedKeys = useSavedKeys(content.language)
  const saved = useMemo(() => new Set(savedKeys.data ?? []), [savedKeys.data])
  const savedAtStart = useRef<number | null>(null)
  if (savedAtStart.current === null && savedKeys.data) savedAtStart.current = savedKeys.data.length
  const article = useRef<HTMLElement>(null)
  const { position, percent, seconds } = useReadingPosition({ slug, version: content.version, index, stored, container: article })
  const bookmark = useBookmark(slug)
  const bookmarked = bookmark.isPending ? (bookmark.variables ?? reading.bookmarked) : reading.bookmarked
  const canHover = useCanHover()
  const wide = useIsWide()
  const [currentWord, setCurrentWord] = useState<string | null>(null)
  const [open, setOpen] = useState<{ token: Token; element: HTMLElement } | null>(null)
  const [preview, setPreview] = useState<{ token: Token; element: HTMLElement } | null>(null)
  const [panel, setPanel] = useState<'settings' | 'notes' | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const toolbar = useRovingToolbar<HTMLDivElement>()

  // al abrir, vuelve a la oración donde la persona lo dejó (una sola vez)
  const restored = useRef(false)
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    if (!preferences.followPosition || !stored?.position || stored.version !== content.version || stored.completed) return
    // la posición se anota con la oración más alta de la franja de lectura (15 % bajo el borde): vuelve a ponerse ahí
    const target = document.getElementById(stored.position)
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.18 })
  }, [content.version, preferences.followPosition, stored])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const cancelHover = useCallback(() => clearTimeout(hoverTimer.current), [])
  const hidePreview = useCallback(() => {
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setPreview(null), 220)
  }, [])
  const events: WordEvents = useMemo(
    () => ({
      onOpen: (token, element) => {
        clearTimeout(hoverTimer.current)
        setPreview(null)
        setCurrentWord(token.id)
        setOpen({ token, element })
      },
      onHoverStart: (token, element) => {
        if (!canHover) return
        clearTimeout(hoverTimer.current)
        hoverTimer.current = setTimeout(() => setPreview({ token, element }), 350)
      },
      onHoverEnd: () => {
        if (canHover) hidePreview()
      }
    }),
    [canHover, hidePreview]
  )
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreview(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.().catch(() => setFullscreen(!fullscreen))
  }
  const remaining = remainingMinutes(reading.minutes, percent)
  const style = { '--reading-size': `${preferences.size}px`, '--reading-leading': LEADINGS[preferences.leading] } as React.CSSProperties
  const savedThisSession = Math.max(0, saved.size - (savedAtStart.current ?? saved.size))

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/92 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-2 sm:px-4">
          <Link to={links.to(ROUTES.reading, { slug })} className={buttonClass('ghost', 'icon')} aria-label={t('toolbar.back')}>
            <ArrowLeft aria-hidden className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-read text-[17px] font-semibold" lang={content.language}>
              {reading.title}
            </p>
            <p className="text-[12.5px] text-ink-muted" aria-live="polite">
              {remaining > 0 ? t('toolbar.remaining', { count: remaining }) : t('toolbar.done')}
            </p>
          </div>
          <div role="toolbar" aria-label={t('toolbar.label')} className="flex items-center gap-0.5" {...toolbar}>
            <button type="button" className={buttonClass('ghost', 'icon')} aria-label={t('toolbar.settings')} onClick={() => setPanel('settings')}>
              <Type aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              className={buttonClass('ghost', 'icon')}
              aria-label={bookmarked ? t('toolbar.bookmarked') : t('toolbar.bookmark')}
              aria-pressed={bookmarked}
              onClick={() => bookmark.mutate(!bookmarked)}
            >
              <Bookmark aria-hidden className={`size-5 ${bookmarked ? 'fill-current text-brand' : ''}`} />
            </button>
            <button type="button" className={buttonClass('ghost', 'icon')} aria-label={t('toolbar.notes')} onClick={() => setPanel('notes')}>
              <NotebookText aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              className={buttonClass('ghost', 'icon', 'hidden sm:inline-flex')}
              aria-label={fullscreen ? t('toolbar.exitFullscreen') : t('toolbar.fullscreen')}
              aria-pressed={fullscreen}
              onClick={toggleFullscreen}
            >
              {fullscreen ? <Minimize2 aria-hidden className="size-5" /> : <Maximize2 aria-hidden className="size-5" />}
            </button>
          </div>
        </div>
        <div
          role="progressbar"
          aria-label={t('toolbar.progress', { percent })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-1 bg-border/60"
        >
          <div className="h-full bg-brand transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      </header>

      <main id="content" className="px-5 pb-40 pt-10 sm:px-8" style={style}>
        <article ref={article} className="mx-auto max-w-measure" aria-labelledby="reading-title">
          <header className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <LevelBadge level={reading.level} />
              {!content.current && <span className="text-secondary text-ink-muted">{t('text.oldVersion', { version: content.version })}</span>}
            </div>
            <h1 id="reading-title" className="font-read text-h1 sm:text-display" lang={content.language}>
              {reading.title}
            </h1>
            {reading.subtitle && (
              <p className="mt-2 font-read text-h3 italic text-ink-muted" lang={content.language}>
                {reading.subtitle}
              </p>
            )}
            <p className="mt-6 rounded-full bg-surface-muted px-4 py-2 text-secondary text-ink-muted">{canHover ? t('text.hintHover') : t('text.hint')}</p>
          </header>
          <ReaderText
            slug={slug}
            version={content.version}
            language={content.language}
            paragraphs={content.paragraphs}
            index={index}
            currentWord={currentWord}
            setCurrentWord={setCurrentWord}
            openWord={open?.token.id ?? preview?.token.id ?? null}
            saved={saved}
            highlightSaved={preferences.highlightSaved}
            activeSentence={open ? (index.sentenceOfWord.get(open.token.id) ?? null) : null}
            showParagraphTranslations={preferences.paragraphTranslations}
            translationLanguage={translationLanguage}
            events={events}
          />
          <EndOfReading
            slug={slug}
            version={content.version}
            reading={reading}
            related={detail.related}
            language={content.language}
            seconds={seconds}
            savedThisSession={savedThisSession}
            alreadyDone={stored?.completed === true && stored.version === content.version}
            atEnd={percent >= 100 || position === index.sentences.at(-1)?.id}
          />
        </article>
      </main>

      {preview && !open && (
        <WordPreview
          anchor={preview.element}
          slug={slug}
          version={content.version}
          tokenRef={preview.token.id}
          word={preview.token.text}
          language={content.language}
          saved={preview.token.entry !== null && saved.has(preview.token.entry)}
          onEnter={cancelHover}
          onLeave={hidePreview}
        />
      )}

      <Sheet
        open={open !== null}
        onOpenChange={(next) => {
          if (!next) {
            const element = open?.element
            setOpen(null)
            requestAnimationFrame(() => element?.focus())
          }
        }}
        title={t('word.title', { word: open?.token.text ?? '' })}
        hideTitle
        side={wide ? 'right' : 'bottom'}
      >
        {open && (
          <div data-theme={READER_THEMES[preferences.theme].id} className="-m-6 bg-surface-raised p-6 pt-12 text-ink">
            <WordDetails
              slug={slug}
              version={content.version}
              tokenRef={open.token.id}
              language={content.language}
              mode="full"
              saved={open.token.entry !== null && saved.has(open.token.entry)}
            />
          </div>
        )}
      </Sheet>

      <Sheet open={panel === 'settings'} onOpenChange={(next) => !next && setPanel(null)} title={t('settings.title')} side={wide ? 'right' : 'bottom'}>
        <ReaderSettings preferences={preferences} update={update} />
      </Sheet>
      <Sheet open={panel === 'notes'} onOpenChange={(next) => !next && setPanel(null)} title={t('notes.title')} side={wide ? 'right' : 'bottom'}>
        <NotesSheet
          slug={slug}
          language={content.language}
          onGo={(sentenceRef) => {
            setPanel(null)
            requestAnimationFrame(() => document.getElementById(sentenceRef)?.scrollIntoView({ block: 'center' }))
          }}
        />
      </Sheet>
    </>
  )
}
