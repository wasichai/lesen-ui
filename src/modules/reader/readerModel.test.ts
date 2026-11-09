import { describe, expect, it } from 'vitest'
import type { ReadingContent } from './contract'
import { indexContent, neighbourSentenceWord, neighbourWord, percentAt, remainingMinutes, sentenceText, topmost, totalSeconds } from './readerModel'

const word = (id: string, text: string, space = true) => ({ id, text, kind: 'WORD' as const, space, entry: null })
const punct = (id: string, text: string, space = true) => ({ id, text, kind: 'PUNCT' as const, space, entry: null })

export const CONTENT: ReadingContent = {
  slug: 'demo',
  version: 1,
  language: 'de',
  current: true,
  paragraphs: [
    {
      id: 'p1',
      sentences: [
        { id: 'p1s1', tokens: [word('p1s1t1', 'Mia'), word('p1s1t2', 'wohnt'), word('p1s1t3', 'am'), word('p1s1t4', 'Meer', false), punct('p1s1t5', '.')] },
        { id: 'p1s2', tokens: [punct('p1s2t1', '„', false), word('p1s2t2', 'Hallo', false), punct('p1s2t3', '!', false), punct('p1s2t4', '“')] }
      ]
    },
    { id: 'p2', sentences: [{ id: 'p2s1', tokens: [word('p2s1t1', 'Ende', false), punct('p2s1t2', '.')] }] }
  ]
}

describe('modelo del lector', () => {
  const index = indexContent(CONTENT)

  it('indexa oraciones y palabras en orden, sin signos', () => {
    expect(index.sentences.map((s) => s.id)).toEqual(['p1s1', 'p1s2', 'p2s1'])
    expect(index.words.map((w) => w.text)).toEqual(['Mia', 'wohnt', 'am', 'Meer', 'Hallo', 'Ende'])
    expect(index.paragraphOfSentence.get('p2s1')).toBe('p2')
  })

  it('el avance es la oración actual sobre el total, y la última es el 100 %', () => {
    expect(percentAt(index, null)).toBe(0)
    expect(percentAt(index, 'p1s1')).toBe(33)
    expect(percentAt(index, 'p2s1')).toBe(100)
    expect(percentAt(index, 'nope')).toBe(0)
  })

  it('el tiempo restante se redondea hacia arriba y nunca es negativo', () => {
    expect(remainingMinutes(5, 0)).toBe(5)
    expect(remainingMinutes(5, 33)).toBe(4)
    expect(remainingMinutes(5, 100)).toBe(0)
    expect(remainingMinutes(5, 140)).toBe(0)
  })

  it('reconstruye el texto con sus espacios y signos', () => {
    expect(sentenceText(index.sentences[0]!)).toBe('Mia wohnt am Meer.')
    expect(sentenceText(index.sentences[1]!)).toBe('„Hallo!“')
  })

  it('las flechas recorren palabras y oraciones sin salirse', () => {
    expect(neighbourWord(index, 'p1s1t1', -1)).toBe('p1s1t1')
    expect(neighbourWord(index, 'p1s1t4', 1)).toBe('p1s2t2')
    expect(neighbourWord(index, 'p2s1t1', 1)).toBe('p2s1t1')
    expect(neighbourSentenceWord(index, 'p1s1t3', 1)).toBe('p1s2t2')
    expect(neighbourSentenceWord(index, 'p2s1t1', -1)).toBe('p1s2t2')
    expect(neighbourSentenceWord(index, 'p2s1t1', 1)).toBe('p2s1t1')
  })

  it('de las oraciones visibles, la primera del texto', () => {
    expect(topmost(index, ['p2s1', 'p1s2'])).toBe('p1s2')
    expect(topmost(index, [])).toBeNull()
  })

  it('suma los segundos de la sesión a los guardados', () => {
    expect(totalSeconds(120, 45_900)).toBe(165)
  })
})
