import { ApiError, useWasichaiLinks } from '@wasichai/core'
import { FilePlus2, History, PenLine } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useLanguages } from '../../shared/api'
import { EmptyState } from '../../shared/EmptyState'
import { formatDate } from '../../shared/format'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { LEVELS } from '../../shared/schemas'
import { Skeleton } from '../../shared/Skeleton'
import { StudioLayout } from '../../shared/StudioLayout'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useCreateDraft, useDrafts, usePublished } from './api'
import type { DraftStatus } from './contract'
import { slugify } from './draftModel'
import { STUDIO_MODULE_ID } from './i18n'

export function StudioPage() {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  usePageTitle(t('home.title'))
  return (
    <StudioLayout>
      <Studio />
    </StudioLayout>
  )
}

export function StatusBadge({ status }: { status: DraftStatus }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const tone =
    status === 'IN_REVIEW'
      ? 'bg-ochre/15 text-ink'
      : status === 'PUBLISHED'
        ? 'bg-sage/15 text-ink'
        : status === 'DISCARDED'
          ? 'bg-surface-muted text-ink-muted'
          : 'bg-brand-soft text-brand-strong'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${tone}`}>{t(`status.${status}`)}</span>
}

const inputClass = 'min-h-11 w-full rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 text-[16px]'

function Studio() {
  const { t, i18n } = useTranslation(STUDIO_MODULE_ID)
  const links = useWasichaiLinks()
  const navigate = useNavigate()
  const drafts = useDrafts()
  const published = usePublished()
  const create = useCreateDraft()
  const open = drafts.data?.filter((d) => d.status === 'DRAFT' || d.status === 'IN_REVIEW') ?? []
  const edit = (slug: string) =>
    create.mutate({ from: slug }, { onSuccess: (draft) => navigate(links.to(ROUTES.studioDraft, { id: (draft as { id: string }).id })) })
  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="font-display text-h1">{t('home.title')}</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">{t('home.lead')}</p>
      </header>

      <section aria-labelledby="open-drafts">
        <h2 id="open-drafts" className="mb-4 font-display text-h2">
          {t('home.drafts')}
        </h2>
        {drafts.isError ? (
          <ProblemState error={drafts.error} onRetry={() => drafts.refetch()} />
        ) : !drafts.data ? (
          <Skeleton className="h-24" />
        ) : open.length === 0 ? (
          <p className="text-ink-muted">{t('home.noDrafts')}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {open.map((draft) => (
              <li key={draft.id}>
                <Link
                  to={links.to(ROUTES.studioDraft, { id: draft.id })}
                  className="flex min-h-24 flex-col gap-1.5 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4 transition-colors hover:border-border-control"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={draft.status} />
                    <span className="text-secondary text-ink-muted">
                      {draft.language.toUpperCase()} · {draft.level}
                      {draft.baseVersion ? ` · ${t('home.fromVersion', { version: draft.baseVersion })}` : ''}
                    </span>
                  </span>
                  <span className="font-display text-h4" lang={draft.language}>
                    {draft.title}
                  </span>
                  <span className="text-secondary text-ink-muted">
                    {t('home.questions', { count: draft.questions })}
                    {draft.audio ? ` · ${t('home.withAudio')}` : ''} ·{' '}
                    {t('home.updated', { who: draft.updatedBy, when: formatDate(draft.updatedAt, i18n.language) })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <NewReading />

      <section aria-labelledby="published">
        <h2 id="published" className="mb-4 font-display text-h2">
          {t('home.published')}
        </h2>
        {published.isError ? (
          <ProblemState error={published.error} onRetry={() => published.refetch()} />
        ) : !published.data ? (
          <Skeleton className="h-40" />
        ) : published.data.length === 0 ? (
          <EmptyState icon={FilePlus2} title={t('home.noPublished')} />
        ) : (
          <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-surface-raised">
            {published.data.map((reading) => (
              <li key={reading.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <div className="min-w-0 flex-1 basis-60">
                  <p className="font-display text-h4" lang={reading.language}>
                    {reading.title}
                  </p>
                  <p className="text-secondary text-ink-muted">
                    {reading.slug} · {reading.language.toUpperCase()} · {reading.level} · {t('home.version', { version: reading.currentVersion })} ·{' '}
                    {formatDate(reading.updatedAt, i18n.language)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reading.openDraft ? (
                    <Link to={links.to(ROUTES.studioDraft, { id: reading.openDraft })} className={buttonClass('secondary', 'sm')}>
                      <PenLine aria-hidden className="size-4" />
                      {t('home.openDraft')}
                      <span className="sr-only">: {reading.title}</span>
                    </Link>
                  ) : (
                    <button type="button" className={buttonClass('secondary', 'sm')} disabled={create.isPending} onClick={() => edit(reading.slug)}>
                      <PenLine aria-hidden className="size-4" />
                      {t('home.edit')}
                      <span className="sr-only">: {reading.title}</span>
                    </button>
                  )}
                  <Link to={links.to(ROUTES.studioHistory, { slug: reading.slug })} className={buttonClass('ghost', 'sm')}>
                    <History aria-hidden className="size-4" />
                    {t('home.history')}
                    <span className="sr-only">: {reading.title}</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function NewReading() {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const links = useWasichaiLinks()
  const navigate = useNavigate()
  const languages = useLanguages()
  const create = useCreateDraft()
  const study = languages.data?.languages.filter((l) => l.study) ?? []
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [touched, setTouched] = useState(false)
  const [language, setLanguage] = useState('')
  const [level, setLevel] = useState<string>('A1')
  const id = useId()
  const chosen = language || study[0]?.code || ''
  const finalSlug = touched ? slug : slugify(title)
  const valid = title.trim() && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(finalSlug) && chosen
  const error = create.error
  return (
    <section aria-labelledby={`${id}-title`} className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5 sm:p-6">
      <h2 id={`${id}-title`} className="font-display text-h3">
        {t('home.new')}
      </h2>
      <p className="mt-1 text-secondary text-ink-muted">{t('home.newLead')}</p>
      <form
        className="mt-5 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid) return
          create.mutate(
            { slug: finalSlug, language: chosen, level, title: title.trim() },
            { onSuccess: (draft) => navigate(links.to(ROUTES.studioDraft, { id: (draft as { id: string }).id })) }
          )
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('home.titleField')}</span>
          <input className={inputClass} value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} lang={chosen} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('home.slugField')}</span>
          <input
            className={inputClass}
            value={finalSlug}
            maxLength={120}
            onChange={(event) => {
              setTouched(true)
              setSlug(event.target.value.toLowerCase())
            }}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('home.languageField')}</span>
          <select className={inputClass} value={chosen} onChange={(event) => setLanguage(event.target.value)}>
            {study.map((l) => (
              <option key={l.code} value={l.code}>
                {t(`language.${l.code}`, { defaultValue: l.nativeName })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('home.levelField')}</span>
          <select className={inputClass} value={level} onChange={(event) => setLevel(event.target.value)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <button type="submit" className={buttonClass('primary')} disabled={!valid || create.isPending}>
            <FilePlus2 aria-hidden className="size-4" />
            {t('home.create')}
          </button>
          <p aria-live="polite" className="text-secondary text-danger">
            {error ? (error instanceof ApiError && error.status === 409 ? t('home.exists') : t('home.error')) : ''}
          </p>
        </div>
      </form>
    </section>
  )
}
