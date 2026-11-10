import { useWasichaiLinks } from '@wasichai/core'
import { Bookmark, CheckCircle2, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { APP_NAMESPACE } from './appMessages'
import { Cover } from './Cover'
import { LevelBadge } from './LevelBadge'
import { ProgressBar } from './ProgressBar'
import { ROUTES } from './routes'
import type { ReadingCard } from './schemas'
import { useTopicLabel } from './topics'

// una lectura en una lista. «tall»: portada arriba (carriles y rejillas); «row»: portada a la izquierda (listas). Todo el
// bloque es un único enlace a la ficha, con el título como nombre accesible
export function ReadingTile({ reading, variant = 'tall', className = '' }: { reading: ReadingCard; variant?: 'tall' | 'row'; className?: string }) {
  const { t } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const topicLabel = useTopicLabel()
  const progress = reading.progress
  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-secondary text-ink-muted">
      <span className="inline-flex items-center gap-1">
        <Clock aria-hidden className="size-4" />
        {t('reading.minutes', { count: reading.minutes })}
      </span>
      {reading.topics[0] && <span>{topicLabel(reading.topics[0])}</span>}
      {progress?.completed && (
        <span className="inline-flex items-center gap-1 font-semibold text-success">
          <CheckCircle2 aria-hidden className="size-4" />
          {t('reading.completed')}
        </span>
      )}
      {reading.bookmarked && (
        <span className="inline-flex items-center gap-1">
          <Bookmark aria-hidden className="size-4 fill-current" />
          <span className="sr-only">{t('reading.bookmarked')}</span>
        </span>
      )}
    </div>
  )
  const bar = progress && !progress.completed && progress.percent > 0 && (
    <ProgressBar percent={progress.percent} label={t('reading.progress', { percent: progress.percent })} className="mt-1" />
  )
  const to = links.to(ROUTES.reading, { slug: reading.slug })
  if (variant === 'row') {
    return (
      <Link to={to} className={`group flex gap-4 rounded-[var(--radius-card)] p-2 transition-colors hover:bg-surface-muted ${className}`}>
        <div className="relative w-20 shrink-0 sm:w-24">
          <Cover src={reading.cover} accent={reading.accent} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <div className="flex items-center gap-2">
            <LevelBadge level={reading.level} />
          </div>
          <h3 className="font-display text-h4 leading-snug group-hover:underline group-hover:underline-offset-4" lang={reading.language}>
            {reading.title}
          </h3>
          {meta}
          {bar}
        </div>
      </Link>
    )
  }
  return (
    <Link to={to} className={`group flex flex-col gap-3 ${className}`}>
      <div data-ui="tile-cover" className="relative transition-transform duration-300 group-hover:-translate-y-1">
        <Cover src={reading.cover} accent={reading.accent} className="shadow-[var(--shadow-cover)]" />
        <div className="absolute left-3 top-3">
          <LevelBadge level={reading.level} tone="onImage" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-0.5">
        <h3 className="font-display text-h4 leading-snug group-hover:underline group-hover:underline-offset-4" lang={reading.language}>
          {reading.title}
        </h3>
        {meta}
        {bar}
      </div>
    </Link>
  )
}
