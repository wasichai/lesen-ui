import { useWasichaiLinks } from '@wasichai/core'
import { ApiError } from '@wasichai/core'
import { Check, Sparkles } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useLanguages } from '../../shared/api'
import { CommissionProgress } from '../../shared/CommissionProgress'
import { ROUTES } from '../../shared/routes'
import { LEVELS, MINUTES, TEXT_KINDS, type ReadingFormat } from '../../shared/schemas'
import { buttonClass, chipClass } from '../../shared/ui'
import { useCommission, useCommissionCreate, useCommissionStatus } from './api'
import { fieldClass } from './DetailsTab'
import { STUDIO_MODULE_ID } from './i18n'

// encargar una lectura o un libro ilustrado (ADR-0015 del backend): se escribe y se ilustra en segundo plano y termina en
// un borrador que pasa por la revisión de siempre. Sin quien escriba en el servidor, se dice y no se ofrece
export function GeneratePanel() {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const links = useWasichaiLinks()
  const status = useCommissionStatus()
  const languages = useLanguages()
  const create = useCommissionCreate()
  const study = languages.data?.languages.filter((l) => l.study) ?? []
  const [language, setLanguage] = useState('')
  const [level, setLevel] = useState<string>('A1')
  const [format, setFormat] = useState<ReadingFormat>('PICTURE_BOOK')
  const [kind, setKind] = useState<(typeof TEXT_KINDS)[number]>('STORY')
  const [minutes, setMinutes] = useState<number>(2)
  const [prompt, setPrompt] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)
  const job = useCommission(jobId)
  const id = useId()
  const chosen = language || study[0]?.code || ''
  if (status.data && !status.data.available)
    return (
      <section aria-labelledby={`${id}-title`} className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5 sm:p-6">
        <h2 id={`${id}-title`} className="font-read text-h3">
          {t('generate.title')}
        </h2>
        <p className="mt-1 text-secondary text-ink-muted">{t('generate.unavailable')}</p>
      </section>
    )
  return (
    <section aria-labelledby={`${id}-title`} className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-5 sm:p-6">
      <h2 id={`${id}-title`} className="flex items-center gap-2 font-read text-h3">
        <Sparkles aria-hidden className="size-5 text-brand" />
        {t('generate.title')}
      </h2>
      <p className="mt-1 text-secondary text-ink-muted">{t('generate.lead')}</p>
      <form
        className="mt-5 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (!chosen) return
          create.mutate(
            { language: chosen, level, minutes, kind, format, topics: [], prompt: prompt.trim() || null },
            { onSuccess: (commission) => setJobId(commission.id) }
          )
        }}
      >
        <fieldset className="flex flex-col gap-2 md:col-span-2">
          <legend className="mb-1 text-label">{t('details.format')}</legend>
          <div className="flex flex-wrap gap-2">
            {(['PICTURE_BOOK', 'TEXT'] as const).map((value) => (
              <button key={value} type="button" aria-pressed={format === value} className={chipClass(format === value)} onClick={() => setFormat(value)}>
                {format === value && <Check aria-hidden className="size-4" />}
                {t(`format.${value}`)}
              </button>
            ))}
          </div>
          {format === 'PICTURE_BOOK' && status.data && !status.data.illustrations && (
            <span className="text-secondary text-ink-muted">{t('generate.noIllustrations')}</span>
          )}
        </fieldset>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('home.languageField')}</span>
          <select className={fieldClass} value={chosen} onChange={(event) => setLanguage(event.target.value)}>
            {study.map((l) => (
              <option key={l.code} value={l.code}>
                {t(`language.${l.code}`, { defaultValue: l.nativeName })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('home.levelField')}</span>
          <select className={fieldClass} value={level} onChange={(event) => setLevel(event.target.value)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('generate.kind')}</span>
          <select className={fieldClass} value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
            {TEXT_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`generate.kinds.${k}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('generate.minutes')}</span>
          <select className={fieldClass} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {t('generate.minutesValue', { count: m })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-label">{t('generate.prompt')}</span>
          <span className="text-secondary text-ink-muted">{t('generate.promptHint')}</span>
          <textarea className={`${fieldClass} min-h-24`} maxLength={500} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </label>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <button
            type="submit"
            className={buttonClass('primary')}
            disabled={!chosen || create.isPending || (job.data !== undefined && job.data.status !== 'READY' && job.data.status !== 'FAILED')}
          >
            <Sparkles aria-hidden className="size-4" />
            {t('generate.submit')}
          </button>
          <p aria-live="polite" className="text-secondary text-danger">
            {create.error ? (create.error instanceof ApiError && create.error.status === 503 ? t('generate.unavailable') : t('generate.error')) : ''}
          </p>
        </div>
      </form>
      {job.data && (
        <div className="mt-6 flex flex-col gap-3 rounded-[var(--radius-md)] border border-border p-4" data-testid="commission">
          <CommissionProgress commission={job.data} />
          {job.data.status === 'READY' && job.data.draftId && (
            <Link to={links.to(ROUTES.studioDraft, { id: job.data.draftId })} className={buttonClass('secondary', 'sm', 'self-start')}>
              {t('generate.open')}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
