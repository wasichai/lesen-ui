import { useWasichaiLinks } from '@wasichai/core'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { BookOpen, ListPlus } from 'lucide-react'
import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { useLesenApi } from '../../shared/api'
import { EmptyState } from '../../shared/EmptyState'
import { useLists } from '../../shared/lists'
import { queryKeys } from '../../shared/keys'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ReadingTile } from '../../shared/ReadingTile'
import { retryNetwork } from '../../shared/retry'
import { ROUTES } from '../../shared/routes'
import { readingCardSchema } from '../../shared/schemas'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { LIBRARY_MODULE_ID } from './i18n'
import { NewList } from './ListPage'

const librarySchema = z.object({ inProgress: z.array(readingCardSchema), bookmarked: z.array(readingCardSchema), completed: z.array(readingCardSchema) })
const TABS = ['inProgress', 'bookmarked', 'completed', 'lists'] as const
type Tab = (typeof TABS)[number]

export function LibraryPage() {
  const { t } = useTranslation(LIBRARY_MODULE_ID)
  usePageTitle(t('title'))
  return (
    <LearnerLayout>
      <Library />
    </LearnerLayout>
  )
}

function Library() {
  const { t } = useTranslation(LIBRARY_MODULE_ID)
  const links = useWasichaiLinks()
  const { get } = useLesenApi()
  const [params, setParams] = useSearchParams()
  const tab: Tab = (TABS as readonly string[]).includes(params.get('tab') ?? '') ? (params.get('tab') as Tab) : 'inProgress'
  const [query, setQuery] = useState('')
  const [q, setQ] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setQ(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])
  const library = useQuery({
    queryKey: queryKeys.library(q),
    queryFn: () => get(`/lesen/library${q ? `?q=${encodeURIComponent(q)}` : ''}`, librarySchema),
    placeholderData: keepPreviousData,
    retry: retryNetwork
  })
  const lists = useLists()
  const searchId = useId()
  const select = (next: Tab) => setParams(next === 'inProgress' ? {} : { tab: next }, { replace: true })
  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = TABS.indexOf(tab)
    const next = event.key === 'ArrowRight' ? TABS[(at + 1) % TABS.length] : event.key === 'ArrowLeft' ? TABS[(at + TABS.length - 1) % TABS.length] : null
    if (!next) return
    event.preventDefault()
    select(next)
    requestAnimationFrame(() => document.getElementById(`tab-${next}`)?.focus())
  }
  const list = tab === 'lists' ? [] : (library.data?.[tab] ?? [])
  const count = (name: Tab) => (name === 'lists' ? lists.data?.length : library.data?.[name].length)
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-h1">{t('title')}</h1>
        <p className="mt-2 text-ink-muted">{t('lead')}</p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label={t('title')} onKeyDown={onTabKey} className="inline-flex max-w-full flex-wrap rounded-[26px] bg-surface-muted p-1">
          {TABS.map((name) => (
            <button
              key={name}
              id={`tab-${name}`}
              role="tab"
              type="button"
              aria-selected={tab === name}
              aria-controls="library-panel"
              tabIndex={tab === name ? 0 : -1}
              onClick={() => select(name)}
              className={`min-h-11 rounded-full px-4 text-label transition-colors ${tab === name ? 'bg-surface-raised text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              {t(`tabs.${name}`)}
              {count(name) !== undefined && <span className="ml-1.5 text-secondary text-ink-muted">{count(name)}</span>}
            </button>
          ))}
        </div>
        <label htmlFor={searchId} className="sr-only">
          {t('search')}
        </label>
        <input
          hidden={tab === 'lists'}
          id={searchId}
          type="search"
          value={query}
          maxLength={64}
          placeholder={t('search')}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-11 w-full rounded-full border border-border-control bg-surface-raised px-5 text-[16px] sm:w-72"
        />
      </div>
      <div id="library-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'lists' ? (
          <Lists />
        ) : library.isError ? (
          <ProblemState error={library.error} onRetry={() => library.refetch()} />
        ) : !library.data ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={q ? t('empty.search', { q }) : t(`empty.${tab}`)}
            action={
              <Link to={links.to(ROUTES.discover)} className={buttonClass('primary')}>
                {t('discover')}
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((reading) => (
              <li key={reading.slug}>
                <ReadingTile reading={reading} variant="row" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// las listas propias: crear una nueva y abrir cada una
function Lists() {
  const { t } = useTranslation(LIBRARY_MODULE_ID)
  const links = useWasichaiLinks()
  const lists = useLists()
  if (lists.isError) return <ProblemState error={lists.error} onRetry={() => lists.refetch()} />
  if (!lists.data) return <Skeleton className="h-32" />
  return (
    <div className="flex flex-col gap-6">
      <NewList />
      {lists.data.length === 0 ? (
        <EmptyState icon={ListPlus} title={t('lists.empty')} body={t('lists.emptyBody')} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.data.map((item) => (
            <li key={item.id}>
              <Link
                to={links.to(ROUTES.list, { id: item.id })}
                className="flex min-h-20 flex-col justify-center gap-1 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4 transition-colors hover:border-border-control"
              >
                <span className="font-display text-h4">{item.name}</span>
                <span className="text-secondary text-ink-muted">{t('lists.count', { count: item.count })}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
