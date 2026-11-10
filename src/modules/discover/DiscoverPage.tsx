import { useAuth, useWasichaiLinks } from '@wasichai/core'
import { ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useProfile } from '../../shared/api'
import { useGoals } from '../../shared/goals'
import { APP_NAMESPACE } from '../../shared/appMessages'
import { Cover } from '../../shared/Cover'
import { EmptyState } from '../../shared/EmptyState'
import { languageName } from '../../shared/format'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { LevelBadge } from '../../shared/LevelBadge'
import { ProblemState } from '../../shared/ProblemState'
import { ProgressBar } from '../../shared/ProgressBar'
import { ROUTES } from '../../shared/routes'
import type { ReadingCard } from '../../shared/schemas'
import { LoadingRegion, Skeleton } from '../../shared/Skeleton'
import { localizedLabel, TONE_CLASSES, topicTone, useTopicLabel } from '../../shared/topics'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useDiscover, useWeekGlance } from './api'
import { DISCOVER_MODULE_ID } from './i18n'
import { Rail, SectionHeading } from './parts'

function greeting(hour: number): 'morning' | 'afternoon' | 'evening' {
  return hour < 12 ? 'morning' : hour < 19 ? 'afternoon' : 'evening'
}

export function DiscoverPage() {
  const { t } = useTranslation(DISCOVER_MODULE_ID)
  usePageTitle(t('home.title'))
  return (
    <LearnerLayout>
      <DiscoverContent />
    </LearnerLayout>
  )
}

function DiscoverContent() {
  const { t, i18n } = useTranslation(DISCOVER_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const { user, can } = useAuth()
  const profile = useProfile()
  const discover = useDiscover()
  const topicLabel = useTopicLabel()
  if (discover.isError) return <ProblemState error={discover.error} onRetry={() => discover.refetch()} />
  if (!discover.data || !profile.data)
    return (
      <LoadingRegion>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-72 w-full" />
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </LoadingRegion>
    )
  const data = discover.data
  const language = languageName(profile.data.targetLanguage, i18n.language)
  const hero = data.featured[0]
  const name = user?.displayName?.split(' ')[0]
  const hello = t(`home.greeting.${greeting(new Date().getHours())}`)
  const nothing = !hero && data.recommended.length === 0 && data.fresh.length === 0
  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="hello" className="animate-rise">
        <h1 id="hello" className="font-read text-h1 sm:text-display">
          {name ? t('home.named', { greeting: hello, name }) : hello}
        </h1>
        <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-ink-muted">{t('home.lead', { language, minutes: profile.data.dailyMinutes })}</p>
      </section>

      {nothing && (
        <EmptyState
          icon={BookOpen}
          title={t('home.empty', { language })}
          body={t('home.emptyBody')}
          action={
            <Link className={buttonClass('primary')} to={`${links.to(ROUTES.explore)}?language=all`}>
              {t('home.all')}
            </Link>
          }
        />
      )}

      <WeekGlance />

      {can('lectura_a_medida', 'CREATE') && links.has(ROUTES.generate) && (
        <Link
          to={links.to(ROUTES.generate)}
          className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface-raised p-5 transition-colors hover:border-border-control"
        >
          <Sparkles aria-hidden className="size-6 shrink-0 text-brand" />
          <span className="min-w-0 flex-1">
            <span className="block font-read text-h4">{t('home.custom')}</span>
            <span className="mt-0.5 block text-secondary text-ink-muted">{t('home.customLead')}</span>
          </span>
          <ArrowRight aria-hidden className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {hero && <Hero reading={hero} />}

      {data.continueReading.length > 0 && (
        <section aria-labelledby="continue">
          <SectionHeading id="continue" title={t('home.continue')} />
          <ul aria-labelledby="continue" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.continueReading.map((reading) => (
              <li key={reading.slug}>
                <Link
                  to={links.to(ROUTES.reader, { slug: reading.slug })}
                  className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface-raised p-3 transition-colors hover:border-border-control"
                >
                  <div className="w-16 shrink-0">
                    <Cover src={reading.cover} accent={reading.accent} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-read text-h4" lang={reading.language}>
                      {reading.title}
                    </p>
                    <p className="mt-0.5 text-secondary text-ink-muted">{app('reading.progress', { percent: reading.progress?.percent ?? 0 })}</p>
                    <ProgressBar
                      percent={reading.progress?.percent ?? 0}
                      label={app('reading.progress', { percent: reading.progress?.percent ?? 0 })}
                      className="mt-2"
                    />
                  </div>
                  <ArrowRight aria-hidden className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
                  <span className="sr-only">{app('reading.continue')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.recommended.length > 0 && (
        <section aria-labelledby="recommended">
          <SectionHeading id="recommended" title={t('home.recommended')} lead={t('home.recommendedLead')} />
          <Rail
            labelledBy="recommended"
            readings={data.recommended.map((r) => r.reading)}
            badges={(reading) =>
              data.recommended
                .find((r) => r.reading.slug === reading.slug)
                ?.reasons.map((reason) => (
                  <span key={reason} className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[12.5px] font-semibold text-ink-muted">
                    {t(`home.reason.${reason}`)}
                  </span>
                ))
            }
          />
        </section>
      )}

      {data.thisWeek.length > 0 && (
        <section aria-labelledby="this-week">
          <SectionHeading id="this-week" title={t('home.thisWeek')} lead={t('home.thisWeekLead')} />
          <Rail
            labelledBy="this-week"
            readings={data.thisWeek.map((r) => r.reading)}
            badges={(reading) => (
              <span className="text-[12.5px] font-semibold text-ink-muted">
                {t('home.readers', { count: data.thisWeek.find((r) => r.reading.slug === reading.slug)?.readers ?? 0 })}
              </span>
            )}
          />
        </section>
      )}

      {data.topics.length > 0 && (
        <section aria-labelledby="topics">
          <SectionHeading id="topics" title={t('home.topics')} />
          <ul aria-labelledby="topics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.topics
              .filter((topic) => !topic.slug.includes('/'))
              .map((topic) => {
                const tone = TONE_CLASSES[topicTone(topic.slug)]
                return (
                  <li key={topic.slug}>
                    <Link
                      to={`${links.to(ROUTES.explore)}?topic=${encodeURIComponent(topic.slug)}`}
                      className="group relative flex min-h-24 flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-raised p-4 transition-colors hover:border-border-control"
                    >
                      <span aria-hidden className={`absolute -right-6 -top-6 size-20 rounded-full opacity-15 ${tone.bg}`} />
                      <span className={`font-read text-h4 ${tone.text}`}>{topicLabel(topic.slug)}</span>
                      <span className="text-secondary text-ink-muted">{t('home.readings', { count: topic.readings })}</span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </section>
      )}

      {data.collections.map((collection) => (
        <section key={collection.slug} aria-labelledby={`collection-${collection.slug}`}>
          <SectionHeading
            id={`collection-${collection.slug}`}
            title={localizedLabel(collection.labels, i18n.language)}
            lead={localizedLabel(collection.descriptions, i18n.language)}
          />
          <Rail labelledBy={`collection-${collection.slug}`} readings={collection.readings} />
        </section>
      ))}

      {data.fresh.length > 0 && (
        <section aria-labelledby="fresh">
          <SectionHeading
            id="fresh"
            title={t('home.fresh')}
            action={
              <Link to={links.to(ROUTES.explore)} className={buttonClass('quiet', 'sm')}>
                {t('home.all')}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            }
          />
          <Rail labelledBy="fresh" readings={data.fresh} />
        </section>
      )}
    </div>
  )
}

// el aviso de la semana, solo si quien lee lo pidió en su perfil: cuánto lleva, nunca lo que le falta como reproche
function WeekGlance() {
  const { t } = useTranslation(DISCOVER_MODULE_ID)
  const links = useWasichaiLinks()
  const goals = useGoals()
  const glance = useWeekGlance(goals.data?.weeklySummary === true)
  if (!goals.data?.weeklySummary || !glance.data) return null
  const week = glance.data
  const values = { active: week.activeDays, target: week.target, minutes: week.minutes.value }
  return (
    <aside
      aria-labelledby="week-glance"
      className="-mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4 sm:p-5"
    >
      <div className="min-w-0 flex-1 basis-64">
        <h2 id="week-glance" className="font-read text-h4">
          {t('home.glance.title')}
        </h2>
        <p className="text-ink-muted">
          {week.met ? t('home.glance.met', values) : week.activeDays > 0 ? t('home.glance.progress', values) : t('home.glance.quiet')}
        </p>
      </div>
      {links.has(ROUTES.week) && (
        <Link to={links.to(ROUTES.week)} className={buttonClass('secondary', 'sm')}>
          {t('home.glance.open')}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </aside>
  )
}

// la lectura destacada: la portada grande y una invitación clara
function Hero({ reading }: { reading: ReadingCard }) {
  const { t } = useTranslation(DISCOVER_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const started = reading.progress && !reading.progress.completed
  return (
    <section aria-labelledby="featured" className="relative overflow-hidden rounded-[28px] border border-border bg-surface-raised">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12]"
        style={{ background: `radial-gradient(120% 90% at 100% 0%, ${reading.accent ?? 'var(--brand)'}, transparent 60%)` }}
      />
      <div className="relative grid items-center gap-6 p-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-10 sm:p-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <Link to={links.to(ROUTES.reading, { slug: reading.slug })} className="mx-auto w-44 sm:w-full" tabIndex={-1} aria-hidden>
          <Cover
            src={reading.cover}
            accent={reading.accent}
            eager
            className="shadow-[0_20px_40px_rgb(48_34_20/22%)] -rotate-2 transition-transform hover:rotate-0"
          />
        </Link>
        <div className="flex flex-col items-start gap-4">
          <p id="featured" className="text-eyebrow uppercase text-brand-strong">
            {t('home.featured')}
          </p>
          <h2 className="font-read text-h1" lang={reading.language}>
            {reading.title}
          </h2>
          {reading.subtitle && (
            <p className="-mt-2 font-read text-h4 italic text-ink-muted" lang={reading.language}>
              {reading.subtitle}
            </p>
          )}
          <p className="max-w-xl text-[17px] leading-relaxed" lang={reading.language}>
            {reading.summary}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-secondary text-ink-muted">
            <LevelBadge level={reading.level} />
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden className="size-4" />
              {app('reading.minutes', { count: reading.minutes })}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link to={links.to(ROUTES.reader, { slug: reading.slug })} className={buttonClass('primary', 'md', 'px-7')}>
              <BookOpen aria-hidden className="size-4" />
              {started ? app('reading.continue') : app('reading.start')}
            </Link>
            <Link to={links.to(ROUTES.reading, { slug: reading.slug })} className={buttonClass('secondary')}>
              {t('home.details')}
              <span className="sr-only">: {reading.title}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
