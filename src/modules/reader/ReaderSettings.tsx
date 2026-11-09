import { Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { chipClass, buttonClass } from '../../shared/ui'
import type { ReaderTheme } from '../../theme/themes'
import { READER_MODULE_ID } from './i18n'
import { LEADINGS, SIZES, stepSize, type Leading, type ReaderPreferences } from './readerPreferences'

const SWATCH: Record<ReaderTheme, string> = { light: '#fffdf8', sepia: '#f4ecdd', dark: '#121318' }

export function ReaderSettings({ preferences, update }: { preferences: ReaderPreferences; update: (change: Partial<ReaderPreferences>) => void }) {
  const { t } = useTranslation(READER_MODULE_ID)
  return (
    <div className="mt-6 flex flex-col gap-7">
      <fieldset>
        <legend className="text-label">{t('settings.size')}</legend>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            className={buttonClass('secondary', 'icon')}
            aria-label={t('settings.smaller')}
            disabled={preferences.size === SIZES[0]}
            onClick={() => update({ size: stepSize(preferences.size, -1) })}
          >
            <Minus aria-hidden className="size-4" />
          </button>
          <output aria-live="polite" className="min-w-16 text-center font-read text-[22px]">
            {preferences.size}px
          </output>
          <button
            type="button"
            className={buttonClass('secondary', 'icon')}
            aria-label={t('settings.larger')}
            disabled={preferences.size === SIZES.at(-1)}
            onClick={() => update({ size: stepSize(preferences.size, 1) })}
          >
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-label">{t('settings.leading')}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(LEADINGS) as Leading[]).map((leading) => (
            <button
              key={leading}
              type="button"
              aria-pressed={preferences.leading === leading}
              className={chipClass(preferences.leading === leading)}
              onClick={() => update({ leading })}
            >
              {t(`settings.leadings.${leading}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-label">{t('settings.theme')}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['light', 'sepia', 'dark'] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              aria-pressed={preferences.theme === theme}
              className={chipClass(preferences.theme === theme)}
              onClick={() => update({ theme })}
            >
              <span aria-hidden className="size-4 rounded-full border border-border-control" style={{ backgroundColor: SWATCH[theme] }} />
              {t(`settings.themes.${theme}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-label">{t('settings.assistance')}</legend>
        <Toggle checked={preferences.highlightSaved} onChange={(highlightSaved) => update({ highlightSaved })} label={t('settings.highlightSaved')} />
        <Toggle
          checked={preferences.highlightNew}
          onChange={(highlightNew) => update({ highlightNew })}
          label={t('settings.highlightNew')}
          hint={t('settings.highlightNewHint')}
        />
        <Toggle checked={preferences.highlightLearned} onChange={(highlightLearned) => update({ highlightLearned })} label={t('settings.highlightLearned')} />
        <Toggle
          checked={preferences.paragraphTranslations}
          onChange={(paragraphTranslations) => update({ paragraphTranslations })}
          label={t('settings.paragraphTranslations')}
          hint={t('settings.paragraphTranslationsHint')}
        />
        <Toggle checked={preferences.followPosition} onChange={(followPosition) => update({ followPosition })} label={t('settings.followPosition')} />
      </fieldset>
    </div>
  )
}

// un interruptor: casilla nativa con aspecto de interruptor (teclado y lectores de pantalla como cualquier casilla)
function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (checked: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-[var(--radius-md)] py-1">
      <span className="flex flex-col">
        <span>{label}</span>
        {hint && <span className="text-secondary text-ink-muted">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-border-control transition-colors peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-focus after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-surface-raised after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  )
}
