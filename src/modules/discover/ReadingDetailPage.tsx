import { useWasichaiLinks } from '@wasichai/core'
import { ArrowLeft, Bookmark, BookOpen, Clock, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { APP_NAMESPACE } from '../../shared/appMessages'
import { Cover } from '../../shared/Cover'
import { ExportButton } from '../../shared/export/ExportSheet'
import { languageName } from '../../shared/format'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { LevelBadge } from '../../shared/LevelBadge'
import { useBookmark } from '../../shared/mutations'
import { ProblemState } from '../../shared/ProblemState'
import { ProgressBar } from '../../shared/ProgressBar'
import { ReadingTile } from '../../shared/ReadingTile'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { useTopicLabel } from '../../shared/topics'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useReadingDetail } from './api'
import { DISCOVER_MODULE_ID } from './i18n'
import { ListsButton } from './ListsSheet'

export function ReadingDetailPage() {
  return (
    <LearnerLayout>
      <Detail slug={useParams().slug ?? ''} />
    </LearnerLayout>
  )
}

function Detail({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation(DISCOVER_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const navigate = useNavigate()
  const detail = useReadingDetail(slug)
  const bookmark = useBookmark(slug)
  const topicLabel = useTopicLabel()
  usePageTitle(detail.data?.reading.title ?? '')
  if (detail.isError) return <ProblemState error={detail.error} onRetry={() => detail.refetch()} />
  if (!detail.data)
    return (
      <div className="grid gap-8 sm:grid-cols-[18rem_1fr]">
        <Skeleton className="aspect-[3/4]" />
        <Skeleton className="h-64" />
      </div>
    )
  const { reading, paragraphs, related } = detail.data
  const progress = reading.progress
  const bookmarked = bookmark.isPending ? bookmark.variables : reading.bookmarked
  return (
    <article className="flex flex-col gap-14">
      <div>
        <button type="button" onClick={() => navigate(-1)} className={buttonClass('ghost', 'sm', '-ml-3 mb-4')}>
          <ArrowLeft aria-hidden className="size-4" />
          {t('detail.back')}
        </button>
        <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,16rem)_1fr] lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14">
          <div className="mx-auto w-52 sm:w-full">
            <Cover src={reading.cover} accent={reading.accent} eager className="shadow-[var(--shadow-cover-raised)]" />
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge level={reading.level} />
              {reading.topics.map((topic) => (
                <Link
                  key={topic}
                  to={`${links.to(ROUTES.explore)}?topic=${encodeURIComponent(topic)}`}
                  className="rounded-full border border-border px-3 py-0.5 text-secondary font-semibold hover:border-border-control"
                >
                  {topicLabel(topic)}
                </Link>
              ))}
            </div>
            <h1 className="font-display text-h1 sm:text-display" lang={reading.language}>
              {reading.title}
            </h1>
            {reading.subtitle && (
              <p className="-mt-3 font-display text-h3 italic text-ink-muted" lang={reading.language}>
                {reading.subtitle}
              </p>
            )}
            <p className="max-w-2xl text-[18px] leading-relaxed" lang={reading.language}>
              {reading.summary}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-secondary text-ink-muted">
              <li>{t('detail.by', { language: languageName(reading.language, i18n.language) })}</li>
              <li className="inline-flex items-center gap-1">
                <Clock aria-hidden className="size-4" />
                {app('reading.minutes', { count: reading.minutes })}
              </li>
              <li className="inline-flex items-center gap-1">
                <FileText aria-hidden className="size-4" />
                {t('detail.words', { count: reading.wordCount })} · {t('detail.paragraphs', { count: paragraphs })}
              </li>
            </ul>
            {progress && (
              <div className="max-w-sm">
                <p className="text-secondary font-semibold">{progress.completed ? t('detail.done') : t('detail.progress', { percent: progress.percent })}</p>
                {!progress.completed && <ProgressBar percent={progress.percent} label={t('detail.progress', { percent: progress.percent })} className="mt-2" />}
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to={links.to(ROUTES.reader, { slug })} className={buttonClass('primary', 'md', 'px-8')}>
                <BookOpen aria-hidden className="size-4" />
                {progress?.completed ? app('reading.reread') : progress ? app('reading.continue') : app('reading.start')}
              </Link>
              <button type="button" className={buttonClass('secondary')} aria-pressed={bookmarked} onClick={() => bookmark.mutate(!bookmarked)}>
                <Bookmark aria-hidden className={`size-4 ${bookmarked ? 'fill-current text-brand' : ''}`} />
                {bookmarked ? t('detail.bookmarked') : t('detail.bookmark')}
              </button>
              <ListsButton slug={slug} />
              <ExportButton slug={slug} version={reading.version} title={reading.title} />
            </div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section aria-labelledby="related">
          <h2 id="related" className="mb-5 font-display text-h2">
            {t('detail.related')}
          </h2>
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug}>
                <ReadingTile reading={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
