import { ApiError, useWasichaiLinks } from '@wasichai/core'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'
import { useLanguages } from '../../shared/api'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { StudioLayout } from '../../shared/StudioLayout'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useDraft, useSaveDraft } from './api'
import { AudioTab } from './AudioTab'
import type { Document, Draft, Question } from './contract'
import { DetailsTab } from './DetailsTab'
import { isDirty, localSentences, normalizeQuestion, TABS, translateInto, type Tab } from './draftModel'
import { STUDIO_MODULE_ID } from './i18n'
import { QuestionsTab } from './QuestionsTab'
import { ReviewTab } from './ReviewTab'
import { StatusBadge } from './StudioPage'
import { TextTab } from './TextTab'

export interface Edited {
  document: Document
  questions: Question[]
}

export function DraftPage() {
  return (
    <StudioLayout wide>
      <DraftLoader id={useParams().id ?? ''} />
    </StudioLayout>
  )
}

function DraftLoader({ id }: { id: string }) {
  const draft = useDraft(id)
  // aquí y no en el editor: el editor se monta otra vez al guardar, y el «Guardado» debe seguir a la vista
  const save = useSaveDraft(id)
  usePageTitle(draft.data?.document.title ?? '')
  if (draft.isError) return <ProblemState error={draft.error} onRetry={() => draft.refetch()} />
  if (!draft.data) return <Skeleton className="h-96" />
  // un editor nuevo por revisión: lo guardado manda sobre lo que había en pantalla
  return <Editor key={`${draft.data.id}-${draft.data.revision}`} draft={draft.data} save={save} />
}

function Editor({ draft, save }: { draft: Draft; save: ReturnType<typeof useSaveDraft> }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const links = useWasichaiLinks()
  const queryClient = useQueryClient()
  const languages = useLanguages()
  const [params, setParams] = useSearchParams()
  const tab: Tab = (TABS as string[]).includes(params.get('tab') ?? '') ? (params.get('tab') as Tab) : 'details'
  const [edited, setEdited] = useState<Edited>({ document: draft.document, questions: draft.questions })
  const editable = draft.status === 'DRAFT'
  const dirty = editable && isDirty(draft, edited)
  const into = translateInto(
    (languages.data?.languages ?? []).filter((l) => l.interfaceLanguage).map((l) => l.code),
    draft.language
  )
  const conflict = save.error instanceof ApiError && save.error.status === 409

  // salir con cambios sin guardar pregunta antes
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const select = (next: Tab) => setParams(next === 'details' ? {} : { tab: next }, { replace: true })
  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = TABS.indexOf(tab)
    const next = event.key === 'ArrowRight' ? TABS[(at + 1) % TABS.length] : event.key === 'ArrowLeft' ? TABS[(at + TABS.length - 1) % TABS.length] : null
    if (!next) return
    event.preventDefault()
    select(next)
    requestAnimationFrame(() => document.getElementById(`studio-tab-${next}`)?.focus())
  }
  const doSave = () => save.mutate({ revision: draft.revision, document: edited.document, questions: edited.questions.map(normalizeQuestion) })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to={links.to(ROUTES.studio)} className={buttonClass('ghost', 'sm', '-ml-3 mb-3')}>
          <ArrowLeft aria-hidden className="size-4" />
          {t('draft.back')}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 break-words font-read text-h1" lang={draft.language}>
            {edited.document.title || draft.slug}
          </h1>
          <StatusBadge status={draft.status} />
        </div>
        <p className="mt-1 text-secondary text-ink-muted">
          {draft.slug} · {draft.language.toUpperCase()} · {edited.document.level}
        </p>
        {draft.status === 'IN_REVIEW' && <p className="mt-3 rounded-[var(--radius-md)] bg-ochre/10 p-3">{t('draft.readOnly')}</p>}
        {draft.status === 'PUBLISHED' && (
          <p className="mt-3 flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] bg-sage/10 p-3">
            {t('draft.published', { version: draft.publishedVersion })}
            {links.has(ROUTES.reading) && (
              <Link to={links.to(ROUTES.reading, { slug: draft.slug })} className={buttonClass('quiet', 'sm')}>
                {t('draft.view')}
              </Link>
            )}
          </p>
        )}
        {draft.status === 'DISCARDED' && <p className="mt-3 rounded-[var(--radius-md)] bg-surface-muted p-3">{t('draft.discarded')}</p>}
      </div>

      <div
        role="tablist"
        aria-label={t('tabs.label')}
        onKeyDown={onTabKey}
        className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map((name) => (
          <button
            key={name}
            id={`studio-tab-${name}`}
            role="tab"
            type="button"
            aria-selected={tab === name}
            aria-controls="studio-panel"
            tabIndex={tab === name ? 0 : -1}
            onClick={() => select(name)}
            className={`min-h-11 shrink-0 whitespace-nowrap border-b-2 px-4 text-label transition-colors ${
              tab === name ? 'border-brand text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {t(`tabs.${name}`)}
          </button>
        ))}
      </div>

      <div id="studio-panel" role="tabpanel" aria-labelledby={`studio-tab-${tab}`} className="pb-24">
        <fieldset disabled={!editable} className="min-w-0">
          {tab === 'details' && <DetailsTab edited={edited} onChange={setEdited} />}
          {tab === 'text' && <TextTab edited={edited} onChange={setEdited} language={draft.language} into={into} />}
          {tab === 'questions' && (
            <QuestionsTab
              edited={edited}
              onChange={setEdited}
              sentences={localSentences(edited.document, draft.sentences)}
              into={into}
              language={draft.language}
            />
          )}
        </fieldset>
        {tab === 'audio' && <AudioTab draft={draft} dirty={dirty} />}
        {tab === 'review' && <ReviewTab draft={draft} dirty={dirty} onGo={select} />}
      </div>

      {editable && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface-raised/95 backdrop-blur">
          <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <p aria-live="polite" className={`min-w-0 flex-1 text-secondary ${save.isError ? 'text-danger' : 'text-ink-muted'}`}>
              {conflict ? t('draft.conflict') : save.isError ? t('draft.error') : dirty ? t('draft.unsaved') : save.isSuccess ? t('draft.saved') : ''}
            </p>
            {conflict && (
              <button
                type="button"
                className={buttonClass('secondary')}
                onClick={() => void queryClient.invalidateQueries({ queryKey: ['studio', 'draft', draft.id] })}
              >
                {t('draft.reload')}
              </button>
            )}
            <button type="button" className={buttonClass('primary')} disabled={!dirty || save.isPending} onClick={doSave}>
              <Save aria-hidden className="size-4" />
              {save.isPending ? t('draft.saving') : t('draft.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
