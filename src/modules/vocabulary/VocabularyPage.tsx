import { useWasichaiLinks } from '@wasichai/core'
import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookMarked, Repeat, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useLesenApi } from '../../shared/api'
import { APP_NAMESPACE } from '../../shared/appMessages'
import { EmptyState } from '../../shared/EmptyState'
import { formatDate } from '../../shared/format'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { retryNetwork } from '../../shared/retry'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { splitContext, vocabularyItemSchema, vocabularyPageSchema, type VocabularyItem } from './contract'
import { VOCABULARY_MODULE_ID } from './i18n'

export function VocabularyPage() {
  const { t } = useTranslation(VOCABULARY_MODULE_ID)
  usePageTitle(t('title'))
  return (
    <LearnerLayout>
      <Vocabulary />
    </LearnerLayout>
  )
}

function Vocabulary() {
  const { t } = useTranslation(VOCABULARY_MODULE_ID)
  const links = useWasichaiLinks()
  const { get } = useLesenApi()
  const [query, setQuery] = useState('')
  const [q, setQ] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setQ(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])
  const words = useInfiniteQuery({
    queryKey: ['me', 'vocabulary', { q }],
    queryFn: ({ pageParam }) => get(`/lesen/vocabulary?page=${pageParam}&size=24${q ? `&q=${encodeURIComponent(q)}` : ''}`, vocabularyPageSchema),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.totalPages > last.page + 1 ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
    retry: retryNetwork
  })
  const searchId = useId()
  const items = words.data?.pages.flatMap((page) => page.content) ?? []
  const total = words.data?.pages[0]?.totalElements ?? 0
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-read text-h1">{t('title')}</h1>
          <p className="mt-2 text-ink-muted">{t('lead')}</p>
        </div>
        {words.data && total > 0 && <p className="text-label">{t('count', { count: total })}</p>}
      </header>
      <p className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-notice-soft px-4 py-3 text-notice">
        <Repeat aria-hidden className="mt-0.5 size-5 shrink-0" />
        {t('reviewSoon')}
      </p>
      <label htmlFor={searchId} className="sr-only">
        {t('search')}
      </label>
      <input
        id={searchId}
        type="search"
        value={query}
        maxLength={64}
        placeholder={t('search')}
        onChange={(event) => setQuery(event.target.value)}
        className="min-h-11 w-full rounded-full border border-border-control bg-surface-raised px-5 text-[16px] sm:max-w-sm"
      />
      {words.isError ? (
        <ProblemState error={words.error} onRetry={() => words.refetch()} />
      ) : !words.data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={q ? t('emptySearch', { q }) : t('empty')}
          body={q ? undefined : t('emptyBody')}
          action={
            !q && (
              <Link to={links.to(ROUTES.discover)} className={buttonClass('primary')}>
                {t('discover')}
              </Link>
            )
          }
        />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <WordCard item={item} />
              </li>
            ))}
          </ul>
          {words.hasNextPage && (
            <button
              type="button"
              className={buttonClass('secondary', 'md', 'self-center')}
              onClick={() => words.fetchNextPage()}
              disabled={words.isFetchingNextPage}
            >
              {t('more')}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function WordCard({ item }: { item: VocabularyItem }) {
  const { t, i18n } = useTranslation(VOCABULARY_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState(item.note ?? '')
  const noteId = useId()
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['me'] })
  const saveNote = useMutation({
    mutationFn: () => send('PATCH', `/lesen/vocabulary/${item.id}`, { note: note.trim() || null }, vocabularyItemSchema),
    onSuccess: () => {
      setEditing(false)
      void refresh()
    }
  })
  const remove = useMutation({ mutationFn: () => send('DELETE', `/lesen/vocabulary/${item.id}`, undefined), onSuccess: () => void refresh() })
  const parts = item.context ? splitContext(item.context, item.surface) : null
  return (
    <article className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-read text-h3" lang={item.language}>
            {item.lemma}
          </h2>
          <p className="text-secondary italic text-ink-muted">{app(`pos.${item.pos}`, { defaultValue: item.pos })}</p>
        </div>
        <span className="rounded-full bg-mark-saved px-2.5 py-0.5 text-[12.5px] font-bold text-mark-saved-ink">{t(`status.${item.status}`)}</span>
      </div>
      <p className="text-[17px] font-semibold">{item.translations.join(', ')}</p>
      {item.context && (
        <blockquote className="border-l-2 border-brand-soft pl-3 font-read text-[16.5px] leading-relaxed text-ink-muted" lang={item.language}>
          {parts ? (
            <>
              {parts[0]}
              <mark className="rounded bg-mark-saved px-0.5 text-mark-saved-ink">{parts[1]}</mark>
              {parts[2]}
            </>
          ) : (
            item.context
          )}
        </blockquote>
      )}
      <p className="text-secondary text-ink-muted">
        {item.source && (
          <>
            <Link to={links.to(ROUTES.reading, { slug: item.source.slug })} className="text-link underline underline-offset-4">
              {t('from', { title: item.source.title })}
            </Link>
            {' · '}
          </>
        )}
        {t('savedOn', { date: formatDate(item.savedAt, i18n.language) })}
      </p>
      {editing ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            saveNote.mutate()
          }}
        >
          <label htmlFor={noteId} className="text-secondary font-semibold">
            {t('note')}
          </label>
          <textarea
            id={noteId}
            value={note}
            maxLength={2000}
            rows={2}
            autoFocus
            onChange={(event) => setNote(event.target.value)}
            className="rounded-[var(--radius-md)] border border-border-control bg-surface px-3 py-2 text-[16px]"
          />
          <div className="flex gap-2">
            <button type="submit" className={buttonClass('primary', 'sm')} disabled={saveNote.isPending}>
              {t('saveNote')}
            </button>
            <button type="button" className={buttonClass('ghost', 'sm')} onClick={() => setEditing(false)}>
              {t('cancel')}
            </button>
          </div>
        </form>
      ) : (
        item.note && <p className="rounded-[var(--radius-md)] bg-surface-muted px-3 py-2 text-secondary">{item.note}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
        {!editing && (
          <button type="button" className={buttonClass('ghost', 'sm')} onClick={() => setEditing(true)}>
            {item.note ? t('editNote') : t('addNote')}
          </button>
        )}
        <Link to={links.to(ROUTES.entry, { key: item.entryKey })} className={buttonClass('ghost', 'sm')}>
          {t('openEntry')}
        </Link>
        <button
          type="button"
          className={buttonClass('ghost', 'icon', 'ml-auto')}
          aria-label={t('remove', { word: item.lemma })}
          onClick={() => remove.mutate()}
          disabled={remove.isPending}
        >
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>
    </article>
  )
}
