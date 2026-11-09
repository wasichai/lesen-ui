import { useTranslation } from 'react-i18next'
import { APP_NAMESPACE } from './appMessages'

// bloques grises mientras carga, del tamaño de lo que vendrá: nada salta al llegar los datos
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-[var(--radius-md)] bg-surface-muted ${className}`} />
}

export function LoadingRegion({ children, label }: { children: React.ReactNode; label?: string }) {
  const { t } = useTranslation(APP_NAMESPACE)
  return (
    <div role="status" aria-live="polite" aria-label={label ?? t('state.loading')}>
      {children}
    </div>
  )
}
