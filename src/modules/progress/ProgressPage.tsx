import { useWasichaiLinks } from '@wasichai/core'
import { ArrowRight, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { APP_NAMESPACE } from '../../shared/appMessages'
import { languageName } from '../../shared/format'
import { useDeviceTimeZoneOnce, useGoals } from '../../shared/goals'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ProgressBar } from '../../shared/ProgressBar'
import { ROUTES } from '../../shared/routes'
import { LoadingRegion, Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useAchievements, useDashboard } from './api'
import type { Dashboard } from './contract'
import { PROGRESS_MODULE_ID } from './i18n'
import { AchievementItem, Card, DayBars, KindTag, MetricValue, ScoreList, useDuration, WeekBars } from './parts'
import { activeDays, dayName, goalPercent, sortAchievements, streakMessage, thisWeek } from './progressModel'

export function ProgressPage() {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  usePageTitle(t('title'))
  return (
    <LearnerLayout>
      <Progress />
    </LearnerLayout>
  )
}

function Progress() {
  const { t, i18n } = useTranslation(PROGRESS_MODULE_ID)
  const goals = useGoals()
  useDeviceTimeZoneOnce(goals.data)
  const dashboard = useDashboard()
  if (dashboard.isError) return <ProblemState error={dashboard.error} onRetry={() => dashboard.refetch()} />
  if (!dashboard.data)
    return (
      <LoadingRegion>
        <Skeleton className="h-10 w-1/2" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="mt-6 h-64" />
      </LoadingRegion>
    )
  const data = dashboard.data
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-h1">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">{t('lead')}</p>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-secondary text-ink-muted">
          {t('language', { language: languageName(data.language, i18n.language) })} · {t('legend')}
          <KindTag kind="MEASURED" />
          <KindTag kind="ESTIMATED" />
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Today data={data} />
        <Week data={data} />
      </div>
      <Card title={t('days.title')}>
        <DayBars days={data.days} caption={t('days.caption')} />
        <p className="text-secondary text-ink-muted">{t('days.summary', { active: activeDays(data.days) })}</p>
      </Card>
      <Reading data={data} />
      <Vocabulary data={data} />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Comprehension data={data} />
        <Level data={data} />
      </div>
      <Achievements />
    </div>
  )
}

function Today({ data }: { data: Dashboard }) {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  const minutes = data.goal.todayMinutes.value
  const percent = goalPercent(minutes, data.goal.dailyMinutes)
  return (
    <Card title={t('today.title')}>
      <p className="font-display text-h2 tabular-nums">{t('today.minutes', { minutes, goal: data.goal.dailyMinutes })}</p>
      <ProgressBar percent={percent} label={t('today.goalLabel')} />
      <p className="text-ink-muted">
        {data.goal.met ? t('today.met') : minutes > 0 ? t('today.progress', { minutes, goal: data.goal.dailyMinutes }) : t('today.rest')}
      </p>
    </Card>
  )
}

function Week({ data }: { data: Dashboard }) {
  const { t, i18n } = useTranslation(PROGRESS_MODULE_ID)
  const links = useWasichaiLinks()
  const streak = data.streak
  const message = streakMessage(streak)
  const days = thisWeek(data.days, data.today)
  return (
    <Card
      title={t('streak.title')}
      action={
        links.has(ROUTES.profile) && (
          <Link to={links.to(ROUTES.profile)} className={buttonClass('quiet', 'sm')}>
            {t('streak.edit')}
          </Link>
        )
      }
    >
      <p className="font-display text-h2">{t('streak.days', { active: streak.activeThisWeek, target: streak.target })}</p>
      <ol className="flex gap-2" aria-label={t('streak.days', { active: streak.activeThisWeek, target: streak.target })}>
        {days.map((day) => (
          <li key={day.date} className="flex flex-col items-center gap-1">
            <span
              aria-hidden
              className={`grid size-9 place-items-center rounded-full text-[12.5px] font-semibold ${
                day.active ? 'bg-brand text-on-brand' : 'border border-dashed border-border-control text-ink-muted'
              }`}
            >
              {dayName(day.date, i18n.language, 'narrow')}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-ink-muted">
        {message.key === 'start'
          ? t('streak.start', { left: message.left })
          : message.key === 'ongoing'
            ? t('streak.ongoing', { count: message.count, left: message.left })
            : t('streak.metThisWeek', { count: message.count })}
      </p>
      <p className="text-secondary text-ink-muted">
        {t('streak.best', { count: streak.best })} · {t('streak.rest')}
      </p>
      {links.has(ROUTES.week) && (
        <Link to={links.to(ROUTES.week)} className={buttonClass('secondary', 'sm', 'self-start')}>
          {t('week.open')}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </Card>
  )
}

function Reading({ data }: { data: Dashboard }) {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  const duration = useDuration()
  const r = data.reading
  return (
    <Card title={t('reading.title')}>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricValue label={t('reading.completed')} metric={r.completed} />
        <MetricValue label={t('reading.started')} metric={r.started} />
        <MetricValue label={t('reading.minutes')} metric={r.minutes} format={duration} />
        <MetricValue label={t('reading.wordsRead')} metric={r.wordsRead} />
      </dl>
      <p className="text-secondary text-ink-muted">{t('reading.thisWeek', { minutes: r.minutesThisWeek.value, completed: r.completedThisWeek.value })}</p>
    </Card>
  )
}

function Vocabulary({ data }: { data: Dashboard }) {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  const links = useWasichaiLinks()
  const v = data.vocabulary
  return (
    <Card
      title={t('vocabulary.title')}
      action={
        v.due.value > 0 &&
        links.has(ROUTES.review) && (
          <Link to={links.to(ROUTES.review)} className={buttonClass('primary', 'sm')}>
            {t('vocabulary.review')}
          </Link>
        )
      }
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricValue label={t('vocabulary.encountered')} metric={v.encountered} />
        <MetricValue label={t('vocabulary.saved')} metric={v.saved} />
        <MetricValue label={t('vocabulary.learning')} metric={v.learning} />
        <MetricValue label={t('vocabulary.mastered')} metric={v.mastered} />
        <MetricValue label={t('vocabulary.due')} metric={v.due} />
      </dl>
      <h3 className="text-label">{t('vocabulary.growth')}</h3>
      <WeekBars weeks={v.growth} caption={t('vocabulary.growthCaption')} />
    </Card>
  )
}

function Comprehension({ data }: { data: Dashboard }) {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const c = data.comprehension
  return (
    <Card title={t('comprehension.title')}>
      {c.average === null ? (
        <p className="text-ink-muted">{t('comprehension.none')}</p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3">
            <MetricValue label={t('comprehension.average')} metric={c.average} format={(value) => `${value} %`} />
            <MetricValue label={t('comprehension.answered')} metric={c.answered} />
          </dl>
          <div className="grid gap-6 sm:grid-cols-2">
            <ScoreList title={t('comprehension.byType')} scores={c.byType} label={(key) => t(`comprehension.type.${key}`, { defaultValue: key })} />
            <ScoreList title={t('comprehension.byLevel')} scores={c.byLevel} label={(key) => `${key} · ${app(`level.${key}`)}`} />
          </div>
          <p className="text-secondary text-ink-muted">{t('comprehension.note')}</p>
        </>
      )}
    </Card>
  )
}

function Level({ data }: { data: Dashboard }) {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const level = data.level
  return (
    <Card title={t('level.title')}>
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="font-display text-h2">
          <span aria-hidden>≈ </span>
          {level.level}
        </span>
        <span className="text-ink-muted">{app(`level.${level.level}`)}</span>
        <KindTag kind={level.kind} />
      </p>
      <p className="sr-only">{t('level.estimated', { level: level.level })}</p>
      <p className="text-ink-muted">{t(`level.${level.signal}`)}</p>
      {level.answeredAtLevel < 8 && <p className="text-secondary text-ink-muted">{t('level.few')}</p>}
      {links.has(ROUTES.profile) && (
        <Link to={links.to(ROUTES.profile)} className={buttonClass('quiet', 'sm', 'self-start -ml-4')}>
          {t('level.profile')}
        </Link>
      )}
    </Card>
  )
}

function Achievements() {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  const achievements = useAchievements()
  return (
    <Card title={t('achievements.title')} id="achievements">
      {achievements.isError ? (
        <ProblemState error={achievements.error} onRetry={() => achievements.refetch()} />
      ) : !achievements.data ? (
        <Skeleton className="h-32" />
      ) : (
        <>
          {achievements.data.every((a) => a.earnedAt === null) && (
            <p className="flex items-center gap-2 text-ink-muted">
              <Sprout aria-hidden className="size-5 text-brand" />
              {t('achievements.none')}
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortAchievements(achievements.data).map((achievement) => (
              <AchievementItem key={achievement.code} achievement={achievement} />
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}
