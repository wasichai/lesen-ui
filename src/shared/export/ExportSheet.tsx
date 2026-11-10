import { ApiError } from '@wasichai/core'
import { BookDown, Download, Printer } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_NAMESPACE } from '../appMessages'
import { Sheet } from '../Sheet'
import { buttonClass } from '../ui'
import { useIsWide } from '../useMediaQuery'
import { printDocument, saveFile, useDownload } from './download'
import { EXPORT_PARTS, exportFileName, exportPath, type ExportFormat, type ExportOptions, loadExportOptions, saveExportOptions } from './exportModel'

interface Target {
  slug: string
  version: number
  title: string
}

// el botón «Exportar» con su hoja, para la ficha de una lectura
export function ExportButton(target: Target) {
  const { t } = useTranslation(APP_NAMESPACE)
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={buttonClass('secondary')} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <BookDown aria-hidden className="size-4" />
        {t('export.open')}
      </button>
      <ExportSheet {...target} open={open} onOpenChange={setOpen} />
    </>
  )
}

export function ExportSheet({ open, onOpenChange, ...target }: Target & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation(APP_NAMESPACE)
  const wide = useIsWide()
  const hint = useId()
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('export.title')} side={wide ? 'right' : 'bottom'} describedBy={hint}>
      <p id={hint} className="mt-2 text-secondary text-ink-muted">
        {t('export.body')}
      </p>
      <ExportChoice {...target} />
    </Sheet>
  )
}

type Status = { state: 'idle' } | { state: 'busy'; format: ExportFormat } | { state: 'done'; format: ExportFormat } | { state: 'failed'; error: unknown }

export function ExportChoice({ slug, version, title }: Target) {
  const { t, i18n } = useTranslation(APP_NAMESPACE)
  const download = useDownload()
  const [options, setOptions] = useState<ExportOptions>(loadExportOptions)
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const legend = useId()

  const choose = (part: keyof ExportOptions, value: boolean) => {
    const next = { ...options, [part]: value }
    setOptions(next)
    saveExportOptions(next)
  }

  const run = async (format: ExportFormat) => {
    setStatus({ state: 'busy', format })
    try {
      const blob = await download(exportPath(slug, version, format, options, i18n.resolvedLanguage))
      if (format === 'epub') saveFile(blob, exportFileName(slug, version, format))
      else printDocument(await blob.text(), title)
      setStatus({ state: 'done', format })
    } catch (error) {
      setStatus({ state: 'failed', error })
    }
  }

  const busy = status.state === 'busy'
  return (
    <div className="mt-6 flex flex-col gap-6">
      <fieldset aria-labelledby={legend} className="flex flex-col gap-1">
        <legend id={legend} className="mb-1 text-label font-semibold">
          {t('export.include')}
        </legend>
        <p className="mb-2 text-secondary text-ink-muted">{t('export.always')}</p>
        {EXPORT_PARTS.map((part) => (
          <label key={part} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 hover:bg-surface-muted">
            <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={options[part]} onChange={(e) => choose(part, e.target.checked)} />
            <span>
              <span className="block">{t(`export.part.${part}`)}</span>
              <span className="block text-secondary text-ink-muted">{t(`export.partHint.${part}`)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-3">
        <button type="button" className={buttonClass('primary', 'md', 'justify-center')} onClick={() => void run('epub')} disabled={busy} aria-busy={busy}>
          <Download aria-hidden className="size-4" />
          {t('export.epub')}
        </button>
        <button type="button" className={buttonClass('secondary', 'md', 'justify-center')} onClick={() => void run('html')} disabled={busy} aria-busy={busy}>
          <Printer aria-hidden className="size-4" />
          {t('export.print')}
        </button>
      </div>
      <p className="text-secondary text-ink-muted">{t('export.apps')}</p>
      <p role="status" aria-live="polite" className={status.state === 'failed' ? 'font-semibold text-danger' : 'text-secondary'}>
        {status.state === 'busy'
          ? t('export.busy')
          : status.state === 'done'
            ? t(status.format === 'epub' ? 'export.downloaded' : 'export.printed')
            : status.state === 'failed'
              ? status.error instanceof ApiError && status.error.status === 403
                ? t('export.forbidden')
                : t('export.failed')
              : ''}
      </p>
    </div>
  )
}
