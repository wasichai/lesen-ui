import { ImageOff, ImagePlus, ImageUp, Merge, RefreshCw, Scissors, Trash2, X } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PAGE_LAYOUTS, type PageLayout } from '../../shared/schemas'
import { buttonClass } from '../../shared/ui'
import { useCommissionStatus, useRedraw, useUploadIllustration } from './api'
import type { DraftPage } from './contract'
import { fieldClass } from './DetailsTab'
import type { Edited } from './DraftPage'
import { STUDIO_MODULE_ID } from './i18n'
import {
  addImagePage,
  effectiveLayout,
  LAYOUTS,
  layoutsFor,
  mergeWithNext,
  pageProblems,
  pagesBalance,
  pageStarts,
  removePage,
  setSpan,
  splitPage,
  updateIllustration,
  updatePage
} from './pagesModel'

export const ILLUSTRATIONS = '/api/lesen/public/illustrations'

// las páginas de un libro ilustrado (ADR-0014 del backend): la maqueta del libro y, por página, su ancho, su maqueta, los
// párrafos que lleva y su ilustración con el texto alternativo en cada idioma de interfaz
export function PagesTab({
  edited,
  onChange,
  language,
  interfaceLanguages,
  draftId,
  dirty
}: {
  edited: Edited
  onChange: (next: Edited) => void
  language: string
  interfaceLanguages: string[]
  draftId: string
  // con cambios sin guardar no se vuelve a dibujar: el borrador que vuelve del servidor los pisaría
  dirty: boolean
}) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const doc = edited.document
  const set = (next: typeof doc) => onChange({ ...edited, document: next })
  const starts = pageStarts(doc.pages)
  const balance = pagesBalance(doc)
  const status = useCommissionStatus()
  const redraw = useRedraw(draftId)
  const canRedraw = status.data?.illustrations === true
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-ink-muted">{t('pages.lead')}</p>
      <label className="flex max-w-md flex-col gap-2">
        <span className="text-label">{t('pages.bookLayout')}</span>
        <span className="text-secondary text-ink-muted">{t('pages.bookLayoutHint')}</span>
        <select className={fieldClass} value={doc.layout ?? ''} onChange={(e) => set({ ...doc, layout: e.target.value as PageLayout })}>
          {layoutsFor(1).map((layout) => (
            <option key={layout} value={layout}>
              {t(`layout.${layout}`)}
            </option>
          ))}
        </select>
      </label>
      {balance !== 0 && (
        <p role="status" className="rounded-[var(--radius-md)] bg-ochre/10 p-3">
          {t('pages.unbalanced', { pages: doc.pages.reduce((n, p) => n + p.paragraphs, 0), paragraphs: doc.paragraphs.length })}
        </p>
      )}
      <ol className="flex flex-col gap-6">
        {doc.pages.map((page, g) => (
          <PageEditor
            key={g}
            g={g}
            page={page}
            first={starts[g]!}
            count={doc.pages.length}
            effective={effectiveLayout(doc, page)}
            problems={pageProblems(doc, page, interfaceLanguages)}
            interfaceLanguages={interfaceLanguages}
            language={language}
            paragraphText={(p) =>
              doc.paragraphs[p]?.sentences
                .map((s) => s.text)
                .join(' ')
                .trim() ?? ''
            }
            onPage={(change) => set(updatePage(doc, g, change))}
            onSpan={(span) => set(setSpan(doc, g, span))}
            onIllustration={(change) => set(updateIllustration(doc, g, change))}
            onSplit={(keep) => set(splitPage(doc, g, keep))}
            onMerge={() => set(mergeWithNext(doc, g))}
            onAddImage={() => set(addImagePage(doc, g))}
            onRemove={() => set(removePage(doc, g))}
            redraw={
              canRedraw
                ? {
                    disabled: dirty || redraw.isPending,
                    pending: redraw.isPending && redraw.variables === g + 1,
                    failed: redraw.isError && redraw.variables === g + 1,
                    hint: dirty,
                    run: () => redraw.mutate(g + 1)
                  }
                : null
            }
          />
        ))}
      </ol>
    </div>
  )
}

function PageEditor({
  g,
  page,
  first,
  count,
  effective,
  problems,
  interfaceLanguages,
  language,
  paragraphText,
  onPage,
  onSpan,
  onIllustration,
  onSplit,
  onMerge,
  onAddImage,
  onRemove,
  redraw
}: {
  g: number
  page: DraftPage
  first: number
  count: number
  effective: PageLayout | null
  problems: string[]
  interfaceLanguages: string[]
  language: string
  paragraphText: (p: number) => string
  onPage: (change: Partial<DraftPage>) => void
  onSpan: (span: 1 | 2) => void
  onIllustration: (change: Partial<NonNullable<DraftPage['illustration']>>) => void
  onSplit: (keep: number) => void
  onMerge: () => void
  onAddImage: () => void
  onRemove: () => void
  redraw: { disabled: boolean; pending: boolean; failed: boolean; hint: boolean; run: () => void } | null
}) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const upload = useUploadIllustration()
  const input = useRef<HTMLInputElement>(null)
  const n = g + 1
  const illustrated = effective !== null && PAGE_LAYOUTS[effective].illustrated
  const file = page.illustration?.file ?? null
  const languageName = (code: string) => t(`language.${code}`, { defaultValue: code })
  return (
    <li className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-4 sm:p-5" aria-labelledby={`page-${n}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 id={`page-${n}`} className="mr-auto font-display text-h4">
          {page.span === 2 ? t('pages.spread', { n }) : t('pages.page', { n })}
        </h2>
        <button type="button" className={buttonClass('ghost', 'sm')} onClick={onAddImage}>
          <ImagePlus aria-hidden className="size-4" />
          {t('pages.addImage')}
        </button>
        <button type="button" className={buttonClass('ghost', 'sm')} disabled={g === count - 1} onClick={onMerge}>
          <Merge aria-hidden className="size-4" />
          {t('pages.merge')}
        </button>
        <button type="button" className={buttonClass('ghost', 'icon')} disabled={count === 1} onClick={onRemove} aria-label={t('pages.remove', { n })}>
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-label">{t('pages.span')}</span>
              <select className={fieldClass} value={page.span} onChange={(e) => onSpan(Number(e.target.value) as 1 | 2)}>
                <option value={1}>{t('pages.single')}</option>
                <option value={2}>{t('pages.double')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-label">{t('pages.layout')}</span>
              <select className={fieldClass} value={page.layout ?? ''} onChange={(e) => onPage({ layout: (e.target.value || null) as PageLayout | null })}>
                <option value="">{t('pages.bookDefault')}</option>
                {LAYOUTS.filter((layout) => (PAGE_LAYOUTS[layout].spans as readonly number[]).includes(page.span)).map((layout) => (
                  <option key={layout} value={layout}>
                    {t(`layout.${layout}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <p className="text-label">{t('pages.text', { count: page.paragraphs })}</p>
            {page.paragraphs === 0 ? (
              <p className="mt-2 text-secondary text-ink-muted">{t('pages.noText')}</p>
            ) : (
              <ol className="mt-2 flex flex-col gap-2">
                {Array.from({ length: page.paragraphs }, (_, i) => (
                  <li key={i} className="flex flex-wrap items-start gap-2">
                    <span className="min-w-0 flex-1 rounded-[var(--radius-md)] bg-surface-muted px-3 py-2 font-read" lang={language}>
                      <span className="mr-2 font-sans text-secondary text-ink-muted">{t('text.paragraph', { n: first + i + 1 })}</span>
                      {paragraphText(first + i) || '…'}
                    </span>
                    {i < page.paragraphs - 1 && (
                      <button type="button" className={buttonClass('ghost', 'sm')} onClick={() => onSplit(i + 1)}>
                        <Scissors aria-hidden className="size-4" />
                        {t('pages.split')}
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {problems.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-[var(--radius-md)] bg-ochre/10 p-3 text-secondary">
              {problems.map((problem) => (
                <li key={problem}>{t(`pages.problem.${problem}`)}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-label">{t('pages.illustration')}</p>
          {!illustrated ? (
            <p className="text-secondary text-ink-muted">{t('pages.noIllustration')}</p>
          ) : (
            <>
              <div
                className={`overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-muted ${page.span === 2 ? 'aspect-[3/2]' : 'aspect-[3/4]'}`}
              >
                {file ? (
                  <img src={`${ILLUSTRATIONS}/${file}`} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-secondary text-ink-muted">
                    <ImageOff aria-hidden className="size-6" />
                    {t('pages.pending')}
                  </div>
                )}
              </div>
              {redraw?.hint && page.illustration?.scene && <p className="text-secondary text-ink-muted">{t('generate.redrawHint')}</p>}
              <input
                ref={input}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                aria-label={t('pages.upload', { n })}
                onChange={(event) => {
                  const chosen = event.target.files?.[0]
                  if (chosen) upload.mutate(chosen, { onSuccess: (media) => onIllustration({ file: media.file }) })
                  event.target.value = ''
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" className={buttonClass('secondary', 'sm')} onClick={() => input.current?.click()} disabled={upload.isPending}>
                  <ImageUp aria-hidden className="size-4" />
                  {t('pages.upload', { n })}
                </button>
                {redraw && page.illustration?.scene && (
                  <button type="button" className={buttonClass('secondary', 'sm')} disabled={redraw.disabled} onClick={redraw.run}>
                    <RefreshCw aria-hidden className={`size-4 ${redraw.pending ? 'motion-safe:animate-spin' : ''}`} />
                    {redraw.pending ? t('generate.redrawing') : t('generate.redraw')}
                  </button>
                )}
                {file && (
                  <button type="button" className={buttonClass('ghost', 'sm')} onClick={() => onIllustration({ file: null })}>
                    <X aria-hidden className="size-4" />
                    {t('pages.removeIllustration')}
                  </button>
                )}
              </div>
              <p aria-live="polite" className="text-secondary text-danger empty:hidden">
                {upload.isError ? t('pages.uploadError') : redraw?.failed ? t('generate.redrawError') : ''}
              </p>
              {interfaceLanguages.map((code) => (
                <label key={code} className="flex flex-col gap-1">
                  <span className="text-secondary font-semibold">{t('pages.alt', { language: languageName(code) })}</span>
                  <textarea
                    className={`${fieldClass} min-h-20`}
                    lang={code}
                    maxLength={300}
                    value={page.illustration?.alt[code] ?? ''}
                    onChange={(e) => onIllustration({ alt: { ...(page.illustration?.alt ?? {}), [code]: e.target.value } })}
                  />
                </label>
              ))}
              <label className="flex flex-col gap-1">
                <span className="text-secondary font-semibold">{t('pages.scene')}</span>
                <span className="text-secondary text-ink-muted">{t('pages.sceneHint')}</span>
                <textarea
                  className={`${fieldClass} min-h-20`}
                  maxLength={1000}
                  value={page.illustration?.scene ?? ''}
                  onChange={(e) => onIllustration({ scene: e.target.value || null })}
                />
              </label>
            </>
          )}
        </div>
      </div>
    </li>
  )
}
