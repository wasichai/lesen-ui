// los botones y enlaces con forma de botón de Lesen: objetivos de 44 px, esquinas de token (--radius-button, --radius-chip)
// y foco visible (index.css)
type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet'
type Size = 'md' | 'sm' | 'icon'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-strong shadow-sm',
  secondary: 'bg-surface-raised text-ink border border-border hover:border-border-control',
  ghost: 'text-ink hover:bg-surface-muted',
  quiet: 'text-link underline underline-offset-4 hover:text-brand-strong'
}

const SIZES: Record<Size, string> = {
  md: 'min-h-11 px-5 text-label rounded-[var(--radius-button)]',
  sm: 'min-h-11 px-4 text-secondary font-semibold rounded-[var(--radius-button)]',
  icon: 'size-11 rounded-[var(--radius-button)] justify-center'
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = ''): string {
  return `inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${extra}`.trim()
}

export const chipClass = (selected: boolean) =>
  `inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-chip)] border px-4 text-secondary font-semibold transition-colors ${
    selected ? 'border-brand bg-brand-soft text-brand-strong' : 'border-border bg-surface-raised text-ink hover:border-border-control'
  }`
