// la portada de una lectura: tamaño fijo por proporción (3:4) para que nada salte al cargar, perezosa y decorativa (el
// título va siempre en texto al lado). Sin portada, un bloque del color de acento de la lectura
export function Cover({ src, accent, className = '', eager = false }: { src: string | null; accent: string | null; className?: string; eager?: boolean }) {
  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] ${className}`}
      style={{ backgroundColor: accent ?? 'var(--surface-muted)' }}
    >
      {src && (
        <img
          src={src}
          alt=""
          width={600}
          height={800}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  )
}
