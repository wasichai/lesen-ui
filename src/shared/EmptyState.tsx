import type { ComponentType, ReactNode } from 'react'

// un vacío amable: una ilustración sencilla, qué pasa y qué hacer ahora
export function EmptyState({
  icon: Icon,
  title,
  body,
  action
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-14 text-center">
      <div aria-hidden className="grid size-20 place-items-center rounded-full bg-brand-soft text-brand-strong">
        <Icon className="size-9" />
      </div>
      <h2 className="font-display text-h3">{title}</h2>
      {body && <p className="text-ink-muted">{body}</p>}
      {action}
    </div>
  )
}
