import { ApiError, useAuth, useWasichaiLinks } from '@wasichai/core'
import { BookPlus, CircleAlert, CircleCheck, Info } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useLanguages } from '../../shared/api'
import { formatDate } from '../../shared/format'
import { ROUTES } from '../../shared/routes'
import { Sheet } from '../../shared/Sheet'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { useIsWide } from '../../shared/useMediaQuery'
import { useAddEntry, useCheck, useDiscard, useStep } from './api'
import { POS, type Draft, type Issue, type StudioEvent } from './contract'
import { fieldClass } from './DetailsTab'
import { entryKey, groupIssues, issueTab, splitList, type Tab } from './draftModel'
import { STUDIO_MODULE_ID } from './i18n'

// la comprobación, el paso siguiente del flujo (enviar, devolver, publicar) y el historial del borrador
export function ReviewTab({ draft, dirty, onGo }: { draft: Draft; dirty: boolean; onGo: (tab: Tab) => void }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const links = useWasichaiLinks()
  const check = useCheck(draft.id, draft.revision)
  const [entry, setEntry] = useState<string | null>(null)
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        {!check.data ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            <div
              className={`flex items-start gap-3 rounded-[var(--radius-card)] border p-4 ${check.data.ready ? 'border-sage/40 bg-sage/10' : 'border-danger/40 bg-danger/5'}`}
              role="status"
            >
              {check.data.ready ? (
                <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
              ) : (
                <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
              )}
              <div>
                <p className="font-semibold">{check.data.ready ? t('review.ready') : t('review.notReady')}</p>
                <p className="text-secondary text-ink-muted">
                  {t('review.stats', { words: check.data.words, sentences: check.data.sentences, questions: check.data.questions })}
                  {check.data.alignedWords !== null && ` · ${t('review.aligned', { aligned: check.data.alignedWords, words: check.data.words })}`}
                </p>
              </div>
            </div>
            <Issues title={t('review.errors')} issues={check.data.errors} tone="error" onGo={onGo} onEntry={setEntry} editable={draft.status === 'DRAFT'} />
            <Issues
              title={t('review.warnings')}
              issues={check.data.warnings}
              tone="warning"
              onGo={onGo}
              onEntry={setEntry}
              editable={draft.status === 'DRAFT'}
            />
          </>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <Steps draft={draft} dirty={dirty} ready={check.data?.ready ?? false} />
        <section aria-labelledby="draft-history">
          <h2 id="draft-history" className="mb-3 font-read text-h3">
            {t('review.history')}
          </h2>
          <Events events={draft.events} />
          {draft.baseVersion !== null && links.has(ROUTES.studioHistory) && (
            <Link to={links.to(ROUTES.studioHistory, { slug: draft.slug })} className={buttonClass('quiet', 'sm', 'mt-2 -ml-4')}>
              {t('review.readingHistory')}
            </Link>
          )}
        </section>
      </div>
      <Sheet
        open={entry !== null}
        onOpenChange={(open) => !open && setEntry(null)}
        title={t('entry.title', { word: entry ?? '' })}
        side={useIsWide() ? 'right' : 'bottom'}
      >
        {entry && <EntryForm word={entry} language={draft.language} onDone={() => setEntry(null)} />}
      </Sheet>
    </div>
  )
}

function Issues({
  title,
  issues,
  tone,
  onGo,
  onEntry,
  editable
}: {
  title: string
  issues: Issue[]
  tone: 'error' | 'warning'
  onGo: (tab: Tab) => void
  onEntry: (word: string) => void
  editable: boolean
}) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const id = useId()
  if (issues.length === 0 && tone === 'error') return null
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 font-read text-h3">
        {title} <span className="text-ink-muted">({issues.length})</span>
      </h2>
      {issues.length === 0 ? (
        <p className="text-ink-muted">{t('review.allGood')}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {groupIssues(issues).map(([code, list]) => {
            const tab = issueTab(list[0]!)
            return (
              <li key={code} className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-4">
                <ul className="flex flex-col gap-2">
                  {list.slice(0, 40).map((issue, i) => (
                    <li key={i} className="flex flex-wrap items-start gap-x-3 gap-y-1">
                      {tone === 'error' ? (
                        <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
                      ) : (
                        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                      )}
                      <span className="min-w-0 flex-1">
                        {t(`issue.${issue.code}`, {
                          ref: issue.ref ?? '',
                          detail: issue.detail ?? '',
                          code: issue.code,
                          language: issue.detail ? t(`language.${issue.detail}`, { defaultValue: issue.detail }) : '',
                          defaultValue: t('issue.other', { code: issue.code, ref: issue.ref ?? '', detail: issue.detail ?? '' })
                        })}
                      </span>
                      {issue.code === 'UNRESOLVED' && editable && issue.ref && (
                        <button type="button" className={buttonClass('secondary', 'sm')} onClick={() => onEntry(issue.ref!)}>
                          <BookPlus aria-hidden className="size-4" />
                          {t('review.addEntry')}
                          <span className="sr-only">: {issue.ref}</span>
                        </button>
                      )}
                    </li>
                  ))}
                  {list.length > 40 && <li className="text-secondary text-ink-muted">+{list.length - 40}</li>}
                </ul>
                {tab !== 'review' && (
                  <button type="button" className={buttonClass('quiet', 'sm', 'mt-2 -ml-4')} onClick={() => onGo(tab)}>
                    {t('review.goTo', { tab: t(`tabs.${tab}`) })}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Steps({ draft, dirty, ready }: { draft: Draft; dirty: boolean; ready: boolean }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const { can } = useAuth()
  const links = useWasichaiLinks()
  const navigate = useNavigate()
  const submit = useStep(draft.id, 'submit')
  const back = useStep(draft.id, 'return')
  const publish = useStep(draft.id, 'publish')
  const discard = useDiscard(draft.id)
  const [note, setNote] = useState('')
  const [confirming, setConfirming] = useState(false)
  const noteId = useId()
  const publisher = can('estudio', 'PUBLICAR')
  const failed = submit.error ?? back.error ?? publish.error ?? discard.error
  const open = draft.status === 'DRAFT' || draft.status === 'IN_REVIEW'
  if (!open) return null
  return (
    <section aria-labelledby="draft-steps" className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4">
      <h2 id="draft-steps" className="sr-only">
        {t('tabs.review')}
      </h2>
      <label htmlFor={noteId} className="text-label">
        {draft.status === 'IN_REVIEW' && publisher ? t('review.returnNote') : t('review.note')}
      </label>
      <textarea id={noteId} className={`${fieldClass} min-h-20`} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        {draft.status === 'DRAFT' && (
          <button type="button" className={buttonClass('primary')} disabled={!ready || dirty || submit.isPending} onClick={() => submit.mutate(note)}>
            {t('review.submit')}
          </button>
        )}
        {draft.status === 'IN_REVIEW' && publisher && (
          <>
            <button type="button" className={buttonClass('primary')} disabled={!ready || publish.isPending} onClick={() => publish.mutate(note)}>
              {publish.isPending ? t('review.publishing') : t('review.publish')}
            </button>
            <button type="button" className={buttonClass('secondary')} disabled={!note.trim() || back.isPending} onClick={() => back.mutate(note)}>
              {t('review.return')}
            </button>
          </>
        )}
      </div>
      {draft.status === 'IN_REVIEW' && !publisher && <p className="text-secondary text-ink-muted">{t('review.noPublish')}</p>}
      <p aria-live="polite" className="text-secondary text-danger empty:hidden">
        {failed ? [t('review.stepError'), ...(failed instanceof ApiError ? failed.violations.map((v) => v.message) : [])].join(' · ') : ''}
      </p>
      <div className="border-t border-border pt-3">
        {confirming ? (
          <div role="alert" className="flex flex-col gap-2">
            <p>{t('review.discardConfirm')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonClass('secondary')}
                onClick={() => discard.mutate(undefined, { onSuccess: () => navigate(links.to(ROUTES.studio)) })}
              >
                {t('review.confirm')}
              </button>
              <button type="button" className={buttonClass('ghost')} onClick={() => setConfirming(false)}>
                {t('review.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={buttonClass('ghost', 'sm', '-ml-3')} onClick={() => setConfirming(true)}>
            {t('review.discard')}
          </button>
        )}
      </div>
    </section>
  )
}

export function Events({ events }: { events: StudioEvent[] }) {
  const { t, i18n } = useTranslation(STUDIO_MODULE_ID)
  return (
    <ol className="flex flex-col gap-3 border-l-2 border-border pl-4">
      {events.map((event, i) => (
        <li key={i}>
          <p className="font-semibold">{t(`event.${event.action}`, { version: event.version })}</p>
          <p className="text-secondary text-ink-muted">
            {event.actor} · {formatDate(event.at, i18n.language)}{' '}
            {new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }).format(new Date(event.at))}
          </p>
          {event.note && <p className="mt-1 rounded-[var(--radius-md)] bg-surface-muted px-3 py-2 text-secondary">{event.note}</p>}
        </li>
      ))}
    </ol>
  )
}

// una entrada nueva del diccionario curado para una palabra sin entrada
function EntryForm({ word, language, onDone }: { word: string; language: string; onDone: () => void }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const add = useAddEntry()
  const [lemma, setLemma] = useState(word.toLowerCase())
  const [pos, setPos] = useState<string>('noun')
  const [forms, setForms] = useState(word.toLowerCase() === word ? '' : word)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const languages = useLanguages()
  const into = (languages.data?.languages ?? []).filter((l) => l.interfaceLanguage && l.code !== language).map((l) => l.code)
  const valid = lemma.trim() && into.some((l) => splitList(translations[l] ?? '').length)
  return (
    <form
      className="mt-4 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!valid) return
        add.mutate(
          {
            language,
            entry: {
              key: entryKey(language, lemma),
              lemma: lemma.trim(),
              pos,
              forms: splitList(forms),
              senses: [{ translations: Object.fromEntries(into.map((l) => [l, splitList(translations[l] ?? '')] as const).filter(([, v]) => v.length > 0)) }]
            }
          },
          { onSuccess: onDone }
        )
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-label">{t('entry.lemma')}</span>
        <input className={fieldClass} lang={language} value={lemma} maxLength={80} onChange={(e) => setLemma(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-label">{t('entry.pos')}</span>
        <select className={fieldClass} value={pos} onChange={(e) => setPos(e.target.value)}>
          {POS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-label">{t('entry.forms')}</span>
        <input className={fieldClass} lang={language} value={forms} onChange={(e) => setForms(e.target.value)} />
      </label>
      {into.map((code) => (
        <label key={code} className="flex flex-col gap-1.5">
          <span className="text-label">{t('entry.translation', { language: t(`language.${code}`) })}</span>
          <input
            className={fieldClass}
            lang={code}
            value={translations[code] ?? ''}
            onChange={(e) => setTranslations({ ...translations, [code]: e.target.value })}
          />
        </label>
      ))}
      <button type="submit" className={buttonClass('primary', 'md', 'self-start')} disabled={!valid || add.isPending}>
        <BookPlus aria-hidden className="size-4" />
        {t('entry.save')}
      </button>
      <p aria-live="polite" className="text-secondary text-danger empty:hidden">
        {add.error ? (add.error instanceof ApiError && add.error.status === 409 ? t('entry.exists') : t('entry.error')) : ''}
      </p>
    </form>
  )
}
