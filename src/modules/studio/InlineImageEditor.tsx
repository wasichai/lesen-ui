import { ArrowDown, ArrowUp, ImagePlus, ImageUp, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonClass } from '../../shared/ui'
import { useUploadIllustration } from './api'
import type { Document, DraftImage } from './contract'
import { fieldClass } from './DetailsTab'
import { addImage, imagesAt, moveImage, removeImage, updateImage } from './draftModel'
import { STUDIO_MODULE_ID } from './i18n'
import { ILLUSTRATIONS } from './PagesTab'

// el hueco tras `after` párrafos de un texto (ADR-0018 del backend): sus imágenes y el botón para añadir otra. El texto
// alternativo y el pie van en el idioma de la lectura
export function ImageSlot({ doc, after, language, onChange }: { doc: Document; after: number; language: string; onChange: (next: Document) => void }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const here = imagesAt(doc, after)
  return (
    <li className="flex flex-col gap-3">
      {here.map(({ image, i }) => (
        <ImageEditor key={i} doc={doc} image={image} i={i} language={language} onChange={onChange} />
      ))}
      <button type="button" className={buttonClass('ghost', 'sm', 'self-start')} onClick={() => onChange(addImage(doc, after))}>
        <ImagePlus aria-hidden className="size-4" />
        {after === 0 ? t('text.image.addFirst') : t('text.image.add', { n: after })}
      </button>
    </li>
  )
}

function ImageEditor({
  doc,
  image,
  i,
  language,
  onChange
}: {
  doc: Document
  image: DraftImage
  i: number
  language: string
  onChange: (next: Document) => void
}) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const upload = useUploadIllustration()
  const input = useRef<HTMLInputElement>(null)
  const n = i + 1
  const set = (change: Partial<DraftImage>) => onChange(updateImage(doc, i, change))
  return (
    <section
      aria-label={t('text.image.label', { n })}
      className="rounded-[var(--radius-card)] border border-dashed border-border-control bg-surface-raised p-4"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-label">{t('text.image.label', { n })}</h3>
        <button
          type="button"
          className={buttonClass('ghost', 'icon')}
          disabled={image.after === 0}
          onClick={() => onChange(moveImage(doc, i, -1))}
          aria-label={t('text.image.up', { n })}
        >
          <ArrowUp aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          className={buttonClass('ghost', 'icon')}
          disabled={image.after === doc.paragraphs.length}
          onClick={() => onChange(moveImage(doc, i, 1))}
          aria-label={t('text.image.down', { n })}
        >
          <ArrowDown aria-hidden className="size-4" />
        </button>
        <button type="button" className={buttonClass('ghost', 'icon')} onClick={() => onChange(removeImage(doc, i))} aria-label={t('text.image.remove', { n })}>
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <div
            className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-muted"
            style={{ aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : '4 / 3' }}
          >
            {image.file ? (
              <img src={`${ILLUSTRATIONS}/${image.file}`} alt="" className="size-full object-cover" />
            ) : (
              <p className="flex size-full items-center justify-center p-3 text-center text-secondary text-ink-muted">{t('text.image.pending')}</p>
            )}
          </div>
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-label={t('text.image.upload', { n })}
            onChange={(event) => {
              const chosen = event.target.files?.[0]
              if (chosen) upload.mutate(chosen, { onSuccess: (media) => set({ file: media.file, width: media.width ?? null, height: media.height ?? null }) })
              event.target.value = ''
            }}
          />
          <button type="button" className={buttonClass('secondary', 'sm')} onClick={() => input.current?.click()} disabled={upload.isPending}>
            <ImageUp aria-hidden className="size-4" />
            {t('text.image.upload', { n })}
          </button>
          <p aria-live="polite" className="text-secondary text-danger empty:hidden">
            {upload.isError ? t('pages.uploadError') : ''}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-secondary font-semibold">{t('text.image.alt')}</span>
            <span className="text-secondary text-ink-muted">{t('text.image.altHint')}</span>
            <textarea className={`${fieldClass} min-h-20`} lang={language} maxLength={300} value={image.alt} onChange={(e) => set({ alt: e.target.value })} />
          </label>
          {!image.alt.trim() && <p className="rounded-[var(--radius-md)] bg-ochre/10 p-2 text-secondary">{t('text.image.altMissing')}</p>}
          <label className="flex flex-col gap-1">
            <span className="text-secondary font-semibold">{t('text.image.caption')}</span>
            <input
              className={fieldClass}
              lang={language}
              maxLength={500}
              value={image.caption ?? ''}
              onChange={(e) => set({ caption: e.target.value || null })}
            />
          </label>
        </div>
      </div>
    </section>
  )
}
