import { Dialog, DialogContent, DialogTitle } from '@wasichai/ui'
import type { ReactNode } from 'react'

// una hoja modal sobre el Dialog de @wasichai/ui (foco atrapado, Escape, bloqueo de scroll que respeta la CSP):
// «bottom» sube desde abajo (móvil), «right» entra por la derecha (escritorio). El título es obligatorio: nombra la hoja
export function Sheet({
  open,
  onOpenChange,
  title,
  side,
  children,
  hideTitle = false,
  describedBy
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  side: 'bottom' | 'right'
  children: ReactNode
  hideTitle?: boolean
  describedBy?: string
}) {
  const placement =
    side === 'bottom'
      ? 'top-auto bottom-0 left-0 translate-x-0 translate-y-0 max-w-none w-full max-h-[85dvh] rounded-t-[var(--radius-xl)] rounded-b-none border-x-0 border-b-0 pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-sheet'
      : 'top-0 bottom-0 left-auto right-0 translate-x-0 translate-y-0 max-w-[26rem] w-full h-dvh rounded-none border-y-0 border-r-0 animate-rise'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`overflow-y-auto overscroll-contain p-6 ${placement}`} aria-describedby={describedBy}>
        {side === 'bottom' && <div aria-hidden className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-border" />}
        <DialogTitle className={hideTitle ? 'sr-only' : 'pr-10 font-display text-h3'}>{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
}
