import { Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonClass } from '../../shared/ui'
import { useAttachAudio, useRemoveAudio } from './api'
import type { Draft } from './contract'
import { fieldClass } from './DetailsTab'
import { audioDuration } from './draftModel'
import { STUDIO_MODULE_ID } from './i18n'

// la narración y sus tiempos por palabra: se casan en el servidor con el texto guardado del borrador
export function AudioTab({ draft, dirty }: { draft: Draft; dirty: boolean }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const attach = useAttachAudio(draft.id)
  const remove = useRemoveAudio(draft.id)
  const [audio, setAudio] = useState<File | null>(null)
  const [timings, setTimings] = useState<File | null>(null)
  const [voice, setVoice] = useState(draft.audio?.voice ?? '')
  const [license, setLicense] = useState(draft.audio?.license ?? '')
  const [durationError, setDurationError] = useState(false)
  const editable = draft.status === 'DRAFT'
  const total = draft.sentences.reduce((n, s) => n + s.words.length, 0)
  const ready = editable && !dirty && audio && timings && voice.trim() && license.trim()
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section aria-labelledby="audio-current" className="flex flex-col gap-3">
        <h2 id="audio-current" className="font-display text-h3">
          {t('audio.current')}
        </h2>
        {draft.audio ? (
          <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4">
            <audio controls preload="metadata" src={draft.audio.url} className="w-full" />
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-secondary">
              <dt className="text-ink-muted">{t('audio.voice')}</dt>
              <dd>{draft.audio.voice}</dd>
              <dt className="text-ink-muted">{t('audio.license')}</dt>
              <dd>{draft.audio.license}</dd>
            </dl>
            <p className="text-secondary">{t('audio.timed', { timed: `${draft.audio.timedWords}/${total}` })}</p>
            {editable && (
              <button type="button" className={buttonClass('ghost', 'sm', 'self-start')} disabled={remove.isPending} onClick={() => remove.mutate(undefined)}>
                <Trash2 aria-hidden className="size-4" />
                {t('audio.remove')}
              </button>
            )}
          </div>
        ) : (
          <p className="text-ink-muted">{t('audio.none')}</p>
        )}
      </section>
      {editable && (
        <section aria-labelledby="audio-upload" className="flex flex-col gap-4">
          <h2 id="audio-upload" className="font-display text-h3">
            {t('audio.upload')}
          </h2>
          <p className="text-ink-muted">{t('audio.lead')}</p>
          <p className="text-secondary text-ink-muted">{t('audio.formats')}</p>
          {dirty && <p className="rounded-[var(--radius-md)] bg-ochre/10 p-3 text-secondary">{t('audio.saveFirst')}</p>}
          <form
            className="flex flex-col gap-4"
            onSubmit={async (event) => {
              event.preventDefault()
              if (!ready) return
              setDurationError(false)
              let durationMs: number
              try {
                durationMs = await audioDuration(audio)
              } catch {
                setDurationError(true)
                return
              }
              attach.mutate({ audio, timings, durationMs, voice: voice.trim(), license: license.trim() })
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-label">{t('audio.file')}</span>
              <input
                type="file"
                accept="audio/mpeg,audio/ogg,audio/mp4,.mp3,.ogg,.m4a"
                className={fieldClass}
                onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label">{t('audio.timings')}</span>
              <input
                type="file"
                accept=".vtt,.srt,.json,text/vtt,application/json"
                className={fieldClass}
                onChange={(e) => setTimings(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label">{t('audio.voice')}</span>
              <input className={fieldClass} value={voice} maxLength={120} onChange={(e) => setVoice(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label">{t('audio.license')}</span>
              <span className="text-secondary text-ink-muted">{t('audio.licenseHint')}</span>
              <input className={fieldClass} value={license} maxLength={300} onChange={(e) => setLicense(e.target.value)} />
            </label>
            <button type="submit" className={buttonClass('primary', 'md', 'self-start')} disabled={!ready || attach.isPending}>
              <Upload aria-hidden className="size-4" />
              {attach.isPending ? t('audio.uploading') : t('audio.upload')}
            </button>
            <p aria-live="polite" className="text-secondary text-danger empty:hidden">
              {durationError ? t('audio.duration') : attach.isError ? t('audio.error') : ''}
            </p>
          </form>
        </section>
      )}
    </div>
  )
}
