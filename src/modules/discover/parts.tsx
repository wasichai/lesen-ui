import type { ReactNode } from 'react'
import { ReadingTile } from '../../shared/ReadingTile'
import type { ReadingCard } from '../../shared/schemas'

// el titular de una sección de la portada, con su enlace opcional a la derecha
export function SectionHeading({ id, title, lead, action }: { id: string; title: string; lead?: string; action?: ReactNode }) {
  return (
    <div data-ui="section-heading" className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2 id={id} className="font-display text-h2">
          {title}
        </h2>
        {lead && <p className="mt-1 text-ink-muted">{lead}</p>}
      </div>
      {action}
    </div>
  )
}

// un carril de lecturas: se desliza en el móvil (con encaje) y es una rejilla desde tableta
export function Rail({ readings, labelledBy, badges }: { readings: ReadingCard[]; labelledBy: string; badges?: (reading: ReadingCard) => ReactNode }) {
  return (
    <ul
      aria-labelledby={labelledBy}
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-6"
    >
      {readings.map((reading) => (
        <li key={reading.slug} className="w-[42vw] max-w-[12rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
          <ReadingTile reading={reading} />
          {badges && <div className="mt-2 flex flex-wrap gap-1.5">{badges(reading)}</div>}
        </li>
      ))}
    </ul>
  )
}
