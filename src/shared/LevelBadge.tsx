import { useTranslation } from 'react-i18next'
import { APP_NAMESPACE } from './appMessages'
import type { Level } from './schemas'

// el nivel del MCER: el código y, para lectores de pantalla, su nombre
export function LevelBadge({ level, tone = 'solid' }: { level: Level; tone?: 'solid' | 'onImage' }) {
  const { t } = useTranslation(APP_NAMESPACE)
  const styles = tone === 'onImage' ? 'bg-surface-raised/95 text-ink shadow-sm' : 'bg-surface-muted text-ink border border-border'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-bold tracking-wide ${styles}`} title={t(`level.${level}`)}>
      {level}
      <span className="sr-only"> · {t(`level.${level}`)}</span>
    </span>
  )
}
