import { useWasichaiLinks } from '@wasichai/core'
import { BookMarked, CheckCircle2, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { languageName } from '../../shared/format'
import { ReadingTile } from '../../shared/ReadingTile'
import { ROUTES } from '../../shared/routes'
import type { ReadingCard } from '../../shared/schemas'
import { buttonClass } from '../../shared/ui'
import { useComplete } from './api'
import { READER_MODULE_ID } from './i18n'

// el final de la lectura: un botón para darla por terminada y, después, un reconocimiento sereno con lo logrado y qué
// leer ahora. Las preguntas de comprensión llegan en la fase 4: se anuncian, no se simulan
export function EndOfReading({
  slug,
  version,
  reading,
  related,
  language,
  seconds,
  savedThisSession,
  alreadyDone,
  atEnd
}: {
  slug: string
  version: number
  reading: ReadingCard
  related: ReadingCard[]
  language: string
  seconds: () => number
  savedThisSession: number
  alreadyDone: boolean
  atEnd: boolean
}) {
  const { t, i18n } = useTranslation(READER_MODULE_ID)
  const links = useWasichaiLinks()
  const complete = useComplete(slug)
  const title = useRef<HTMLHeadingElement>(null)
  const done = complete.isSuccess
  useEffect(() => {
    if (done) title.current?.focus()
  }, [done])
  if (!done)
    return (
      <div className="mt-16 flex flex-col items-center gap-3 border-t border-border pt-10 font-sans">
        <button
          type="button"
          className={buttonClass(atEnd || alreadyDone ? 'primary' : 'secondary', 'md', 'px-8')}
          disabled={complete.isPending}
          onClick={() => complete.mutate({ version, secondsRead: seconds() })}
        >
          <CheckCircle2 aria-hidden className="size-5" />
          {complete.isPending ? t('end.finishing') : t('end.finish')}
        </button>
      </div>
    )
  const minutes = Math.max(1, Math.round((complete.data?.secondsRead ?? seconds()) / 60))
  return (
    <section aria-labelledby="end-title" className="mt-16 animate-rise rounded-[28px] border border-border bg-surface-raised p-6 font-sans sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div aria-hidden className="grid size-20 animate-pop place-items-center rounded-full bg-brand text-on-brand shadow-lg">
          <Sparkles className="size-9" />
        </div>
        <h2 id="end-title" ref={title} tabIndex={-1} className="mt-5 font-read text-h1">
          {t('end.title')}
        </h2>
        <p className="mt-3 text-[18px]">{t('end.body', { words: reading.wordCount, language: languageName(language, i18n.language) })}</p>
        <p className="mt-1 text-ink-muted">
          {t('end.time', { count: minutes })} {savedThisSession > 0 && t('end.saved', { count: savedThisSession })}
        </p>
        <p className="mt-5 rounded-full bg-notice-soft px-4 py-2 text-secondary text-notice">{t('end.comprehension')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={links.to(ROUTES.vocabulary)} className={buttonClass('primary')}>
            <BookMarked aria-hidden className="size-4" />
            {t('end.vocabulary')}
          </Link>
          <Link to={links.to(ROUTES.discover)} className={buttonClass('secondary')}>
            {t('end.discover')}
          </Link>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 font-read text-h3">{t('end.next')}</h3>
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.slice(0, 4).map((r) => (
              <li key={r.slug}>
                <ReadingTile reading={r} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
