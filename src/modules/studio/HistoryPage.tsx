import { useWasichaiLinks } from '@wasichai/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { formatDate } from '../../shared/format'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { StudioLayout } from '../../shared/StudioLayout'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useHistory } from './api'
import { STUDIO_MODULE_ID } from './i18n'
import { Events } from './ReviewTab'

// las versiones de una lectura y lo que pasó en el estudio: quién publicó cada una y cuándo
export function HistoryPage() {
  return (
    <StudioLayout>
      <History slug={useParams().slug ?? ''} />
    </StudioLayout>
  )
}

function History({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation(STUDIO_MODULE_ID)
  const links = useWasichaiLinks()
  const history = useHistory(slug)
  usePageTitle(t('history.title', { slug }))
  if (history.isError) return <ProblemState error={history.error} onRetry={() => history.refetch()} />
  if (!history.data) return <Skeleton className="h-64" />
  const data = history.data
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to={links.to(ROUTES.studio)} className={buttonClass('ghost', 'sm', '-ml-3 mb-3')}>
          <ArrowLeft aria-hidden className="size-4" />
          {t('draft.back')}
        </Link>
        <h1 className="break-words font-read text-h1">{t('history.title', { slug })}</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="versions">
          <h2 id="versions" className="mb-3 font-read text-h3">
            {t('history.versions')}
          </h2>
          <ol className="flex flex-col gap-3">
            {data.versions.map((v) => (
              <li key={v.number} className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-4">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {t('history.version', { number: v.number })}
                  <span className={`rounded-full px-2.5 py-0.5 text-[12.5px] ${v.status === 'PUBLISHED' ? 'bg-sage/15' : 'bg-surface-muted text-ink-muted'}`}>
                    {v.status === 'PUBLISHED' ? t('history.current') : t('history.retired')}
                  </span>
                </p>
                <p className="mt-1 font-read text-h4">{v.title}</p>
                <p className="text-secondary text-ink-muted">
                  {formatDate(v.publishedAt, i18n.language)} · {t('history.words', { count: v.wordCount })} ·{' '}
                  {v.audio ? t('history.audio') : t('history.noAudio')} · {t('history.questions', { count: v.questions })}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="events">
          <h2 id="events" className="mb-3 font-read text-h3">
            {t('history.events')}
          </h2>
          {data.events.length === 0 ? <p className="text-ink-muted">{t('history.none')}</p> : <Events events={data.events} />}
        </section>
      </div>
    </div>
  )
}
