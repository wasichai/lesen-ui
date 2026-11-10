import { useWasichaiLinks } from '@wasichai/core'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { LoadingRegion, Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useWeekly } from './api'
import { PROGRESS_MODULE_ID } from './i18n'
import { AchievementItem, Card, DayBars, MetricValue, useDuration } from './parts'
import { shiftWeek, weekRange } from './progressModel'

const DATE = /^\d{4}-\d{2}-\d{2}$/

export function WeekPage() {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  usePageTitle(t('week.title'))
  return (
    <LearnerLayout>
      <Week />
    </LearnerLayout>
  )
}

// el resumen de una semana, de lunes a domingo: se puede ir a semanas anteriores; nunca compara para mal
function Week() {
  const { t, i18n } = useTranslation(PROGRESS_MODULE_ID)
  const links = useWasichaiLinks()
  const duration = useDuration()
  const [params, setParams] = useSearchParams()
  const asked = params.get('week')
  const weekly = useWeekly(asked && DATE.test(asked) ? asked : null)
  const go = (weeks: number) => weekly.data && setParams(weeks === 0 ? {} : { week: shiftWeek(weekly.data.weekStart, weeks) }, { replace: true })
  if (weekly.isError) return <ProblemState error={weekly.error} onRetry={() => weekly.refetch()} />
  if (!weekly.data)
    return (
      <LoadingRegion>
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-6 h-64" />
      </LoadingRegion>
    )
  const week = weekly.data
  const range = weekRange(week.weekStart, week.weekEnd, i18n.language)
  return (
    <div className="flex flex-col gap-8">
      <div>
        {links.has(ROUTES.progress) && (
          <Link to={links.to(ROUTES.progress)} className={buttonClass('ghost', 'sm', '-ml-3 mb-4')}>
            <ArrowLeft aria-hidden className="size-4" />
            {t('week.back')}
          </Link>
        )}
        <h1 className="font-display text-h1">{t('week.title')}</h1>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" className={buttonClass('secondary', 'icon', 'shrink-0')} onClick={() => go(-1)} aria-label={t('week.previous')}>
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <p className="min-w-0 flex-1 px-1 text-center font-display text-h4 sm:flex-none sm:px-2 sm:text-h3" aria-live="polite">
            {week.current ? `${t('week.current')} · ${range}` : range}
          </p>
          <button
            type="button"
            className={buttonClass('secondary', 'icon', 'shrink-0')}
            onClick={() => go(1)}
            aria-label={t('week.next')}
            disabled={week.current}
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
      <Card title={t('week.days')}>
        <DayBars days={week.days} caption={t('week.caption')} labels="weekday" />
        <p className="text-ink-muted">
          {week.met
            ? t('week.met', { active: week.activeDays, target: week.target })
            : week.activeDays > 0
              ? t('week.progress', { active: week.activeDays, target: week.target })
              : t('week.quiet')}
        </p>
      </Card>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricValue label={t('week.minutes')} metric={week.minutes} format={duration} />
        <MetricValue label={t('week.completed')} metric={week.readingsCompleted} />
        <MetricValue label={t('week.wordsRead')} metric={week.wordsRead} />
        <MetricValue label={t('week.wordsSaved')} metric={week.wordsSaved} />
        <MetricValue label={t('week.wordsReviewed')} metric={week.wordsReviewed} />
        <MetricValue label={t('week.assessments')} metric={week.assessments} />
      </dl>
      {week.achievements.length > 0 && (
        <Card title={t('week.earned')}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {week.achievements.map((achievement) => (
              <AchievementItem key={achievement.code} achievement={achievement} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
