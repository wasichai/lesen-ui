import { useApiClient } from '@wasichai/core'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { queryKeys } from '../../shared/keys'
import type { Progress } from './contract'
import { percentAt, topmost, totalSeconds, type ReaderIndex } from './readerModel'

const SAVE_AFTER_MS = 1500

// dónde está quien lee y cuánto lleva: la oración más alta visible, guardada en el servidor poco después de moverse y
// al ocultar la página (keepalive, para que llegue aunque se cierre). El tiempo cuenta solo con la página visible
export function useReadingPosition({
  slug,
  version,
  index,
  stored,
  container
}: {
  slug: string
  version: number
  index: ReaderIndex | null
  stored: Progress | null
  container: React.RefObject<HTMLElement | null>
}) {
  const client = useApiClient()
  const queryClient = useQueryClient()
  const [position, setPosition] = useState<string | null>(stored?.version === version ? stored.position : null)
  const visible = useRef(new Set<string>())
  const sessionMs = useRef(0)
  const shownSince = useRef<number | null>(typeof document !== 'undefined' && document.visibilityState === 'visible' ? Date.now() : null)
  const lastSent = useRef<string>('')
  const baseSeconds = stored?.secondsRead ?? 0
  const furthest = useRef(stored?.version === version ? stored.percent : 0)

  const elapsed = useCallback(() => sessionMs.current + (shownSince.current === null ? 0 : Date.now() - shownSince.current), [])

  const send = useCallback(
    (keepalive: boolean) => {
      if (!index) return
      const percent = Math.max(furthest.current, percentAt(index, position))
      furthest.current = percent
      const body = { version, position, percent, secondsRead: totalSeconds(baseSeconds, elapsed()) }
      const fingerprint = `${position}|${percent}|${Math.floor(body.secondsRead / 15)}`
      if (fingerprint === lastSent.current) return
      lastSent.current = fingerprint
      client
        .request<Progress>(`/lesen/readings/${encodeURIComponent(slug)}/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          keepalive
        })
        .then((saved) => queryClient.setQueryData(['me', 'progress-live', slug], saved))
        .catch(() => {
          // se reintenta con el siguiente movimiento; perder un informe no pierde lectura
          lastSent.current = ''
        })
    },
    [baseSeconds, client, elapsed, index, position, queryClient, slug, version]
  )

  // qué oraciones se ven: el observador las anota y la posición es la primera del texto
  useEffect(() => {
    const root = container.current
    if (!root || !index || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.sentence
          if (!id) continue
          if (entry.isIntersecting) visible.current.add(id)
          else visible.current.delete(id)
        }
        const top = topmost(index, visible.current)
        if (top) setPosition(top)
      },
      { rootMargin: '-15% 0px -45% 0px' }
    )
    root.querySelectorAll('[data-sentence]').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [container, index])

  useEffect(() => {
    if (!position) return
    const timer = setTimeout(() => send(false), SAVE_AFTER_MS)
    return () => clearTimeout(timer)
  }, [position, send])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (shownSince.current !== null) sessionMs.current += Date.now() - shownSince.current
        shownSince.current = null
        send(true)
      } else {
        shownSince.current = Date.now()
      }
    }
    const onHide = () => send(true)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onHide)
    }
  }, [send])

  // al salir del lector (navegación interna) también se guarda
  const sendRef = useRef(send)
  sendRef.current = send
  useEffect(() => () => sendRef.current(true), [])

  // lo guardado deja de valer como caché: la ficha y Mis lecturas lo vuelven a pedir
  useEffect(() => () => void queryClient.invalidateQueries({ queryKey: queryKeys.progress(slug) }), [queryClient, slug])

  return {
    position,
    percent: index ? Math.max(furthest.current, percentAt(index, position)) : 0,
    seconds: () => totalSeconds(baseSeconds, elapsed())
  }
}
