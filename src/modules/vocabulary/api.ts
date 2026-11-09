import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { orNull, useLesenApi } from '../../shared/api'
import { retryNetwork } from '../../shared/retry'
import { reviewOutcomeSchema, reviewQueueSchema, sentenceAudioSchema, statsSchema, type Rating } from './contract'

export function useReviewQueue(language: string | undefined, enabled = true) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: ['me', 'reviews', language ?? ''],
    queryFn: () => get(`/lesen/vocabulary/reviews/next?limit=20${language ? `&language=${language}` : ''}`, reviewQueueSchema),
    enabled,
    // la sesión trabaja sobre la cola que se pidió al empezar: no se vuelve a pedir sola mientras se repasa
    staleTime: Infinity,
    retry: retryNetwork
  })
}

export function useVocabularyStats(language: string | undefined) {
  const { get } = useLesenApi()
  return useQuery({
    queryKey: ['me', 'vocabulary-stats', language ?? ''],
    queryFn: () => get(`/lesen/vocabulary/stats${language ? `?language=${language}` : ''}`, statsSchema),
    retry: retryNetwork
  })
}

export function useReview() {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { vocabularyId: string; rating: Rating; clientId: string }) => send('POST', '/lesen/vocabulary/reviews', input, reviewOutcomeSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me', 'vocabulary'] })
      void queryClient.invalidateQueries({ queryKey: ['me', 'vocabulary-stats'] })
    }
  })
}

// escuchar la oración de origen de una palabra en la narración de su lectura, si la hay; sin audio, nada que escuchar
export function useSentenceAudio(source: { slug: string; version: number } | null, sentence: string | null) {
  const { get } = useLesenApi()
  const audio = useQuery({
    queryKey: ['audio', source?.slug, source?.version],
    queryFn: () => orNull(get(`/lesen/readings/${source!.slug}/versions/${source!.version}/audio`, sentenceAudioSchema)),
    enabled: Boolean(source && sentence),
    staleTime: Infinity,
    retry: retryNetwork
  })
  const asset = audio.data?.assets[0]
  const range = asset?.sentences.find((s) => s.id === sentence)
  const element = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(
    () => () => {
      element.current?.pause()
      element.current = null
    },
    [asset?.url]
  )
  const play = useCallback(() => {
    if (!asset || !range) return
    const player = element.current ?? new Audio(asset.url)
    element.current = player
    const stop = () => {
      if (player.currentTime * 1000 >= range.endMs) {
        player.pause()
        player.removeEventListener('timeupdate', stop)
      }
    }
    player.addEventListener('timeupdate', stop)
    player.onplay = () => setPlaying(true)
    player.onpause = () => setPlaying(false)
    player.currentTime = range.startMs / 1000
    void player.play().catch(() => setPlaying(false))
  }, [asset, range])
  return { available: Boolean(range), playing, play }
}
