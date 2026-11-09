import { useWasichaiLinks } from '@wasichai/core'
import { BookmarkCheck, BookmarkPlus, Headphones, Languages, NotebookPen, Quote } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { APP_NAMESPACE, grammarValue } from '../../shared/appMessages'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { useAddNote, useLookup, useSaveWord, useTranslations } from './api'
import type { Lookup } from './contract'
import { READER_MODULE_ID } from './i18n'

// lo que se ve de una palabra. «compact»: el vistazo al pasar el cursor (traducción y guardar). «full»: la hoja con todo,
// la oración en contexto, su traducción a petición y guardar la oración con una nota
export function WordDetails({
  slug,
  version,
  tokenRef,
  language,
  mode,
  saved,
  onListen
}: {
  slug: string
  version: number
  tokenRef: string
  language: string
  mode: 'compact' | 'full'
  saved: boolean
  // con audio: escuchar desde esta palabra
  onListen?: () => void
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  const lookup = useLookup(slug, version, tokenRef)
  if (lookup.isError)
    return (
      <div className="flex flex-col gap-2">
        <p className="text-danger">{t('word.noEntry')}</p>
        {mode === 'full' && <ListenButton onListen={onListen} />}
      </div>
    )
  if (!lookup.data)
    return (
      <div role="status" aria-label={t('word.loading')} className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-48" />
      </div>
    )
  return (
    <Details
      lookup={lookup.data}
      slug={slug}
      version={version}
      language={language}
      mode={mode}
      saved={saved || (lookup.data.entry?.saved ?? false)}
      onListen={onListen}
    />
  )
}

// con audio, escuchar desde la palabra; sin audio, nada
function ListenButton({ onListen }: { onListen?: () => void }) {
  const { t } = useTranslation(READER_MODULE_ID)
  if (!onListen) return null
  return (
    <button type="button" className={buttonClass('secondary', 'sm', 'self-start')} onClick={onListen}>
      <Headphones aria-hidden className="size-4" />
      {t('audio.fromHere')}
    </button>
  )
}

function Details({
  lookup,
  slug,
  version,
  language,
  mode,
  saved,
  onListen
}: {
  lookup: Lookup
  slug: string
  version: number
  language: string
  mode: 'compact' | 'full'
  saved: boolean
  onListen?: () => void
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const save = useSaveWord(slug, version)
  const entry = lookup.entry
  // el diccionario es otro módulo: si no está registrado, la palabra se ve igual, sin enlazarlo
  const linkable = links.has(ROUTES.entry)
  const isSaved = saved || save.isSuccess
  if (!entry)
    return (
      <div className="flex flex-col gap-2">
        <p className="font-read text-h3" lang={language}>
          {lookup.token}
        </p>
        <p className="font-semibold">{t('word.noEntry')}</p>
        <p className="text-secondary text-ink-muted">{t('word.noEntryBody')}</p>
        {mode === 'full' && <ListenButton onListen={onListen} />}
        {mode === 'full' && <SentenceTools lookup={lookup} slug={slug} version={version} language={language} />}
      </div>
    )
  const first = entry.senses[0]
  const meanings = [...new Set(entry.senses.flatMap((s) => s.translations))]
  const grammar = Object.entries(entry.grammar).filter(([, value]) => value !== null && value !== '' && typeof value !== 'object')
  const saveButton = (
    <button
      type="button"
      className={buttonClass(isSaved ? 'secondary' : 'primary', 'sm')}
      disabled={isSaved || save.isPending}
      aria-live="polite"
      onClick={() => save.mutate({ entryKey: entry.key, tokenRef: lookup.tokenRef })}
    >
      {isSaved ? <BookmarkCheck aria-hidden className="size-4 text-success" /> : <BookmarkPlus aria-hidden className="size-4" />}
      {isSaved ? t('word.saved') : save.isPending ? t('word.saving') : t('word.save')}
    </button>
  )
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-read text-h2 leading-none" lang={entry.language}>
            {entry.lemma}
          </span>
          {entry.ipa && <span className="text-secondary text-ink-muted">/{entry.ipa}/</span>}
        </div>
        <p className="mt-1 text-secondary italic text-ink-muted">
          {app(`pos.${entry.pos}`, { defaultValue: entry.pos })}
          {grammar.length > 0 && mode === 'compact' && grammar[0] && ` · ${grammarValue(grammar[0][1], app)}`}
        </p>
        {lookup.inflected && <p className="mt-2 text-secondary">{t('word.formOf', { form: lookup.token, lemma: entry.lemma })}</p>}
      </div>
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">{t('word.meaning')}</p>
        <p className="mt-1 text-[19px] font-semibold leading-snug">{meanings.join(', ') || '—'}</p>
        {first?.definition && <p className="mt-1 text-ink-muted">{first.definition}</p>}
      </div>
      {mode === 'compact' ? (
        <div className="flex flex-wrap items-center gap-2">{saveButton}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {saveButton}
            <ListenButton onListen={onListen} />
            {linkable && (
              <Link to={links.to(ROUTES.entry, { key: entry.key })} className={buttonClass('quiet', 'sm', 'px-2')}>
                {t('word.openEntry')}
              </Link>
            )}
          </div>
          {grammar.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-[var(--radius-md)] bg-surface-muted px-4 py-3 text-secondary">
              {grammar.map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-ink-muted">{app(`grammar.${key}`, { defaultValue: key })}</dt>
                  <dd lang={typeof value === 'string' && key !== 'gender' ? entry.language : undefined}>{grammarValue(value, app)}</dd>
                </div>
              ))}
            </dl>
          )}
          {entry.senses.map((sense, i) => (
            <div key={i} className="flex flex-col gap-3">
              {sense.examples.length > 0 && (
                <div>
                  <p className="text-eyebrow uppercase text-ink-muted">{t('word.examples')}</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {sense.examples.map((example) => (
                      <li key={example.text} className="border-l-2 border-brand-soft pl-3">
                        <p className="font-read text-[17px]" lang={entry.language}>
                          {example.text}
                        </p>
                        {example.translation && <p className="text-secondary text-ink-muted">{example.translation}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <WordList label={t('word.synonyms')} words={sense.synonyms} language={entry.language} />
              <WordList label={t('word.antonyms')} words={sense.antonyms} language={entry.language} />
              {sense.related.length > 0 && (
                <div>
                  <p className="text-eyebrow uppercase text-ink-muted">{t('word.related')}</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {sense.related.map((r) =>
                      linkable ? (
                        <Link key={r.key} to={links.to(ROUTES.entry, { key: r.key })} className="text-link underline underline-offset-4" lang={entry.language}>
                          {r.lemma}
                        </Link>
                      ) : (
                        <span key={r.key} lang={entry.language}>
                          {r.lemma}
                        </span>
                      )
                    )}
                  </p>
                </div>
              )}
              {sense.note && (
                <p className="rounded-[var(--radius-md)] bg-notice-soft px-4 py-3 text-secondary text-notice">
                  <span className="font-semibold">{t('word.note')}: </span>
                  {sense.note}
                </p>
              )}
            </div>
          ))}
          {lookup.alternatives.length > 0 && (
            <div>
              <p className="text-eyebrow uppercase text-ink-muted">{t('word.alternatives')}</p>
              <ul className="mt-1 flex flex-col gap-1">
                {lookup.alternatives.map((alt) => (
                  <li key={alt.key}>
                    {linkable ? (
                      <Link to={links.to(ROUTES.entry, { key: alt.key })} className="text-link underline underline-offset-4">
                        <span lang={alt.language}>{alt.lemma}</span>
                      </Link>
                    ) : (
                      <span lang={alt.language}>{alt.lemma}</span>
                    )}{' '}
                    <span className="text-secondary text-ink-muted">
                      ({app(`pos.${alt.pos}`, { defaultValue: alt.pos })}) {alt.translations.join(', ')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <SentenceTools lookup={lookup} slug={slug} version={version} language={language} />
        </>
      )}
    </div>
  )
}

function WordList({ label, words, language }: { label: string; words: string[]; language: string }) {
  if (words.length === 0) return null
  return (
    <div>
      <p className="text-eyebrow uppercase text-ink-muted">{label}</p>
      <p className="mt-1" lang={language}>
        {words.join(', ')}
      </p>
    </div>
  )
}

// la oración donde apareció la palabra: traducirla (solo si alguien la escribió) y guardarla en las notas
function SentenceTools({ lookup, slug, version, language }: { lookup: Lookup; slug: string; version: number; language: string }) {
  const { t } = useTranslation(READER_MODULE_ID)
  const [showTranslation, setShowTranslation] = useState(false)
  const [note, setNote] = useState('')
  const translation = useTranslations(slug, version, 'SENTENCE', lookup.sentenceRef, lookup.translationLanguage, showTranslation)
  const addNote = useAddNote(slug, version)
  const noteId = useId()
  return (
    <section aria-label={t('word.inContext')} className="flex flex-col gap-3 border-t border-border pt-4">
      <p className="text-eyebrow uppercase text-ink-muted">{t('word.inContext')}</p>
      <blockquote className="flex gap-2 font-read text-[18px] leading-relaxed" lang={language}>
        <Quote aria-hidden className="mt-1 size-4 shrink-0 text-brand" />
        {lookup.sentence}
      </blockquote>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass('secondary', 'sm')} aria-expanded={showTranslation} onClick={() => setShowTranslation(!showTranslation)}>
          <Languages aria-hidden className="size-4" />
          {showTranslation ? t('word.hideSentence') : t('word.translateSentence')}
        </button>
      </div>
      {showTranslation && (
        <p aria-live="polite" className="rounded-[var(--radius-md)] bg-surface-muted px-4 py-3">
          {translation.isPending ? '…' : (translation.data?.[0]?.text ?? t('word.sentenceUnavailable'))}
        </p>
      )}
      {addNote.isSuccess ? (
        <p role="status" className="font-semibold text-success">
          {t('word.sentenceSaved')}
        </p>
      ) : (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            addNote.mutate({ sentenceRef: lookup.sentenceRef, note: note.trim() || undefined })
          }}
        >
          <label htmlFor={noteId} className="text-secondary text-ink-muted">
            {t('word.addNote')}
          </label>
          <textarea
            id={noteId}
            value={note}
            maxLength={2000}
            rows={2}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 py-2 text-[16px]"
          />
          <button type="submit" className={buttonClass('secondary', 'sm', 'self-start')} disabled={addNote.isPending}>
            <NotebookPen aria-hidden className="size-4" />
            {t('word.saveSentence')}
          </button>
        </form>
      )}
    </section>
  )
}
