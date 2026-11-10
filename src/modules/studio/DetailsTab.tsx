import { Check, ImageUp, X } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTopics } from '../../shared/api'
import { Cover } from '../../shared/Cover'
import { LEVELS } from '../../shared/schemas'
import { localizedLabel } from '../../shared/topics'
import { buttonClass, chipClass } from '../../shared/ui'
import { useUploadCover } from './api'
import { toBook, toText } from './pagesModel'
import type { Document } from './contract'
import type { Edited } from './DraftPage'
import { STUDIO_MODULE_ID } from './i18n'

export const fieldClass = 'min-h-11 w-full rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 py-2 text-[16px] disabled:opacity-70'
const COVERS = '/api/lesen/public/covers'

export function DetailsTab({ edited, onChange }: { edited: Edited; onChange: (next: Edited) => void }) {
  const { t, i18n } = useTranslation(STUDIO_MODULE_ID)
  const topics = useTopics()
  const upload = useUploadCover()
  const input = useRef<HTMLInputElement>(null)
  const doc = edited.document
  const set = (change: Partial<Document>) => onChange({ ...edited, document: { ...doc, ...change } })
  const toggleTopic = (slug: string) => set({ topics: doc.topics.includes(slug) ? doc.topics.filter((x) => x !== slug) : [...doc.topics, slug] })
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="flex min-w-0 flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('details.title')}</span>
          <input className={fieldClass} lang={doc.language} value={doc.title} maxLength={200} onChange={(e) => set({ title: e.target.value })} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('details.subtitle')}</span>
          <input
            className={fieldClass}
            lang={doc.language}
            value={doc.subtitle ?? ''}
            maxLength={300}
            onChange={(e) => set({ subtitle: e.target.value || null })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-label">{t('details.summary')}</span>
          <span className="text-secondary text-ink-muted">{t('details.summaryHint')}</span>
          <textarea
            className={`${fieldClass} min-h-28`}
            lang={doc.language}
            value={doc.summary}
            maxLength={1000}
            onChange={(e) => set({ summary: e.target.value })}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-label">{t('details.level')}</span>
            <select className={fieldClass} value={doc.level} onChange={(e) => set({ level: e.target.value })}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-label">{t('details.accent')}</span>
            <input
              type="color"
              className={`${fieldClass} h-11 p-1`}
              value={doc.accent ?? '#2f5d62'}
              onChange={(e) => set({ accent: e.target.value.toUpperCase() })}
            />
          </label>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-label">{t('details.format')}</legend>
          <span className="text-secondary text-ink-muted">{t('details.formatHint')}</span>
          <div className="flex flex-wrap gap-2">
            {(['TEXT', 'PICTURE_BOOK'] as const).map((format) => (
              <button
                key={format}
                type="button"
                aria-pressed={doc.format === format}
                className={chipClass(doc.format === format)}
                onClick={() => onChange({ ...edited, document: format === 'PICTURE_BOOK' ? toBook(doc) : toText(doc) })}
              >
                {doc.format === format && <Check aria-hidden className="size-4" />}
                {t(`format.${format}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={doc.featured} onChange={(e) => set({ featured: e.target.checked })} />
          <span>{t('details.featured')}</span>
        </label>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-label">{t('details.topics')}</legend>
          {(topics.data ?? []).map((topic) => (
            <div key={topic.slug} className="flex flex-wrap gap-2">
              {[{ slug: topic.slug, labels: topic.labels }, ...topic.children.map((c) => ({ slug: `${topic.slug}/${c.slug}`, labels: c.labels }))].map(
                (option, i) => (
                  <button
                    key={option.slug}
                    type="button"
                    aria-pressed={doc.topics.includes(option.slug)}
                    className={chipClass(doc.topics.includes(option.slug))}
                    onClick={() => toggleTopic(option.slug)}
                  >
                    {doc.topics.includes(option.slug) && <Check aria-hidden className="size-4" />}
                    {i === 0 ? localizedLabel(option.labels, i18n.language) : `↳ ${localizedLabel(option.labels, i18n.language)}`}
                  </button>
                )
              )}
            </div>
          ))}
        </fieldset>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-label">{t('details.cover')}</p>
        <div className="w-48 lg:w-full">
          <Cover src={doc.cover ? `${COVERS}/${doc.cover}` : null} accent={doc.accent ?? null} />
        </div>
        <p className="text-secondary text-ink-muted">{t('details.coverHint')}</p>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label={t('details.coverUpload')}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) upload.mutate(file, { onSuccess: (media) => set({ cover: media.file }) })
            event.target.value = ''
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass('secondary', 'sm')} onClick={() => input.current?.click()} disabled={upload.isPending}>
            <ImageUp aria-hidden className="size-4" />
            {t('details.coverUpload')}
          </button>
          {doc.cover && (
            <button type="button" className={buttonClass('ghost', 'sm')} onClick={() => set({ cover: null })}>
              <X aria-hidden className="size-4" />
              {t('details.coverRemove')}
            </button>
          )}
        </div>
        <p aria-live="polite" className="text-secondary text-danger empty:hidden">
          {upload.isError ? t('details.coverError') : ''}
        </p>
      </div>
    </div>
  )
}
