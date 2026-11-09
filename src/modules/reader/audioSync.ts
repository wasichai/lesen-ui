// la sincronización del audio con el texto, sin React ni navegador: qué palabra suena en cada instante, adónde saltar
// para una palabra, una oración o un párrafo, y cuándo parar si solo se escucha un párrafo. Los tiempos vienen del
// backend (ADR-0008 de lesen): uno por palabra, en orden y sin solaparse

export interface TimeRange {
  id: string
  startMs: number
  endMs: number
}

export interface AudioIndex {
  ids: string[]
  starts: number[]
  ends: number[]
  byId: Map<string, number>
  sentences: TimeRange[]
  paragraphs: TimeRange[]
}

// una palabra sigue resaltada un instante tras terminar, para que el resaltado no parpadee en las pausas cortas
export const LINGER_MS = 250

export function buildIndex(timings: [string, number, number][], sentences: TimeRange[], paragraphs: TimeRange[]): AudioIndex {
  const sorted = [...timings].sort((a, b) => a[1] - b[1])
  return {
    ids: sorted.map((t) => t[0]),
    starts: sorted.map((t) => t[1]),
    ends: sorted.map((t) => t[2]),
    byId: new Map(sorted.map((t, i) => [t[0], i])),
    sentences: [...sentences].sort((a, b) => a.startMs - b.startMs),
    paragraphs: [...paragraphs].sort((a, b) => a.startMs - b.startMs)
  }
}

// el último índice cuyo inicio es ≤ ms (búsqueda binaria), o -1
function lastStartAtOrBefore(starts: number[], ms: number): number {
  let low = 0
  let high = starts.length - 1
  let found = -1
  while (low <= high) {
    const mid = (low + high) >> 1
    if (starts[mid]! <= ms) {
      found = mid
      low = mid + 1
    } else high = mid - 1
  }
  return found
}

// la palabra que suena en `ms`, o null en un silencio largo (entre párrafos) y antes de la primera
export function activeWord(index: AudioIndex, ms: number): string | null {
  const at = lastStartAtOrBefore(index.starts, ms)
  if (at < 0) return null
  return ms < index.ends[at]! + LINGER_MS ? index.ids[at]! : null
}

function activeRange(ranges: TimeRange[], ms: number): string | null {
  const at = lastStartAtOrBefore(
    ranges.map((r) => r.startMs),
    ms
  )
  if (at < 0) return null
  return ms < ranges[at]!.endMs + LINGER_MS ? ranges[at]!.id : null
}

export const activeSentence = (index: AudioIndex, ms: number) => activeRange(index.sentences, ms)
export const activeParagraph = (index: AudioIndex, ms: number) => activeRange(index.paragraphs, ms)

// adónde saltar para escuchar desde una palabra (o desde la primera palabra con tiempo de su oración, si ella no lo tiene)
export function seekToWord(index: AudioIndex, tokenId: string): number | null {
  const at = index.byId.get(tokenId)
  return at === undefined ? null : index.starts[at]!
}

export function rangeOf(ranges: TimeRange[], id: string): TimeRange | null {
  return ranges.find((r) => r.id === id) ?? null
}

// el párrafo anterior o siguiente al que suena (o al último que sonó) para los botones ⏮ ⏭. Al principio de un párrafo,
// «anterior» va al de antes; pasado un segundo, vuelve al inicio del actual, como cualquier reproductor
export function neighbourParagraph(index: AudioIndex, ms: number, step: 1 | -1): number | null {
  const starts = index.paragraphs.map((p) => p.startMs)
  const at = lastStartAtOrBefore(starts, ms)
  if (step === 1) return starts[at + 1] ?? null
  if (at < 0) return 0
  if (ms - starts[at]! > 1000) return starts[at]!
  return starts[Math.max(0, at - 1)]!
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export const RATES = [0.75, 1, 1.25, 1.5] as const
