import { Check, Loader2, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { APP_NAMESPACE } from './appMessages'
import { commissionSteps, isRunning, stepsDone } from './commission'
import type { Commission } from './schemas'

// el avance de un encargo (ADR-0015 del backend): sus pasos, el actual anunciado, y por qué no salió si falló. Nunca se
// finge un avance que el servidor no dio
export function CommissionProgress({ commission }: { commission: Commission }) {
  const { t } = useTranslation(APP_NAMESPACE)
  const steps = commissionSteps(commission)
  const done = stepsDone(commission)
  const failed = commission.status === 'FAILED'
  return (
    <div className="flex flex-col gap-3">
      <ol aria-label={t('commission.progress')} className="flex flex-wrap gap-x-5 gap-y-2">
        {steps.map((step, i) => {
          const current = !failed && i === done
          const past = !failed && (i < done || commission.status === 'READY')
          return (
            <li
              key={step}
              aria-current={current ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 text-secondary ${past || current ? 'text-ink' : 'text-ink-muted'}`}
            >
              {past ? (
                <Check aria-hidden className="size-4 text-success" />
              ) : current && isRunning(commission.status) ? (
                <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />
              ) : (
                <span aria-hidden className="size-4 rounded-full border border-border-control" />
              )}
              {t(`commission.status.${step}`)}
            </li>
          )
        })}
      </ol>
      <p aria-live="polite" className="sr-only">
        {t(`commission.status.${commission.status}`)}
      </p>
      {failed && (
        <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-ochre/10 p-3 text-secondary">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {t(`commission.reason.${commission.reason ?? 'ERROR'}`, { defaultValue: t('commission.reason.other', { reason: commission.reason ?? '' }) })}
        </p>
      )}
      {commission.status === 'READY' && commission.request.format === 'PICTURE_BOOK' && (
        <p className="text-secondary text-ink-muted">
          {t('commission.illustrations', { count: commission.illustrations ?? 0 })}
          {commission.directedBy ? ` · ${t(`commission.directedBy.${commission.directedBy}`, { defaultValue: commission.directedBy })}` : ''}
        </p>
      )}
    </div>
  )
}
