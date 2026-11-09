import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { READER_MODULE_ID } from './i18n'
import { WordDetails } from './WordDetails'

// el vistazo al pasar el cursor (solo con ratón): una tarjeta flotante junto a la palabra, debajo o encima según quepa,
// sin salirse de la pantalla. No atrapa el foco: el teclado abre la hoja completa con Intro
export function WordPreview({
  anchor,
  slug,
  version,
  tokenRef,
  word,
  language,
  saved,
  onEnter,
  onLeave
}: {
  anchor: HTMLElement
  slug: string
  version: number
  tokenRef: string
  word: string
  language: string
  saved: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const { t } = useTranslation(READER_MODULE_ID)
  const card = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' })
  useLayoutEffect(() => {
    const place = () => {
      const rect = anchor.getBoundingClientRect()
      const height = card.current?.offsetHeight ?? 160
      const width = Math.min(340, window.innerWidth - 24)
      const below = rect.bottom + 10 + height < window.innerHeight
      const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2))
      setStyle({ position: 'fixed', left, width, top: below ? rect.bottom + 10 : Math.max(12, rect.top - height - 10), visibility: 'visible' })
    }
    place()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place)
    if (card.current) observer?.observe(card.current)
    window.addEventListener('scroll', onLeave, { passive: true, once: true })
    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onLeave)
    }
  }, [anchor, onLeave])
  return (
    <div
      ref={card}
      role="dialog"
      aria-label={t('word.title', { word })}
      style={style}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="z-40 animate-rise rounded-[var(--radius-lg)] border border-border bg-surface-raised p-4 font-sans shadow-[var(--shadow-overlay)]"
    >
      <WordDetails slug={slug} version={version} tokenRef={tokenRef} language={language} mode="compact" saved={saved} />
    </div>
  )
}
