import { useCallback, useEffect, useRef, useState } from 'react'
import { activeParagraph, activeSentence, activeWord, type AudioIndex } from './audioSync'

export type AudioStatus = 'loading' | 'ready' | 'buffering' | 'error'

export interface AudioState {
  status: AudioStatus
  playing: boolean
  currentMs: number
  durationMs: number
  rate: number
  volume: number
}

const POSITION_KEY = (slug: string, version: number) => `lesen.audio.${slug}.${version}`

// un reproductor que no se reinicia al volver a pintar: un único HTMLAudioElement por fuente, creado una vez. El resaltado
// de la palabra que suena no pasa por el estado de React: en cada fotograma se marca el token en el DOM (data-playing) y la
// oración (data-spoken), así los párrafos no se vuelven a pintar mientras suena. El reloj de la barra se refresca 4 veces
// por segundo, que basta a la vista
export function useAudioPlayer({
  src,
  index,
  slug,
  version,
  onWord
}: {
  src: string | null
  index: AudioIndex | null
  slug: string
  version: number
  onWord?: (tokenId: string | null) => void
}) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const stopAt = useRef<number | null>(null)
  const marked = useRef<{ word: Element | null; sentence: Element | null; paragraph: Element | null }>({ word: null, sentence: null, paragraph: null })
  const lastWord = useRef<string | null>(null)
  const onWordRef = useRef(onWord)
  onWordRef.current = onWord
  const [state, setState] = useState<AudioState>({ status: 'loading', playing: false, currentMs: 0, durationMs: 0, rate: 1, volume: 1 })

  const mark = useCallback(
    (ms: number) => {
      if (!index) return
      const word = activeWord(index, ms)
      const sentence = activeSentence(index, ms)
      const paragraph = activeParagraph(index, ms)
      const swap = (key: 'word' | 'sentence' | 'paragraph', id: string | null, attribute: string) => {
        const next = id ? document.getElementById(key === 'word' ? `w-${id}` : id) : null
        if (marked.current[key] === next) return
        marked.current[key]?.removeAttribute(attribute)
        next?.setAttribute(attribute, 'true')
        marked.current[key] = next
      }
      swap('word', word, 'data-playing')
      swap('sentence', sentence, 'data-spoken')
      swap('paragraph', paragraph, 'data-spoken')
      if (word !== lastWord.current) {
        lastWord.current = word
        onWordRef.current?.(word)
      }
    },
    [index]
  )

  const clearMarks = useCallback(() => {
    marked.current.word?.removeAttribute('data-playing')
    marked.current.sentence?.removeAttribute('data-spoken')
    marked.current.paragraph?.removeAttribute('data-spoken')
    marked.current = { word: null, sentence: null, paragraph: null }
    lastWord.current = null
    onWordRef.current?.(null)
  }, [])

  useEffect(() => {
    if (!src) return
    const element = new Audio()
    element.preload = 'metadata'
    element.src = src
    audio.current = element
    let saved = 0
    try {
      saved = Number(localStorage.getItem(POSITION_KEY(slug, version)) ?? 0)
    } catch {
      saved = 0
    }
    const update = (patch: Partial<AudioState>) => setState((current) => ({ ...current, ...patch }))
    const onMeta = () => {
      if (saved > 0 && saved < element.duration) element.currentTime = saved
      update({ status: 'ready', durationMs: Math.round(element.duration * 1000), currentMs: Math.round(element.currentTime * 1000) })
    }
    const save = () => {
      try {
        localStorage.setItem(POSITION_KEY(slug, version), String(element.currentTime))
      } catch {
        // sin almacenamiento: la posición vale para esta visita
      }
    }
    const onPlay = () => update({ playing: true })
    const onPause = () => {
      update({ playing: false, currentMs: Math.round(element.currentTime * 1000) })
      save()
    }
    const onEnded = () => {
      update({ playing: false })
      element.currentTime = 0
      save()
      clearMarks()
    }
    const listeners: [string, () => void][] = [
      ['loadedmetadata', onMeta],
      ['play', onPlay],
      ['pause', onPause],
      ['ended', onEnded],
      ['waiting', () => update({ status: 'buffering' })],
      ['playing', () => update({ status: 'ready' })],
      ['canplay', () => update({ status: 'ready' })],
      ['error', () => update({ status: 'error', playing: false })],
      ['ratechange', () => update({ rate: element.playbackRate })],
      ['volumechange', () => update({ volume: element.volume })],
      ['seeked', () => update({ currentMs: Math.round(element.currentTime * 1000) })]
    ]
    for (const [event, handler] of listeners) element.addEventListener(event, handler)
    return () => {
      save()
      element.pause()
      for (const [event, handler] of listeners) element.removeEventListener(event, handler)
      element.removeAttribute('src')
      element.load()
      audio.current = null
      clearMarks()
    }
  }, [src, slug, version, clearMarks])

  // mientras suena: el resaltado en cada fotograma y el reloj 4 veces por segundo; parar al final del párrafo pedido
  useEffect(() => {
    if (!state.playing) return
    let frame = 0
    let lastTick = 0
    const loop = (now: number) => {
      const element = audio.current
      if (!element) return
      const ms = element.currentTime * 1000
      if (stopAt.current !== null && ms >= stopAt.current) {
        stopAt.current = null
        element.pause()
        return
      }
      mark(ms)
      if (now - lastTick > 250) {
        lastTick = now
        setState((current) => ({ ...current, currentMs: Math.round(ms) }))
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [state.playing, mark])

  const play = useCallback(async () => {
    try {
      await audio.current?.play()
    } catch {
      setState((current) => ({ ...current, playing: false }))
    }
  }, [])
  const pause = useCallback(() => audio.current?.pause(), [])
  const seek = useCallback(
    (ms: number) => {
      const element = audio.current
      if (!element) return
      element.currentTime = Math.max(0, ms / 1000)
      setState((current) => ({ ...current, currentMs: Math.round(ms) }))
      mark(ms)
    },
    [mark]
  )
  // escuchar desde un punto; con `until`, solo hasta ahí (un párrafo)
  const playFrom = useCallback(
    async (ms: number, until: number | null = null) => {
      stopAt.current = until
      seek(ms)
      await play()
    },
    [play, seek]
  )
  const setRate = useCallback((rate: number) => {
    if (audio.current) audio.current.playbackRate = rate
  }, [])
  const setVolume = useCallback((volume: number) => {
    if (audio.current) audio.current.volume = volume
  }, [])
  return { state, play, pause, seek, playFrom, setRate, setVolume, element: audio }
}
