// la marca de Lesen: un libro abierto sobre terracota. Decorativa: el nombre va siempre en texto al lado
export function LesenMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <rect width="64" height="64" rx="18" fill="var(--brand)" />
      <path d="M17 19c6 0 11 2 15 6 4-4 9-6 15-6v27c-6 0-11 2-15 6-4-4-9-6-15-6z" fill="var(--surface)" />
      <path d="M32 25v27" stroke="var(--brand)" strokeWidth="3" />
      <circle cx="46" cy="14" r="4" fill="var(--ochre)" />
    </svg>
  )
}
