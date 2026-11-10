import { CloudOff, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isNotFound } from './api'
import { APP_NAMESPACE } from './appMessages'
import { ContractError } from './contract'
import { buttonClass } from './ui'

// un fallo al cargar, dicho con calma y con su salida: reintentar. 404 es «no lo encontramos», no un error
export function ProblemState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation(APP_NAMESPACE)
  const missing = isNotFound(error)
  const Icon = missing ? SearchX : CloudOff
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
      <Icon aria-hidden className="size-10 text-ink-muted" />
      <h2 className="font-display text-h3">{missing ? t('state.notFound') : t('state.error')}</h2>
      <p className="text-ink-muted">{missing ? t('state.notFoundBody') : error instanceof ContractError ? t('state.contract') : t('state.errorBody')}</p>
      {onRetry && !missing && (
        <button type="button" className={buttonClass('secondary')} onClick={onRetry}>
          {t('state.retry')}
        </button>
      )}
    </div>
  )
}
