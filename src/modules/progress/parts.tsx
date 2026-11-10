import { Check } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Achievement, Day, Metric, Score } from './contract'
import { PROGRESS_MODULE_ID } from './i18n'
import { achievementPercent, bars, dayName, hoursAndMinutes, shortDate } from './progressModel'

// una cifra del panel con su etiqueta y si es medida o estimada (lo estimado lleva «≈» y borde discontinuo)
export function MetricValue({ label, metric, format }: { label: string; metric: Metric; format?: (value: number) => string }) {
  const estimated = metric.kind === 'ESTIMATED'
  return (
    <div data-ui="metric" className="flex min-w-0 flex-col gap-1 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4">
      <dt className="text-secondary text-ink-muted">{label}</dt>
      <dd className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-h2 tabular-nums">
          {estimated && <span aria-hidden>≈ </span>}
          {format ? format(metric.value) : metric.value.toLocaleString()}
        </span>
        <KindTag kind={metric.kind} />
      </dd>
    </div>
  )
}

export function KindTag({ kind }: { kind: Metric['kind'] }) {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  return (
    <span
      title={t(`kind.${kind}Hint`)}
      className={`rounded-full border px-2 py-px text-[12.5px] font-semibold text-ink-muted ${kind === 'ESTIMATED' ? 'border-dashed border-ink-muted italic' : 'border-border'}`}
    >
      {t(`kind.${kind}`)}
    </span>
  )
}

export function useDuration() {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  return (minutes: number) => {
    const split = hoursAndMinutes(minutes)
    return split.hours > 0 ? t('hours', split) : t('minutesOnly', { minutes: split.minutes })
  }
}

// barras de minutos por día en un svg, con la misma información en una tabla para tecnologías de apoyo
export function DayBars({ days, caption, labels = 'none' }: { days: Day[]; caption: string; labels?: 'none' | 'weekday' }) {
  const { t, i18n } = useTranslation(PROGRESS_MODULE_ID)
  const id = useId()
  const height = 56
  const heights = bars(
    days.map((day) => day.minutes),
    height
  )
  const step = 10
  return (
    <figure className="flex flex-col gap-2">
      <svg
        aria-hidden
        viewBox={`0 0 ${days.length * step} ${height + 4}`}
        preserveAspectRatio="none"
        className={`w-full ${labels === 'weekday' ? 'h-32' : 'h-24'}`}
      >
        {days.map((day, i) => (
          <g key={day.date}>
            <rect x={i * step + 1.5} y={height + 1} width={step - 3} height={3} rx={1} className="fill-border" />
            {heights[i]! > 0 && (
              <rect
                x={i * step + 1.5}
                y={height + 2 - heights[i]!}
                width={step - 3}
                height={heights[i]!}
                rx={1.5}
                className={day.goalMet ? 'fill-brand' : 'fill-sage'}
              />
            )}
          </g>
        ))}
      </svg>
      {labels === 'weekday' && (
        <div aria-hidden className="grid text-center text-[12.5px] text-ink-muted" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day) => (
            <span key={day.date}>{dayName(day.date, i18n.language, 'narrow')}</span>
          ))}
        </div>
      )}
      <figcaption id={id} className="sr-only">
        {caption}
      </figcaption>
      <table aria-labelledby={id} className="sr-only">
        <thead>
          <tr>
            <th scope="col">{t('days.day')}</th>
            <th scope="col">{t('days.minutes')}</th>
            <th scope="col">{t('days.goalMet')}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">
                {dayName(day.date, i18n.language, 'long')} {shortDate(day.date, i18n.language)}
              </th>
              <td>{day.minutes}</td>
              <td>{day.goalMet ? t('days.yes') : t('days.no')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

// palabras guardadas por semana: barras con su número encima
export function WeekBars({ weeks, caption }: { weeks: { weekStart: string; value: number }[]; caption: string }) {
  const { t, i18n } = useTranslation(PROGRESS_MODULE_ID)
  const heights = bars(
    weeks.map((w) => w.value),
    64
  )
  return (
    <figure>
      <figcaption className="sr-only">{caption}</figcaption>
      <ol className="grid h-32 items-end gap-2" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {weeks.map((week, i) => (
          <li key={week.weekStart} className="flex h-full flex-col items-center justify-end gap-1">
            <span className="text-[12.5px] font-semibold tabular-nums text-ink-muted">
              <span className="sr-only">{t('vocabulary.week', { date: shortDate(week.weekStart, i18n.language) })}: </span>
              {week.value}
            </span>
            <span
              aria-hidden
              className={`w-full max-w-8 rounded-t-md ${week.value > 0 ? 'bg-sea' : 'bg-border'}`}
              style={{ height: Math.max(3, heights[i]!) }}
            />
          </li>
        ))}
      </ol>
    </figure>
  )
}

// un reparto de la comprensión (por tipo o por nivel): etiqueta, barra y porcentaje
export function ScoreList({ title, scores, label }: { title: string; scores: Score[]; label: (key: string) => string }) {
  const { t } = useTranslation(PROGRESS_MODULE_ID)
  return (
    <div>
      <h3 className="mb-3 text-label">{title}</h3>
      <ul className="flex flex-col gap-3">
        {scores.map((score) => (
          <li key={score.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="truncate">{label(score.key)}</span>
            <span className="text-secondary font-semibold tabular-nums">{score.score} %</span>
            <span aria-hidden className="col-span-2 h-2 overflow-hidden rounded-full bg-border">
              <span className="block h-full rounded-full bg-plum" style={{ width: `${score.score}%` }} />
            </span>
            <span className="col-span-2 text-[12.5px] text-ink-muted">{t('comprehension.answeredCount', { count: score.answered })}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AchievementItem({ achievement }: { achievement: Achievement }) {
  const { t, i18n } = useTranslation(PROGRESS_MODULE_ID)
  const earned = achievement.earnedAt !== null
  const percent = achievementPercent(achievement)
  return (
    <li
      className={`flex items-start gap-3 rounded-[var(--radius-card)] border p-4 ${earned ? 'border-brand/40 bg-brand-soft/50' : 'border-border bg-surface-raised'}`}
    >
      <span
        aria-hidden
        className={`grid size-10 shrink-0 place-items-center rounded-full ${earned ? 'bg-brand text-on-brand' : 'border border-dashed border-border-control text-ink-muted'}`}
      >
        {earned ? <Check className="size-5" /> : <span className="text-[12.5px] font-semibold tabular-nums">{percent}%</span>}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{t(`achievements.code.${achievement.code}`, { defaultValue: achievement.code })}</p>
        <p className="text-secondary text-ink-muted">
          {earned
            ? t('achievements.earned', {
                date: new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long' }).format(new Date(achievement.earnedAt!))
              })
            : t('achievements.progress', { value: achievement.value, threshold: achievement.threshold })}
        </p>
      </div>
    </li>
  )
}

export function Card({ title, children, action, id }: { title: string; children: ReactNode; action?: ReactNode; id?: string }) {
  const generated = useId()
  const heading = id ?? generated
  return (
    <section
      aria-labelledby={heading}
      data-ui="panel"
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface-raised p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={heading} className="font-display text-h3">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
