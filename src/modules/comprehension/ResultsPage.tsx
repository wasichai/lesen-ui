import { useWasichaiLinks } from '@wasichai/core'
import { CheckCircle2, CircleDashed, CircleHelp, Loader2, RotateCcw, Sparkles, type LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useAttempt, useSelfAssessment, useSentences } from './api'
import type { Answer, Attempt, Question, Result } from './contract'
import { COMPREHENSION_MODULE_ID } from './i18n'
import { describe, groupOf, score, type Group } from './quizModel'

const ICONS: Record<Result, LucideIcon> = {
  CORRECT: CheckCircle2,
  PARTIAL: CircleDashed,
  INCORRECT: RotateCcw,
  PENDING: Loader2,
  UNGRADED: CircleHelp
}

const TONES: Record<Result, string> = {
  CORRECT: 'bg-success-soft text-success',
  PARTIAL: 'bg-notice-soft text-notice',
  INCORRECT: 'bg-surface-muted text-ink',
  PENDING: 'bg-surface-muted text-ink-muted',
  UNGRADED: 'bg-brand-soft text-brand-strong'
}

// los resultados de un intento: lo que salió bien, lo que conviene volver a mirar (con la solución, la explicación y la
// oración del texto) y lo que espera valoración. Sin notas rojas ni porcentajes de examen
export function ResultsPage() {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  usePageTitle(t('results.title'))
  const { id = '' } = useParams()
  const attempt = useAttempt(id)
  return (
    <LearnerLayout>
      <div className="mx-auto w-full max-w-3xl">
        {attempt.isError ? (
          <ProblemState error={attempt.error} onRetry={() => void attempt.refetch()} />
        ) : !attempt.data ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <Results attempt={attempt.data} />
        )}
      </div>
    </LearnerLayout>
  )
}

function Results({ attempt }: { attempt: Attempt }) {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  const links = useWasichaiLinks()
  const sentences = useSentences(attempt.slug, attempt.version)
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => title.current?.focus(), [])
  const { points, graded } = score(attempt.summary)
  const waiting = attempt.summary.pending + attempt.summary.ungraded
  const byId = new Map(attempt.questions.map((q) => [q.id, q]))
  const text = sentences.data?.sentences ?? new Map<string, string>()
  const groups: Group[] = ['strength', 'improve', 'waiting']
  const heading: Record<Group, string> = { strength: t('results.strengths'), improve: t('results.improve'), waiting: t('results.waitingTitle') }
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-start gap-3 rounded-[28px] border border-border bg-surface-raised p-6 sm:p-8">
        <div aria-hidden className="grid size-14 place-items-center rounded-full bg-brand text-on-brand">
          <Sparkles className="size-7" />
        </div>
        <h1 ref={title} tabIndex={-1} className="font-display text-h1">
          {t('results.title')}
        </h1>
        <p className="text-[20px] font-semibold">
          {waiting > 0
            ? t('results.score', { points: points.toLocaleString(), graded })
            : t('results.scoreTotal', { points: points.toLocaleString(), total: attempt.summary.total })}
        </p>
        {waiting > 0 && (
          <p role="status" className="text-ink-muted">
            {t('results.waiting', { count: waiting })}
          </p>
        )}
      </header>
      {groups.map((group) => {
        const answers = attempt.answers.filter((a) => groupOf(a.result) === group)
        if (answers.length === 0) return null
        return (
          <section key={group} aria-labelledby={`group-${group}`} className="flex flex-col gap-4">
            <h2 id={`group-${group}`} className="font-display text-h2">
              {heading[group]}
            </h2>
            <ul className="flex flex-col gap-4">
              {answers.map((answer) => (
                <li key={answer.questionId}>
                  <AnswerCard attempt={attempt} answer={answer} question={byId.get(answer.questionId)!} sentences={text} language={sentences.data?.language} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Link to={`${links.to(ROUTES.quiz, { slug: attempt.slug })}?version=${attempt.version}`} className={buttonClass('secondary')}>
          {t('results.retry')}
        </Link>
        <Link to={links.to(ROUTES.reader, { slug: attempt.slug })} className={buttonClass('secondary')}>
          {t('results.reader')}
        </Link>
        {links.has(ROUTES.review) && (
          <Link to={links.to(ROUTES.review)} className={buttonClass('primary')}>
            {t('results.vocabulary')}
          </Link>
        )}
      </div>
    </div>
  )
}

function AnswerCard({
  attempt,
  answer,
  question,
  sentences,
  language
}: {
  attempt: Attempt
  answer: Answer
  question: Question
  sentences: Map<string, string>
  language: string | undefined
}) {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  const links = useWasichaiLinks()
  const self = useSelfAssessment(attempt.id)
  const Icon = ICONS[answer.result]
  const shown = (values: string[]) => values.map((v) => (question.type === 'TRUE_FALSE' ? t(v === 'true' ? 'true' : 'false') : v))
  const given = shown(describe(question, answer.response))
  const solution = shown(describe(question, answer.solution))
  const open = question.type === 'SHORT_ANSWER'
  const refs = answer.citations.length > 0 ? answer.citations : answer.refs
  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface-raised p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="max-w-prose font-display text-h4 leading-snug">{question.prompt}</h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-secondary font-bold ${TONES[answer.result]}`}>
          <Icon aria-hidden className={`size-4 ${answer.result === 'PENDING' ? 'animate-spin motion-reduce:animate-none' : ''}`} />
          {t(`results.result.${answer.result}`)}
        </span>
      </div>
      <dl className="grid gap-3 text-[16.5px]">
        <div>
          <dt className="text-eyebrow uppercase text-ink-muted">{t('results.yourAnswer')}</dt>
          <dd className="mt-1">
            {given.filter(Boolean).length > 0 ? <AnswerText values={given} lang={open ? undefined : language} /> : t('results.noAnswer')}
          </dd>
        </div>
        {(answer.result !== 'CORRECT' || open) && solution.length > 0 && (
          <div>
            <dt className="text-eyebrow uppercase text-ink-muted">{open ? t('results.model') : t('results.solution')}</dt>
            <dd className="mt-1 font-semibold">
              <AnswerText values={solution} lang={open ? undefined : language} />
            </dd>
          </div>
        )}
        <div>
          <dt className="text-eyebrow uppercase text-ink-muted">{t('results.why')}</dt>
          <dd className="mt-1">{answer.justification ?? answer.explanation}</dd>
        </div>
      </dl>
      {refs.some((ref) => sentences.has(ref)) && (
        <figure className="flex flex-col gap-1 border-l-2 border-brand-soft pl-4">
          <figcaption className="text-eyebrow uppercase text-ink-muted">{t('results.inText')}</figcaption>
          {refs.map((ref) =>
            sentences.has(ref) ? (
              <blockquote key={ref} className="font-read text-[17px] leading-relaxed" lang={language}>
                {sentences.get(ref)}{' '}
                <Link
                  to={`${links.to(ROUTES.reader, { slug: attempt.slug })}#${ref}`}
                  className="font-sans text-secondary text-link underline underline-offset-4"
                >
                  {t('results.openInText')}
                </Link>
              </blockquote>
            ) : null
          )}
        </figure>
      )}
      {answer.result === 'PENDING' && <p className="text-secondary text-ink-muted">{t('results.pending')}</p>}
      {answer.result === 'UNGRADED' && (
        <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] bg-surface-muted p-4">
          <p id={`self-${answer.questionId}`} className="font-semibold">
            {t('results.selfPrompt')}
          </p>
          <div role="group" aria-labelledby={`self-${answer.questionId}`} className="flex flex-wrap gap-2">
            {(['CORRECT', 'PARTIAL', 'INCORRECT'] as const).map((result) => (
              <button
                key={result}
                type="button"
                className={buttonClass('secondary', 'sm')}
                disabled={self.isPending}
                onClick={() => self.mutate({ questionId: answer.questionId, result })}
              >
                {t(`results.self.${result}`)}
              </button>
            ))}
          </div>
        </div>
      )}
      {answer.evaluator && answer.evaluator !== 'RULE' && <p className="text-secondary text-ink-muted">{t(`results.evaluator.${answer.evaluator}`)}</p>}
    </article>
  )
}

function AnswerText({ values, lang }: { values: string[]; lang: string | undefined }) {
  if (values.length === 1) return <span lang={lang}>{values[0]}</span>
  return (
    <ol className="list-inside list-decimal">
      {values.map((value, i) => (
        <li key={i} lang={lang}>
          {value}
        </li>
      ))}
    </ol>
  )
}
