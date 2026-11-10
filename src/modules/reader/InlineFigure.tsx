import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImageBlock } from './contract'
import { READER_MODULE_ID } from './i18n'

// una imagen entre párrafos (ADR-0018 del backend): el sitio reservado con su ancho y su alto antes de cargarla, el texto
// alternativo y el pie en el idioma de la lectura. Si no carga, se dice: nunca otra imagen en su lugar
export function InlineFigure({ image, language }: { image: ImageBlock; language: string }) {
  const { t } = useTranslation(READER_MODULE_ID)
  const [failed, setFailed] = useState(false)
  return (
    <figure className="my-[0.4em] font-sans" data-image={image.id}>
      {failed ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-surface-muted p-6 text-center text-secondary text-ink-muted"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          <ImageOff aria-hidden className="size-6" />
          {t('text.imageError')}
        </div>
      ) : (
        <img
          src={image.url}
          alt={image.alt}
          lang={language}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-auto w-full rounded-[var(--radius-lg)] bg-surface-muted"
        />
      )}
      {image.caption && (
        <figcaption lang={language} className="mt-2 text-center text-secondary italic text-ink-muted">
          {image.caption}
        </figcaption>
      )}
    </figure>
  )
}
