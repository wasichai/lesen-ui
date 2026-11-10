import type { Block, ImageBlock, Paragraph, ReadingContent, Sentence, Token } from './contract'

// el lector sin React: orden de oraciones y palabras, avance, tiempo restante y navegación con teclado

export interface ReaderIndex {
  sentences: Sentence[]
  sentenceAt: Map<string, number>
  words: Token[]
  wordAt: Map<string, number>
  sentenceOfWord: Map<string, string>
  paragraphOfSentence: Map<string, string>
}

export function indexContent(content: ReadingContent): ReaderIndex {
  const sentences: Sentence[] = []
  const words: Token[] = []
  const sentenceOfWord = new Map<string, string>()
  const paragraphOfSentence = new Map<string, string>()
  for (const paragraph of content.paragraphs) {
    for (const sentence of paragraph.sentences) {
      sentences.push(sentence)
      paragraphOfSentence.set(sentence.id, paragraph.id)
      for (const token of sentence.tokens) {
        if (token.kind !== 'WORD') continue
        words.push(token)
        sentenceOfWord.set(token.id, sentence.id)
      }
    }
  }
  return {
    sentences,
    sentenceAt: new Map(sentences.map((s, i) => [s.id, i])),
    words,
    wordAt: new Map(words.map((w, i) => [w.id, i])),
    sentenceOfWord,
    paragraphOfSentence
  }
}

// el avance de quien está en una oración: las oraciones hasta esa incluida, sobre el total. La última es el 100 %
export function percentAt(index: ReaderIndex, sentenceId: string | null): number {
  if (!sentenceId || index.sentences.length === 0) return 0
  const at = index.sentenceAt.get(sentenceId)
  if (at === undefined) return 0
  return Math.round(((at + 1) / index.sentences.length) * 100)
}

export function remainingMinutes(minutes: number, percent: number): number {
  return Math.max(0, Math.ceil((minutes * (100 - Math.max(0, Math.min(100, percent)))) / 100))
}

// el texto de una oración tal como se escribió (palabras, signos y espacios)
export function sentenceText(sentence: Sentence): string {
  return sentence.tokens
    .map((token) => token.text + (token.space ? ' ' : ''))
    .join('')
    .trim()
}

// la palabra siguiente o anterior para las flechas; en los extremos, se queda
export function neighbourWord(index: ReaderIndex, wordId: string, step: 1 | -1): string {
  const at = index.wordAt.get(wordId)
  if (at === undefined) return index.words[0]?.id ?? wordId
  return index.words[Math.max(0, Math.min(index.words.length - 1, at + step))]!.id
}

// la primera palabra de la oración siguiente o anterior (flechas arriba y abajo)
export function neighbourSentenceWord(index: ReaderIndex, wordId: string, step: 1 | -1): string {
  const sentence = index.sentenceOfWord.get(wordId)
  const at = sentence ? index.sentenceAt.get(sentence) : undefined
  if (at === undefined) return wordId
  for (let i = at + step; i >= 0 && i < index.sentences.length; i += step) {
    const first = index.sentences[i]!.tokens.find((token) => token.kind === 'WORD')
    if (first) return first.id
  }
  return wordId
}

// de varias oraciones visibles, la que está más arriba en el orden del texto: dónde está quien lee
export function topmost(index: ReaderIndex, visible: Iterable<string>): string | null {
  let best: string | null = null
  let bestAt = Number.POSITIVE_INFINITY
  for (const id of visible) {
    const at = index.sentenceAt.get(id)
    if (at !== undefined && at < bestAt) {
      best = id
      bestAt = at
    }
  }
  return best
}

// segundos de lectura a enviar: los que ya tenía guardados más los de esta sesión, solo mientras la página se ve
export function totalSeconds(stored: number, sessionMs: number): number {
  return stored + Math.floor(sessionMs / 1000)
}

// el orden de lectura: los párrafos con las imágenes entre ellos donde las pone el servidor (ADR-0018 del backend). Sin
// bloques, los párrafos tal cual. Un bloque que remite a un párrafo que no está se salta: nada se inventa
export type ReadingItem = { kind: 'paragraph'; paragraph: Paragraph } | { kind: 'image'; image: ImageBlock }

export function readingOrder(paragraphs: Paragraph[], blocks: Block[] | null | undefined): ReadingItem[] {
  if (!blocks?.length) return paragraphs.map((paragraph) => ({ kind: 'paragraph', paragraph }))
  const byId = new Map(paragraphs.map((p) => [p.id, p]))
  const items: ReadingItem[] = []
  for (const block of blocks) {
    if (block.type === 'image') items.push({ kind: 'image', image: block })
    else {
      const paragraph = byId.get(block.id)
      if (paragraph) items.push({ kind: 'paragraph', paragraph })
    }
  }
  return items
}
