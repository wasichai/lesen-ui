import { Headphones, Languages } from 'lucide-react'
import { memo, useCallback, useEffect, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useTranslations } from './api'
import type { Block, Paragraph, Token } from './contract'
import { InlineFigure } from './InlineFigure'
import { readingOrder } from './readerModel'
import { READER_MODULE_ID } from './i18n'
import { neighbourSentenceWord, neighbourWord, type ReaderIndex } from './readerModel'

export interface WordEvents {
  onOpen: (token: Token, element: HTMLElement) => void
  onHoverStart: (token: Token, element: HTMLElement) => void
  onHoverEnd: () => void
}

// el texto: párrafos, oraciones y una palabra por botón. Un solo tabstop para todo el texto (la palabra «actual») y las
// flechas para moverse: ←/→ por palabras, ↑/↓ por oraciones, Inicio/Fin al principio o al final. Intro o Espacio abren
export function ReaderText({
  slug,
  version,
  language,
  paragraphs,
  index,
  currentWord,
  setCurrentWord,
  openWord,
  saved,
  highlightSaved,
  newWords,
  learnedWords,
  activeSentence,
  showParagraphTranslations,
  translationLanguage,
  events,
  onListenParagraph,
  onMoveTo,
  blocks
}: {
  slug: string
  version: number
  language: string
  paragraphs: Paragraph[]
  index: ReaderIndex
  currentWord: string | null
  setCurrentWord: (id: string) => void
  openWord: string | null
  saved: Set<string>
  highlightSaved: boolean
  newWords: Set<string> | null
  learnedWords: Set<string> | null
  activeSentence: string | null
  showParagraphTranslations: boolean
  translationLanguage: string
  events: WordEvents
  // con audio: escuchar solo ese párrafo
  onListenParagraph?: (paragraphId: string) => void
  // en un libro: antes de enfocar una palabra de otra página, pasar a esa página
  onMoveTo?: (wordId: string) => void
  // el orden de lectura con las imágenes entre párrafos (ADR-0018 del backend); sin él, los párrafos en orden
  blocks?: Block[] | null
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  const focusWord = useCallback(
    (id: string) => {
      onMoveTo?.(id)
      setCurrentWord(id)
      document.querySelector<HTMLElement>(`[data-token="${CSS.escape(id)}"]`)?.focus()
    },
    [onMoveTo, setCurrentWord]
  )
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const id = (event.target as HTMLElement).dataset.token
    if (!id || event.altKey || event.ctrlKey || event.metaKey) return
    const moves: Record<string, () => string> = {
      ArrowRight: () => neighbourWord(index, id, 1),
      ArrowLeft: () => neighbourWord(index, id, -1),
      ArrowDown: () => neighbourSentenceWord(index, id, 1),
      ArrowUp: () => neighbourSentenceWord(index, id, -1),
      Home: () => index.words[0]?.id ?? id,
      End: () => index.words.at(-1)?.id ?? id
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    focusWord(move())
  }
  const tabStop = currentWord ?? index.words[0]?.id ?? null
  return (
    <div role="group" aria-label={t('text.label')} onKeyDown={onKeyDown} lang={language} className="reading-text flex flex-col gap-[1.1em]">
      {readingOrder(paragraphs, blocks).map((item) =>
        item.kind === 'image' ? (
          <InlineFigure key={item.image.id} image={item.image} language={language} />
        ) : (
          <ParagraphView
            key={item.paragraph.id}
            slug={slug}
            version={version}
            paragraph={item.paragraph}
            tabStop={tabStop && index.paragraphOfSentence.get(index.sentenceOfWord.get(tabStop) ?? '') === item.paragraph.id ? tabStop : null}
            openWord={openWord && index.paragraphOfSentence.get(index.sentenceOfWord.get(openWord) ?? '') === item.paragraph.id ? openWord : null}
            saved={saved}
            highlightSaved={highlightSaved}
            newWords={newWords}
            learnedWords={learnedWords}
            activeSentence={activeSentence && index.paragraphOfSentence.get(activeSentence) === item.paragraph.id ? activeSentence : null}
            showTranslation={showParagraphTranslations}
            translationLanguage={translationLanguage}
            events={events}
            onFocusWord={setCurrentWord}
            onListen={onListenParagraph}
          />
        )
      )}
    </div>
  )
}

// un párrafo solo se vuelve a pintar si cambia algo suyo: el resto del texto queda quieto mientras se lee
const ParagraphView = memo(function ParagraphView({
  slug,
  version,
  paragraph,
  tabStop,
  openWord,
  saved,
  highlightSaved,
  newWords,
  learnedWords,
  activeSentence,
  showTranslation,
  translationLanguage,
  events,
  onFocusWord,
  onListen
}: {
  slug: string
  version: number
  paragraph: Paragraph
  tabStop: string | null
  openWord: string | null
  saved: Set<string>
  highlightSaved: boolean
  newWords: Set<string> | null
  learnedWords: Set<string> | null
  activeSentence: string | null
  showTranslation: boolean
  translationLanguage: string
  events: WordEvents
  onFocusWord: (id: string) => void
  onListen?: (paragraphId: string) => void
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  return (
    <div className="group/paragraph relative">
      <p id={paragraph.id}>
        {paragraph.sentences.map((sentence) => (
          <span key={sentence.id} id={sentence.id} data-sentence={sentence.id} data-active={sentence.id === activeSentence} className="sentence">
            {sentence.tokens.map((token) =>
              token.kind === 'WORD' ? (
                <WordButton
                  key={token.id}
                  token={token}
                  tabbable={token.id === tabStop}
                  open={token.id === openWord}
                  saved={highlightSaved && token.entry !== null && saved.has(token.entry)}
                  isNew={token.entry !== null && (newWords?.has(token.entry) ?? false)}
                  learned={token.entry !== null && (learnedWords?.has(token.entry) ?? false)}
                  events={events}
                  onFocusWord={onFocusWord}
                />
              ) : (
                <span key={token.id}>{token.text + (token.space ? ' ' : '')}</span>
              )
            )}{' '}
          </span>
        ))}
      </p>
      <ParagraphTranslation
        slug={slug}
        version={version}
        paragraphId={paragraph.id}
        language={translationLanguage}
        alwaysOn={showTranslation}
        label={t('text.translateParagraph')}
        before={
          onListen && (
            <button
              type="button"
              onClick={() => onListen(paragraph.id)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-ink-muted hover:text-ink"
            >
              <Headphones aria-hidden className="size-3.5" />
              {t('audio.paragraph')}
            </button>
          )
        }
      />
    </div>
  )
})

function WordButton({
  token,
  tabbable,
  open,
  saved,
  isNew,
  learned,
  events,
  onFocusWord
}: {
  token: Token
  tabbable: boolean
  open: boolean
  saved: boolean
  isNew: boolean
  learned: boolean
  events: WordEvents
  onFocusWord: (id: string) => void
}) {
  return (
    <>
      <button
        type="button"
        id={`w-${token.id}`}
        className="word"
        data-token={token.id}
        data-saved={saved}
        data-new={isNew || undefined}
        data-learned={learned || undefined}
        tabIndex={tabbable ? 0 : -1}
        aria-haspopup="dialog"
        aria-expanded={open}
        onFocus={() => onFocusWord(token.id)}
        onClick={(event) => events.onOpen(token, event.currentTarget)}
        onMouseEnter={(event) => events.onHoverStart(token, event.currentTarget)}
        onMouseLeave={events.onHoverEnd}
      >
        {token.text}
      </button>
      {token.space ? ' ' : ''}
    </>
  )
}

// la traducción de un párrafo, a petición y debajo de él. Con la ayuda encendida se ven todas; si no, un botón discreto
function ParagraphTranslation({
  slug,
  version,
  paragraphId,
  language,
  alwaysOn,
  label,
  before
}: {
  slug: string
  version: number
  paragraphId: string
  language: string
  alwaysOn: boolean
  label: string
  before?: ReactNode
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  const [open, setOpen] = useOpenState(alwaysOn)
  const translation = useTranslations(slug, version, 'PARAGRAPH', paragraphId, language, open)
  const regionId = `${paragraphId}-translation`
  return (
    <div className="mt-1 font-sans text-[15px] leading-relaxed" lang={language}>
      {before}
      {!alwaysOn && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-ink-muted hover:text-ink"
        >
          <Languages aria-hidden className="size-3.5" />
          {open ? t('text.hideParagraph') : label}
        </button>
      )}
      {open && (
        <p
          id={regionId}
          aria-live="polite"
          className="mt-1 rounded-[var(--radius-md)] border-l-4 border-brand-soft bg-surface-muted px-4 py-2.5 text-ink-muted"
        >
          {translation.isPending ? '…' : (translation.data?.[0]?.text ?? t('text.noTranslation'))}
        </p>
      )}
    </div>
  )
}

function useOpenState(alwaysOn: boolean): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(alwaysOn)
  useEffect(() => setOpen(alwaysOn), [alwaysOn])
  return [open, setOpen]
}
