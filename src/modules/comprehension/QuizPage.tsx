import { useWasichaiLinks } from '@wasichai/core'
import { ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { isNotFound } from '../../shared/api'
import { EmptyState } from '../../shared/EmptyState'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ProgressBar } from '../../shared/ProgressBar'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useAssessment, useReadingRef, useSubmitAttempt } from './api'
import type { Assessment } from './contract'
import { COMPREHENSION_MODULE_ID } from './i18n'
import { QuestionInput } from './QuestionInput'
import { emptyDraft, isAnswered, score, toInputs, type Draft } from './quizModel'

// una pregunta por pantalla, sin reloj ni penalización por volver atrás. La versión llega en la URL desde el lector; si
// falta, la vigente
export function QuizPage() {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  usePageTitle(t('title'))
  const { slug = '' } = useParams()
  const [search] = useSearchParams()
  const fromUrl = Number(search.get('version')) || undefined
  const reading = useReadingRef(slug)
  const version = fromUrl ?? reading.data?.reading.version
  const assessment = useAssessment(slug, version)
  return (
    <LearnerLayout>
      <div className="mx-auto w-full max-w-2xl">
        {assessment.isError || reading.isError ? (
          isNotFound(assessment.error) ? (
            <EmptyState icon={ClipboardCheck} title={t('none')} />
          ) : (
            <ProblemState error={assessment.error ?? reading.error} onRetry={() => void assessment.refetch()} />
          )
        ) : !assessment.data || !reading.data ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-48" />
          </div>
        ) : (
          <Quiz assessment={assessment.data} title={reading.data.reading.title} />
        )}
      </div>
    </LearnerLayout>
  )
}

function Quiz({ assessment, title }: { assessment: Assessment; title: string }) {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  const links = useWasichaiLinks()
  const navigate = useNavigate()
  const [step, setStep] = useState(-1)
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => Object.fromEntries(assessment.questions.map((q) => [q.id, emptyDraft(q)])))
  const submit = useSubmitAttempt(assessment.id)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (step >= 0) heading.current?.focus()
  }, [step])
  const total = assessment.questions.length
  const reader = links.to(ROUTES.reader, { slug: assessment.slug })
  const last = assessment.lastAttempt

  if (step < 0)
    return (
      <section className="flex flex-col items-start gap-5">
        <h1 className="font-display text-h1">{t('title')}</h1>
        <p className="text-[18px]">{t('lead', { count: total, title })}</p>
        {last && (
          <p className="rounded-[var(--radius-lg)] bg-surface-muted px-4 py-3">
            {t('last', { points: score(last).points.toLocaleString(), total: last.total })}{' '}
            {links.has(ROUTES.attempt) && (
              <Link to={links.to(ROUTES.attempt, { id: last.id })} className="text-link underline underline-offset-4">
                {t('seeLast')}
              </Link>
            )}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="button" className={buttonClass('primary', 'md', 'px-8')} onClick={() => setStep(0)}>
            {last ? t('again') : t('start')}
            <ArrowRight aria-hidden className="size-4" />
          </button>
          <Link to={reader} className={buttonClass('secondary')}>
            {t('backToText')}
          </Link>
        </div>
      </section>
    )

  const question = assessment.questions[step]!
  const draft = drafts[question.id] ?? emptyDraft(question)
  const unanswered = assessment.questions.filter((q) => !isAnswered(q, drafts[q.id])).length
  const isLast = step === total - 1
  const promptId = `prompt-${question.id}`
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        if (!isLast) return setStep(step + 1)
        submit.mutate(toInputs(assessment.questions, drafts), {
          onSuccess: (attempt) => void navigate(links.to(ROUTES.attempt, { id: attempt.id }))
        })
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 text-secondary text-ink-muted">
          <span>{t('progress', { current: step + 1, total })}</span>
          <span className="rounded-full bg-surface-muted px-3 py-0.5 font-semibold">{t(`type.${question.type}`)}</span>
        </div>
        <ProgressBar percent={((step + 1) / total) * 100} label={t('progress', { current: step + 1, total })} />
      </div>
      <h1 className="sr-only">{t('title')}</h1>
      <h2 id={promptId} ref={heading} tabIndex={-1} className="font-display text-h2 leading-snug">
        {question.prompt}
      </h2>
      {question.word && (
        <p>
          <span className="rounded bg-mark-saved px-2 py-1 font-read text-[19px] text-mark-saved-ink" lang={assessment.language}>
            {question.word.text}
          </span>
        </p>
      )}
      <QuestionInput
        key={question.id}
        question={question}
        draft={draft}
        labelledBy={promptId}
        language={assessment.language}
        onChange={(next) => setDrafts((all) => ({ ...all, [question.id]: next }))}
      />
      {isLast && unanswered > 0 && (
        <p role="status" className="rounded-[var(--radius-lg)] bg-notice-soft px-4 py-3 text-notice">
          {t('unanswered', { count: unanswered })}
        </p>
      )}
      {submit.isError && <ProblemState error={submit.error} />}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <button type="button" className={buttonClass('ghost')} onClick={() => setStep(step - 1)}>
          <ArrowLeft aria-hidden className="size-4" />
          {t('previous')}
        </button>
        <button type="submit" className={buttonClass('primary', 'md', 'px-8')} disabled={submit.isPending}>
          {isLast ? (submit.isPending ? t('sending') : t('finish')) : isAnswered(question, draft) ? t('next') : t('skip')}
          {!isLast && <ArrowRight aria-hidden className="size-4" />}
        </button>
      </div>
    </form>
  )
}
