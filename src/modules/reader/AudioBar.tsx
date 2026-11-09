import { FastForward, LocateFixed, Pause, Play, Rewind, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonClass } from '../../shared/ui'
import { formatClock, RATES } from './audioSync'
import { READER_MODULE_ID } from './i18n'
import type { AudioState } from './useAudioPlayer'

// la barra del audio, fija abajo: reproducir y pausar, saltar 5 s, párrafo anterior y siguiente, posición, velocidad y
// volumen. Todo con teclado y con nombre accesible. Si el audio falla, lo dice y el lector sigue igual
export function AudioBar({
  state,
  voice,
  following,
  onToggle,
  onSeek,
  onSkip,
  onParagraph,
  onRate,
  onVolume,
  onFollow
}: {
  state: AudioState
  voice: string
  following: boolean
  onToggle: () => void
  onSeek: (ms: number) => void
  onSkip: (deltaMs: number) => void
  onParagraph: (step: 1 | -1) => void
  onRate: (rate: number) => void
  onVolume: (volume: number) => void
  onFollow: () => void
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  const seekId = useId()
  const rateId = useId()
  const volumeId = useId()
  const failed = state.status === 'error'
  const busy = state.status === 'loading' || state.status === 'buffering'
  return (
    <section
      aria-label={t('audio.label')}
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-raised/95 font-sans shadow-[0_-8px_24px_rgb(0_0_0/6%)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-3 py-2 sm:px-4">
        {failed ? (
          <p role="status" className="py-2 text-center text-secondary text-ink-muted">
            {t('audio.error')}
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="w-10 text-right text-[12.5px] tabular-nums text-ink-muted" aria-hidden>
                {formatClock(state.currentMs)}
              </span>
              <label htmlFor={seekId} className="sr-only">
                {t('audio.position')}
              </label>
              <input
                id={seekId}
                type="range"
                min={0}
                max={Math.max(1, state.durationMs)}
                step={500}
                value={Math.min(state.currentMs, state.durationMs)}
                aria-valuetext={t('audio.positionValue', { current: formatClock(state.currentMs), total: formatClock(state.durationMs) })}
                onChange={(event) => onSeek(Number(event.target.value))}
                className="h-11 min-w-0 flex-1 accent-[var(--brand)]"
              />
              <span className="w-10 text-[12.5px] tabular-nums text-ink-muted" aria-hidden>
                {formatClock(state.durationMs)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-0.5">
                <button type="button" className={buttonClass('ghost', 'icon')} aria-label={t('audio.previousParagraph')} onClick={() => onParagraph(-1)}>
                  <SkipBack aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  className={buttonClass('ghost', 'icon', 'hidden sm:inline-flex')}
                  aria-label={t('audio.back')}
                  onClick={() => onSkip(-5000)}
                >
                  <Rewind aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  className={buttonClass('primary', 'icon', 'size-12')}
                  aria-label={state.playing ? t('audio.pause') : t('audio.play')}
                  aria-pressed={state.playing}
                  disabled={state.status === 'loading'}
                  onClick={onToggle}
                >
                  {state.playing ? <Pause aria-hidden className="size-5 fill-current" /> : <Play aria-hidden className="size-5 fill-current" />}
                </button>
                <button
                  type="button"
                  className={buttonClass('ghost', 'icon', 'hidden sm:inline-flex')}
                  aria-label={t('audio.forward')}
                  onClick={() => onSkip(5000)}
                >
                  <FastForward aria-hidden className="size-5" />
                </button>
                <button type="button" className={buttonClass('ghost', 'icon')} aria-label={t('audio.nextParagraph')} onClick={() => onParagraph(1)}>
                  <SkipForward aria-hidden className="size-5" />
                </button>
              </div>
              <p className="hidden min-w-0 flex-1 truncate text-center text-[12.5px] text-ink-muted md:block" aria-live="polite">
                {busy ? t('audio.loading') : t('audio.voice', { voice })}
              </p>
              <div className="flex items-center gap-1">
                {!following && state.playing && (
                  <button type="button" className={buttonClass('secondary', 'sm', 'px-3')} onClick={onFollow}>
                    <LocateFixed aria-hidden className="size-4" />
                    <span className="hidden sm:inline">{t('audio.follow')}</span>
                    <span className="sr-only sm:hidden">{t('audio.follow')}</span>
                  </button>
                )}
                <label htmlFor={rateId} className="sr-only">
                  {t('audio.rate')}
                </label>
                <select
                  id={rateId}
                  value={state.rate}
                  onChange={(event) => onRate(Number(event.target.value))}
                  className="min-h-11 rounded-full border border-border-control bg-surface-raised px-3 text-[14px] font-semibold"
                >
                  {RATES.map((rate) => (
                    <option key={rate} value={rate}>
                      {t('audio.rateValue', { rate })}
                    </option>
                  ))}
                </select>
                <div className="hidden items-center gap-1 lg:flex">
                  <Volume2 aria-hidden className="size-4 text-ink-muted" />
                  <label htmlFor={volumeId} className="sr-only">
                    {t('audio.volume')}
                  </label>
                  <input
                    id={volumeId}
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={state.volume}
                    onChange={(event) => onVolume(Number(event.target.value))}
                    className="h-11 w-24 accent-[var(--brand)]"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
