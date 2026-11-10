import { ApiError, useWasichaiLinks } from '@wasichai/core'
import { BookImage, Check, Sparkles } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useLanguages, useMyCommissions, useProfile } from '../../shared/api'
import { CommissionProgress } from '../../shared/CommissionProgress'
import { formatDate } from '../../shared/format'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { LEVELS, MINUTES, TEXT_KINDS, type CommissionRequest } from '../../shared/schemas'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass, chipClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useAsk, useMine, useQuota } from './api'
import { booksLeft, canAsk, dailyLeft, initialRequest, toRequest } from './generateModel'
import { GENERATE_MODULE_ID } from './i18n'

const fieldClass = 'min-h-11 w-full rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 py-2 text-[16px]'

export function GeneratePage() {
  const { t } = useTranslation(GENERATE_MODULE_ID)
  usePageTitle(t('title'))
  return (
    <LearnerLayout>
      <Generate />
    </LearnerLayout>
  )
}

function Generate() {
  const { t } = useTranslation(GENERATE_MODULE_ID)
  const profile = useProfile()
  const quota = useQuota()
  if (quota.isError) return <ProblemState error={quota.error} onRetry={() => quota.refetch()} />
  if (!quota.data || profile.isPending) return <Skeleton className="h-96" />
  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-display text-h1">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">{t('lead')}</p>
      </header>
      <Ask key={profile.data?.targetLanguage ?? 'none'} initial={initialRequest(profile.data)} quota={quota.data} />
      <Mine />
    </div>
  )
}

function Ask({ initial, quota }: { initial: CommissionRequest; quota: NonNullable<ReturnType<typeof useQuota>['data']> }) {
  const { t, i18n } = useTranslation(GENERATE_MODULE_ID)
  const links = useWasichaiLinks()
  const languages = useLanguages()
  const ask = useAsk()
  const [request, setRequest] = useState(initial)
  const [jobId, setJobId] = useState<string | null>(null)
  const job = useMine(jobId)
  const id = useId()
  const study = languages.data?.languages.filter((l) => l.study) ?? []
  const language = request.language || study[0]?.code || ''
  const set = (change: Partial<CommissionRequest>) => setRequest({ ...request, ...change })
  const running = job.data !== undefined && job.data.status !== 'READY' && job.data.status !== 'FAILED'
  const allowed = canAsk(quota, request.format)
  const error = ask.error instanceof ApiError ? ask.error.status : ask.error ? 0 : null
  return (
    <section aria-labelledby={`${id}-ask`} className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5 sm:p-6">
      <h2 id={`${id}-ask`} className="flex items-center gap-2 font-display text-h3">
        <Sparkles aria-hidden className="size-5 text-brand" />
        {t('ask')}
      </h2>
      <p className="mt-1 text-secondary text-ink-muted" data-testid="quota">
        {t('quota', { daily: dailyLeft(quota), books: booksLeft(quota) })}
        {quota.resetsAt ? ` ${t('resets', { when: formatDate(quota.resetsAt, i18n.language) })}` : ''}
      </p>
      <form
        className="mt-5 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (!language || !allowed) return
          ask.mutate(toRequest({ ...request, language }), { onSuccess: (commission) => setJobId(commission.id) })
        }}
      >
        <fieldset className="flex flex-col gap-2 md:col-span-2">
          <legend className="mb-1 text-label">{t('format')}</legend>
          <div className="flex flex-wrap gap-2">
            {(['PICTURE_BOOK', 'TEXT'] as const).map((format) => (
              <button
                key={format}
                type="button"
                aria-pressed={request.format === format}
                className={chipClass(request.format === format)}
                onClick={() => set({ format })}
              >
                {request.format === format ? (
                  <Check aria-hidden className="size-4" />
                ) : (
                  format === 'PICTURE_BOOK' && <BookImage aria-hidden className="size-4" />
                )}
                {t(`formats.${format}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('language')}</span>
          <select className={fieldClass} value={language} onChange={(event) => set({ language: event.target.value })}>
            {study.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('level')}</span>
          <select className={fieldClass} value={request.level} onChange={(event) => set({ level: event.target.value })}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('kind')}</span>
          <select className={fieldClass} value={request.kind} onChange={(event) => set({ kind: event.target.value as CommissionRequest['kind'] })}>
            {TEXT_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`kinds.${k}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('minutes')}</span>
          <select className={fieldClass} value={request.minutes} onChange={(event) => set({ minutes: Number(event.target.value) })}>
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {t('minutesValue', { count: m })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-label">{t('prompt')}</span>
          <span className="text-secondary text-ink-muted">{t('promptHint')}</span>
          <textarea
            className={`${fieldClass} min-h-24`}
            maxLength={500}
            value={request.prompt ?? ''}
            onChange={(event) => set({ prompt: event.target.value })}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <button type="submit" className={buttonClass('primary')} disabled={!language || !allowed || ask.isPending || running}>
            <Sparkles aria-hidden className="size-4" />
            {t('submit')}
          </button>
          <p aria-live="polite" className="text-secondary text-ink-muted">
            {!allowed ? t('noQuota') : error === 429 ? t('noQuota') : error === 503 ? t('unavailable') : error !== null ? t('error') : ''}
          </p>
        </div>
      </form>
      {job.data && (
        <div className="mt-6 flex flex-col gap-3 rounded-[var(--radius-md)] border border-border p-4" data-testid="commission">
          <CommissionProgress commission={job.data} />
          {job.data.status === 'READY' && job.data.readingSlug && links.has(ROUTES.reader) && (
            <Link to={links.to(ROUTES.reader, { slug: job.data.readingSlug })} className={buttonClass('primary', 'sm', 'self-start')}>
              {t('read')}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}

// lo que pedí: las listas se abren en el lector; las que siguen en marcha dicen su paso
function Mine() {
  const { t, i18n } = useTranslation(GENERATE_MODULE_ID)
  const links = useWasichaiLinks()
  const mine = useMyCommissions(true)
  const id = useId()
  if (!mine.data?.length) return null
  return (
    <section aria-labelledby={`${id}-mine`}>
      <h2 id={`${id}-mine`} className="mb-4 font-display text-h2">
        {t('mine')}
      </h2>
      <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-surface-raised">
        {mine.data.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
            <div className="min-w-0 flex-1 basis-60">
              <p className="font-semibold">
                {t(`formats.${c.request.format}`)} · {c.request.language.toUpperCase()} · {c.request.level}
              </p>
              <p className="text-secondary text-ink-muted">
                {c.request.prompt ? `«${c.request.prompt}» · ` : ''}
                {formatDate(c.createdAt, i18n.language)} · {t(`status.${c.status}`)}
              </p>
            </div>
            {c.status === 'READY' && c.readingSlug && links.has(ROUTES.reader) && (
              <Link to={links.to(ROUTES.reader, { slug: c.readingSlug })} className={buttonClass('secondary', 'sm')}>
                {t('read')}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
