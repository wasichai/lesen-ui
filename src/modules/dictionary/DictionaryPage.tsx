import { useWasichaiLinks } from '@wasichai/core'
import { History, Search, Star } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { useProfile } from '../../shared/api'
import { APP_NAMESPACE } from '../../shared/appMessages'
import type { EntrySummary } from '../../shared/entry'
import { languageName } from '../../shared/format'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useClearHistory, useFavorites, useHistory, useSearch } from './api'
import { DICTIONARY_MODULE_ID } from './i18n'

export function DictionaryPage() {
  const { t } = useTranslation(DICTIONARY_MODULE_ID)
  usePageTitle(t('title'))
  return (
    <LearnerLayout>
      <Dictionary />
    </LearnerLayout>
  )
}

function Dictionary() {
  const { t, i18n } = useTranslation(DICTIONARY_MODULE_ID)
  const profile = useProfile()
  const [params, setParams] = useSearchParams()
  const submitted = params.get('q') ?? ''
  const [text, setText] = useState(submitted)
  const [typed, setTyped] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setTyped(text.trim()), 200)
    return () => clearTimeout(timer)
  }, [text])
  const suggestions = useSearch(typed !== submitted ? typed : '', false)
  const results = useSearch(submitted, true)
  const history = useHistory()
  const favorites = useFavorites()
  const clear = useClearHistory()
  const inputId = useId()
  const listId = useId()
  const showSuggestions = typed.length > 0 && typed !== submitted && (suggestions.data?.length ?? 0) > 0
  const submit = (q: string) => {
    setText(q)
    setParams(q.trim() ? { q: q.trim() } : {}, { replace: false })
  }
  const study = profile.data ? languageName(profile.data.targetLanguage, i18n.language) : ''
  const ui = profile.data ? languageName(profile.data.interfaceLanguage, i18n.language) : ''
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-h1">{t('title')}</h1>
        <p className="mt-2 text-ink-muted">{t('lead', { language: study, ui })}</p>
      </header>
      <form
        role="search"
        className="relative max-w-2xl"
        onSubmit={(event) => {
          event.preventDefault()
          submit(text)
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          {t('search')}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-muted" />
            <input
              id={inputId}
              type="search"
              value={text}
              maxLength={64}
              autoComplete="off"
              placeholder={t('search')}
              aria-autocomplete="list"
              aria-controls={showSuggestions ? listId : undefined}
              aria-expanded={showSuggestions}
              role="combobox"
              onChange={(event) => setText(event.target.value)}
              className="min-h-12 w-full rounded-full border border-border-control bg-surface-raised pl-12 pr-5 text-[17px]"
            />
          </div>
          <button type="submit" className={buttonClass('primary')}>
            {t('searchButton')}
          </button>
        </div>
        {showSuggestions && (
          <ul
            id={listId}
            role="listbox"
            aria-label={t('suggestions')}
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-raised shadow-[var(--shadow-overlay)]"
          >
            {suggestions.data!.map((entry) => (
              <li key={entry.key} role="option" aria-selected={false}>
                <SuggestionLink entry={entry} />
              </li>
            ))}
          </ul>
        )}
      </form>

      {submitted && (
        <section aria-labelledby="results" aria-busy={results.isFetching}>
          <h2 id="results" className="mb-3 text-label" aria-live="polite">
            {results.data ? t('results', { count: results.data.length }) : ''}
          </h2>
          {results.isError ? (
            <ProblemState error={results.error} onRetry={() => results.refetch()} />
          ) : !results.data ? (
            <Skeleton className="h-24" />
          ) : results.data.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-border p-6">
              <p className="font-display text-h4">{t('none', { q: submitted })}</p>
              <p className="mt-1 text-ink-muted">{t('noneBody')}</p>
            </div>
          ) : (
            <EntryList entries={results.data} />
          )}
        </section>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <section aria-labelledby="favorites">
          <h2 id="favorites" className="mb-3 flex items-center gap-2 font-display text-h3">
            <Star aria-hidden className="size-5 text-ochre" />
            {t('favorites')}
          </h2>
          {favorites.data && favorites.data.length === 0 ? <p className="text-ink-muted">{t('noFavorites')}</p> : <EntryList entries={favorites.data ?? []} />}
        </section>
        <section aria-labelledby="history">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="history" className="flex items-center gap-2 font-display text-h3">
              <History aria-hidden className="size-5 text-sea" />
              {t('history')}
            </h2>
            {(history.data?.length ?? 0) > 0 && (
              <button type="button" className={buttonClass('quiet', 'sm', 'px-0')} onClick={() => clear.mutate()}>
                {t('clearHistory')}
              </button>
            )}
          </div>
          <ul className="flex flex-wrap gap-2">
            {(history.data ?? []).map((item) => (
              <li key={item.query}>
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-border bg-surface-raised px-4 hover:border-border-control"
                  onClick={() => submit(item.query)}
                >
                  {item.query}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function SuggestionLink({ entry }: { entry: EntrySummary }) {
  const links = useWasichaiLinks()
  const { t: app } = useTranslation(APP_NAMESPACE)
  return (
    <Link
      to={links.to(ROUTES.entry, { key: entry.key })}
      className="flex min-h-11 items-baseline gap-3 px-4 py-2.5 hover:bg-surface-muted focus-visible:bg-surface-muted"
    >
      <span className="font-read text-[18px] font-semibold" lang={entry.language}>
        {entry.lemma}
      </span>
      <span className="truncate text-secondary text-ink-muted">
        {app(`pos.${entry.pos}`, { defaultValue: entry.pos })} · {entry.translations.join(', ')}
      </span>
    </Link>
  )
}

function EntryList({ entries }: { entries: EntrySummary[] }) {
  const { t } = useTranslation(DICTIONARY_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-raised">
      {entries.map((entry) => (
        <li key={entry.key}>
          <Link to={links.to(ROUTES.entry, { key: entry.key })} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3.5 hover:bg-surface-muted">
            <span className="font-display text-h4" lang={entry.language}>
              {entry.lemma}
            </span>
            <span className="text-secondary italic text-ink-muted">{app(`pos.${entry.pos}`, { defaultValue: entry.pos })}</span>
            <span className="basis-full sm:basis-auto">{entry.translations.join(', ')}</span>
            {t(`matched.${entry.matchedBy}`, { defaultValue: '' }) && (
              <span className="rounded-full bg-surface-muted px-2 text-[12.5px] text-ink-muted">{t(`matched.${entry.matchedBy}`)}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
