import { SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { useLanguages, useProfile, useTopics } from '../../shared/api'
import { EmptyState } from '../../shared/EmptyState'
import { languageName } from '../../shared/format'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ReadingTile } from '../../shared/ReadingTile'
import { LEVELS } from '../../shared/schemas'
import { Skeleton } from '../../shared/Skeleton'
import { localizedLabel } from '../../shared/topics'
import { buttonClass, chipClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useIsWide } from '../../shared/useMediaQuery'
import { useReadings } from './api'
import { activeCount, DURATIONS, parseFilters, SORTS, toSearchParams, type Filters } from './catalogFilters'
import { DISCOVER_MODULE_ID } from './i18n'

export function ExplorePage() {
  const { t } = useTranslation(DISCOVER_MODULE_ID)
  usePageTitle(t('explore.title'))
  return (
    <LearnerLayout>
      <Explore />
    </LearnerLayout>
  )
}

function Explore() {
  const { t, i18n } = useTranslation(DISCOVER_MODULE_ID)
  const profile = useProfile()
  const defaultLanguage = profile.data?.targetLanguage ?? null
  const [params, setParams] = useSearchParams()
  const filters = parseFilters(params, defaultLanguage)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState(filters.q)
  const [panelOpen, setPanelOpen] = useState(false)
  const wide = useIsWide()
  const readings = useReadings(filters, page)
  const searchId = useId()
  const update = (next: Partial<Filters>) => {
    setPage(0)
    setParams(toSearchParams({ ...filters, ...next }, defaultLanguage), { replace: true })
  }
  // la búsqueda se aplica al dejar de escribir, sin un botón que pulsar
  useEffect(() => {
    if (query === filters.q) return
    const timer = setTimeout(() => update({ q: query }), 300)
    return () => clearTimeout(timer)
  }, [query])
  const count = activeCount(filters)
  const data = readings.data
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-h1">{t('explore.title')}</h1>
        <p className="mt-2 text-ink-muted">{t('explore.lead')}</p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={searchId} className="sr-only">
          {t('explore.search')}
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          maxLength={64}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('explore.searchPlaceholder')}
          className="min-h-11 min-w-0 flex-1 rounded-full border border-border-control bg-surface-raised px-5 text-[16px] placeholder:text-placeholder"
        />
        {!wide && (
          <button type="button" className={buttonClass('secondary')} aria-expanded={panelOpen} aria-controls="filters" onClick={() => setPanelOpen(!panelOpen)}>
            <SlidersHorizontal aria-hidden className="size-4" />
            {count > 0 ? t('explore.filtersCount', { count }) : t('explore.filters')}
          </button>
        )}
      </div>
      <div className="grid gap-8 md:grid-cols-[15rem_1fr] lg:grid-cols-[17rem_1fr]">
        {(wide || panelOpen) && <FilterPanel filters={filters} update={update} language={i18n.language} />}
        <section aria-labelledby="results" aria-busy={readings.isFetching}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="results" className="text-label" aria-live="polite">
              {data ? t('explore.results', { count: data.totalElements }) : ' '}
            </h2>
            <label className="flex items-center gap-2 text-secondary text-ink-muted">
              {t('explore.sort')}
              <select
                value={filters.sort}
                onChange={(event) => update({ sort: event.target.value as Filters['sort'] })}
                className="min-h-11 rounded-full border border-border-control bg-surface-raised px-4 text-[15px] text-ink"
              >
                {SORTS.map((sort) => (
                  <option key={sort} value={sort}>
                    {t(`explore.sorts.${sort}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {readings.isError ? (
            <ProblemState error={readings.error} onRetry={() => readings.refetch()} />
          ) : !data ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : data.content.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('explore.empty')}
              body={t('explore.emptyBody')}
              action={
                count > 0 && (
                  <button type="button" className={buttonClass('secondary')} onClick={() => update({ levels: [], topic: null, duration: null, q: '' })}>
                    {t('explore.clear')}
                  </button>
                )
              }
            />
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                {data.content.map((reading) => (
                  <li key={reading.slug}>
                    <ReadingTile reading={reading} />
                  </li>
                ))}
              </ul>
              {data.totalPages > 1 && (
                <nav aria-label={t('explore.page', { page: page + 1, total: data.totalPages })} className="mt-10 flex items-center justify-center gap-3">
                  <button type="button" className={buttonClass('secondary', 'sm')} disabled={page === 0} onClick={() => setPage(page - 1)}>
                    {t('explore.previous')}
                  </button>
                  <span className="text-secondary text-ink-muted">{t('explore.page', { page: page + 1, total: data.totalPages })}</span>
                  <button type="button" className={buttonClass('secondary', 'sm')} disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>
                    {t('explore.next')}
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function FilterPanel({ filters, update, language }: { filters: Filters; update: (next: Partial<Filters>) => void; language: string }) {
  const { t } = useTranslation(DISCOVER_MODULE_ID)
  const languages = useLanguages()
  const topics = useTopics()
  const studies = languages.data?.languages.filter((l) => l.study) ?? []
  const count = activeCount(filters)
  return (
    <aside id="filters" aria-label={t('explore.filters')} className="flex flex-col gap-7 md:sticky md:top-24 md:self-start">
      <fieldset>
        <legend className="text-label">{t('explore.language')}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={filters.language === null}
            className={chipClass(filters.language === null)}
            onClick={() => update({ language: null })}
          >
            {t('explore.allLanguages')}
          </button>
          {studies.map((l) => (
            <button
              key={l.code}
              type="button"
              aria-pressed={filters.language === l.code}
              className={chipClass(filters.language === l.code)}
              onClick={() => update({ language: l.code })}
            >
              {languageName(l.code, language)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-label">{t('explore.level')}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.map((level) => {
            const on = filters.levels.includes(level)
            return (
              <button
                key={level}
                type="button"
                aria-pressed={on}
                className={chipClass(on)}
                onClick={() => update({ levels: on ? filters.levels.filter((l) => l !== level) : [...filters.levels, level] })}
              >
                {level}
              </button>
            )
          })}
        </div>
      </fieldset>
      <label className="flex flex-col gap-2">
        <span className="text-label">{t('explore.topic')}</span>
        <select
          value={filters.topic ?? ''}
          onChange={(event) => update({ topic: event.target.value || null })}
          className="min-h-11 rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 text-[16px]"
        >
          <option value="">{t('explore.allTopics')}</option>
          {(topics.data ?? []).map((topic) => (
            <optgroup key={topic.slug} label={localizedLabel(topic.labels, language)}>
              <option value={topic.slug}>{localizedLabel(topic.labels, language)}</option>
              {topic.children.map((child) => (
                <option key={child.slug} value={child.slug}>
                  {`${localizedLabel(topic.labels, language)} · ${localizedLabel(child.labels, language)}`}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-label">{t('explore.duration')}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {DURATIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              aria-pressed={filters.duration === duration}
              className={chipClass(filters.duration === duration)}
              onClick={() => update({ duration: filters.duration === duration ? null : duration })}
            >
              {t(`explore.durations.${duration}`)}
            </button>
          ))}
        </div>
      </fieldset>
      {count > 0 && (
        <button
          type="button"
          className={buttonClass('quiet', 'sm', 'self-start px-0')}
          onClick={() => update({ levels: [], topic: null, duration: null, q: '' })}
        >
          <X aria-hidden className="size-4" />
          {t('explore.clear')}
        </button>
      )}
    </aside>
  )
}
