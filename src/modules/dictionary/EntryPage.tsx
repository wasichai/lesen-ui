import { useWasichaiLinks } from '@wasichai/core'
import { ArrowLeft, BookmarkCheck, BookmarkPlus, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { APP_NAMESPACE, grammarValue } from '../../shared/appMessages'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useEntry, useFavorite, useSaveEntry } from './api'
import { DICTIONARY_MODULE_ID } from './i18n'

export function EntryPage() {
  return (
    <LearnerLayout>
      <EntryView entryKey={useParams().key ?? ''} />
    </LearnerLayout>
  )
}

function EntryView({ entryKey }: { entryKey: string }) {
  const { t } = useTranslation(DICTIONARY_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const entry = useEntry(entryKey)
  const favorite = useFavorite(entryKey)
  const save = useSaveEntry(entryKey)
  usePageTitle(entry.data?.lemma ?? '')
  if (entry.isError) return <ProblemState error={entry.error} onRetry={() => entry.refetch()} />
  if (!entry.data) return <Skeleton className="h-80" />
  const e = entry.data
  const isFavorite = favorite.isPending ? favorite.variables : e.favorite
  const saved = e.saved || save.isSuccess
  const grammar = Object.entries(e.grammar).filter(([, value]) => value !== null && value !== '' && typeof value !== 'object')
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <Link to={links.to(ROUTES.dictionary)} className={buttonClass('ghost', 'sm', '-ml-3 self-start')}>
        <ArrowLeft aria-hidden className="size-4" />
        {t('entry.back')}
      </Link>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-read text-display" lang={e.language}>
            {e.lemma}
          </h1>
          {e.ipa && <span className="text-[18px] text-ink-muted">/{e.ipa}/</span>}
        </div>
        <p className="italic text-ink-muted">{app(`pos.${e.pos}`, { defaultValue: e.pos })}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass(saved ? 'secondary' : 'primary', 'sm')} disabled={saved || save.isPending} onClick={() => save.mutate()}>
            {saved ? <BookmarkCheck aria-hidden className="size-4 text-success" /> : <BookmarkPlus aria-hidden className="size-4" />}
            {saved ? t('entry.saved') : t('entry.save')}
          </button>
          <button type="button" className={buttonClass('secondary', 'sm')} aria-pressed={isFavorite} onClick={() => favorite.mutate(!isFavorite)}>
            <Star aria-hidden className={`size-4 ${isFavorite ? 'fill-current text-ochre' : ''}`} />
            {isFavorite ? t('entry.unfavorite') : t('entry.favorite')}
          </button>
        </div>
      </header>
      {(grammar.length > 0 || e.forms.length > 0) && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-[var(--radius-card)] bg-surface-muted p-5">
          {grammar.map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="text-ink-muted">{app(`grammar.${key}`, { defaultValue: key })}</dt>
              <dd>{grammarValue(value, app)}</dd>
            </div>
          ))}
          {e.forms.length > 0 && (
            <div className="contents">
              <dt className="text-ink-muted">{t('entry.forms')}</dt>
              <dd lang={e.language}>{e.forms.join(', ')}</dd>
            </div>
          )}
        </dl>
      )}
      <ol className="flex flex-col gap-8">
        {e.senses.map((sense, i) => (
          <li key={i} className="flex flex-col gap-3">
            {e.senses.length > 1 && <p className="text-eyebrow uppercase text-brand-strong">{t('entry.meaning', { n: i + 1 })}</p>}
            <p className="font-read text-h2">{sense.translations.join(', ')}</p>
            {sense.definition && <p className="text-[17px] text-ink-muted">{sense.definition}</p>}
            {sense.examples.length > 0 && (
              <ul className="flex flex-col gap-3">
                {sense.examples.map((example) => (
                  <li key={example.text} className="border-l-4 border-brand-soft pl-4">
                    <p className="font-read text-[19px]" lang={e.language}>
                      {example.text}
                    </p>
                    {example.translation && <p className="text-ink-muted">{example.translation}</p>}
                  </li>
                ))}
              </ul>
            )}
            {sense.synonyms.length > 0 && (
              <p>
                <span className="font-semibold">{t('entry.synonyms')}: </span>
                <span lang={e.language}>{sense.synonyms.join(', ')}</span>
              </p>
            )}
            {sense.antonyms.length > 0 && (
              <p>
                <span className="font-semibold">{t('entry.antonyms')}: </span>
                <span lang={e.language}>{sense.antonyms.join(', ')}</span>
              </p>
            )}
            {sense.related.length > 0 && (
              <p className="flex flex-wrap gap-x-3">
                <span className="font-semibold">{t('entry.related')}:</span>
                {sense.related.map((r) => (
                  <Link key={r.key} to={links.to(ROUTES.entry, { key: r.key })} className="text-link underline underline-offset-4" lang={e.language}>
                    {r.lemma}
                  </Link>
                ))}
              </p>
            )}
            {sense.note && <p className="rounded-[var(--radius-md)] bg-notice-soft px-4 py-3 text-notice">{sense.note}</p>}
          </li>
        ))}
      </ol>
      {e.readings.length > 0 && (
        <section aria-labelledby="appears">
          <h2 id="appears" className="mb-3 font-read text-h3">
            {t('entry.readings')}
          </h2>
          <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-surface-raised">
            {e.readings.map((reading) => (
              <li key={reading.slug} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <span>
                  <span className="font-read text-h4">{reading.title}</span>{' '}
                  <span className="text-secondary text-ink-muted">
                    {reading.level} · {t('entry.occurrences', { count: reading.occurrences })}
                  </span>
                </span>
                <Link to={links.to(ROUTES.reader, { slug: reading.slug })} className={buttonClass('secondary', 'sm')}>
                  {t('entry.read')}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
