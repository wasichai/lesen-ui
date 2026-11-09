// una barra de avance con su valor para tecnologías de apoyo
export function ProgressBar({ percent, label, className = '' }: { percent: number; label: string; className?: string }) {
  const value = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={`h-1.5 overflow-hidden rounded-full bg-border ${className}`}
    >
      <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  )
}
