import { useWasichaiLinks } from '@wasichai/core'
import { CalendarCheck, Eye, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useProfile } from '../../shared/api'
import { EmptyState } from '../../shared/EmptyState'
import { formatDate } from '../../shared/format'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { ProblemState } from '../../shared/ProblemState'
import { ProgressBar } from '../../shared/ProgressBar'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { useReview, useReviewQueue, useSentenceAudio } from './api'
import { ratings, splitContext, type Rating, type ReviewCard } from './contract'
import { VOCABULARY_MODULE_ID } from './i18n'
import { modeFor, sentenceOf, waitBetween } from './reviewModel'

// la sesión de repaso: una palabra cada vez, primero la pregunta y, al pedirla, la respuesta con las cuatro valoraciones.
// Cada botón dice cuándo volverá la palabra. Espacio muestra la respuesta y 1–4 valoran
export function ReviewPage() {
  const { t } = useTranslation(VOCABULARY_MODULE_ID)
  usePageTitle(t('review.title'))
  const profile = useProfile()
  const language = profile.data?.targetLanguage
  const queue = useReviewQueue(language, profile.isSuccess)
  const [round, setRound] = useState(0)
  return (
    <LearnerLayout>
      <div className="mx-auto w-full max-w-2xl">
        {queue.isError ? (
          <ProblemState error={queue.error} onRetry={() => void queue.refetch()} />
        ) : !queue.data ? (
          <Skeleton className="h-72" />
        ) : (
          <Session
            key={`${round}-${queue.dataUpdatedAt}`}
            cards={queue.data.cards}
            nextDueAt={queue.data.nextDueAt}
            onMore={async () => {
              await queue.refetch()
              setRound((r) => r + 1)
            }}
          />
        )}
      </div>
    </LearnerLayout>
  )
}

type SessionProps = { cards: ReviewCard[]; nextDueAt: string | null; onMore: () => unknown }

function Session({ cards, nextDueAt, onMore }: SessionProps) {
  const { t, i18n } = useTranslation(VOCABULARY_MODULE_ID)
  const links = useWasichaiLinks()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [counts, setCounts] = useState<Record<Rating, number>>({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 })
  const review = useReview()
  const card = cards[index]
  // un id por palabra mostrada: si el envío se repite (un reintento), el servidor no repasa dos veces
  const clientId = useMemo(() => crypto.randomUUID(), [index])
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [index])

  const rate = (rating: Rating) => {
    if (!card || review.isPending) return
    review.mutate(
      { vocabularyId: card.item.id, rating, clientId },
      {
        onSuccess: () => {
          setCounts((c) => ({ ...c, [rating]: c[rating] + 1 }))
          setRevealed(false)
          setIndex((i) => i + 1)
        }
      }
    )
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return
      if (!revealed && event.key === ' ') {
        event.preventDefault()
        setRevealed(true)
      } else if (revealed && ['1', '2', '3', '4'].includes(event.key)) rate(ratings[Number(event.key) - 1]!)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (cards.length === 0)
    return (
      <EmptyState
        icon={CalendarCheck}
        title={t('review.empty')}
        body={nextDueAt ? t('review.next', { date: formatDate(nextDueAt, i18n.language) }) : t('review.emptyBody')}
        action={
          <Link to={links.to(ROUTES.discover)} className={buttonClass('primary')}>
            {t('discover')}
          </Link>
        }
      />
    )

  if (!card) {
    const done = Object.values(counts).reduce((a, b) => a + b, 0)
    return (
      <section className="flex flex-col items-center gap-4 rounded-[28px] border border-border bg-surface-raised p-8 text-center">
        <div aria-hidden className="grid size-16 animate-pop place-items-center rounded-full bg-brand text-on-brand">
          <CalendarCheck className="size-8" />
        </div>
        <h1 ref={heading} tabIndex={-1} className="font-display text-h1">
          {t('review.done', { count: done })}
        </h1>
        <p className="text-ink-muted">{t('review.doneBody')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className={buttonClass('secondary')} onClick={() => void onMore()}>
            {t('review.more')}
          </button>
          <Link to={links.to(ROUTES.vocabulary)} className={buttonClass('primary')}>
            {t('review.back')}
          </Link>
        </div>
      </section>
    )
  }

  const mode = modeFor(card, index)
  const item = card.item
  const parts = item.context ? splitContext(item.context, item.surface) : null
  const now = new Date()
  return (
    <section aria-labelledby="review-prompt" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-secondary text-ink-muted">
          <span>{t('review.progress', { current: index + 1, total: cards.length })}</span>
          <Link to={links.to(ROUTES.vocabulary)} className="text-link underline underline-offset-4">
            {t('review.stop')}
          </Link>
        </div>
        <ProgressBar percent={(index / cards.length) * 100} label={t('review.progress', { current: index + 1, total: cards.length })} />
      </div>
      <h1 className="sr-only">{t('review.title')}</h1>
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-[28px] border border-border bg-surface-raised p-6 text-center sm:p-10">
        <h2 id="review-prompt" ref={heading} tabIndex={-1} className="text-secondary font-semibold uppercase tracking-wide text-ink-muted">
          {t(`review.ask.${mode}`)}
        </h2>
        {mode === 'context' && (
          <p className="font-read text-[22px] leading-relaxed" lang={item.language}>
            {parts ? (
              <>
                {parts[0]}
                <mark className="rounded bg-mark-saved px-1 text-mark-saved-ink">{parts[1]}</mark>
                {parts[2]}
              </>
            ) : (
              item.context
            )}
          </p>
        )}
        {mode === 'meaning' && (
          <p className="font-display text-display leading-none" lang={item.language}>
            {item.lemma}
          </p>
        )}
        {mode === 'recall' && <p className="font-display text-h1">{item.translations.join(', ')}</p>}
        {revealed && (
          <div className="flex w-full flex-col items-center gap-3 border-t border-border pt-5" aria-live="polite">
            {mode === 'recall' ? (
              <p className="font-display text-h1" lang={item.language}>
                {item.lemma}
              </p>
            ) : (
              <p className="text-h3 font-semibold">{item.translations.join(', ')}</p>
            )}
            {mode === 'context' && (
              <p className="text-secondary text-ink-muted" lang={item.language}>
                {item.lemma}
              </p>
            )}
            {item.note && <p className="rounded-[var(--radius-md)] bg-surface-muted px-3 py-2 text-secondary">{item.note}</p>}
            <Listen item={item} />
          </div>
        )}
      </div>
      {!revealed ? (
        <button type="button" className={buttonClass('primary', 'md', 'self-center px-10')} onClick={() => setRevealed(true)}>
          <Eye aria-hidden className="size-4" />
          {t('review.show')}
        </button>
      ) : (
        <div role="group" aria-label={t('review.rate')} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ratings.map((rating, i) => {
            const wait = waitBetween(now, card.preview[rating])
            return (
              <button
                key={rating}
                type="button"
                disabled={review.isPending}
                onClick={() => rate(rating)}
                className={buttonClass(
                  rating === 'GOOD' ? 'primary' : 'secondary',
                  'md',
                  'h-auto flex-col justify-center gap-0 rounded-[var(--radius-lg)] py-2'
                )}
              >
                <span>{t(`review.rating.${rating}`)}</span>
                <span className="text-[12.5px] font-normal opacity-85">
                  <span className="sr-only">{t('review.returns')} </span>
                  {t(`review.wait.${wait.unit}`, { count: wait.count })}
                  <span aria-hidden className="ml-1 hidden sm:inline">
                    · {i + 1}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
      {review.isError && <ProblemState error={review.error} />}
    </section>
  )
}

function Listen({ item }: { item: ReviewCard['item'] }) {
  const { t } = useTranslation(VOCABULARY_MODULE_ID)
  const audio = useSentenceAudio(item.source, sentenceOf(item.tokenRef))
  if (!audio.available) return null
  return (
    <button type="button" className={buttonClass('secondary', 'sm')} onClick={audio.play} aria-pressed={audio.playing}>
      <Volume2 aria-hidden className="size-4" />
      {t('review.listen')}
    </button>
  )
}
