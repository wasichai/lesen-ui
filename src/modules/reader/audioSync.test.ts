import { describe, expect, it } from 'vitest'
import { activeParagraph, activeSentence, activeWord, buildIndex, formatClock, LINGER_MS, neighbourParagraph, rangeOf, seekToWord } from './audioSync'

const index = buildIndex(
  [
    ['p1s1t2', 400, 700],
    ['p1s1t1', 100, 380],
    ['p1s2t1', 1200, 1500],
    ['p2s1t1', 3000, 3400]
  ],
  [
    { id: 'p1s1', startMs: 100, endMs: 700 },
    { id: 'p1s2', startMs: 1200, endMs: 1500 },
    { id: 'p2s1', startMs: 3000, endMs: 3400 }
  ],
  [
    { id: 'p1', startMs: 100, endMs: 1500 },
    { id: 'p2', startMs: 3000, endMs: 3400 }
  ]
)

describe('sincronización del audio', () => {
  it('ordena los tiempos y encuentra la palabra que suena', () => {
    expect(index.ids).toEqual(['p1s1t1', 'p1s1t2', 'p1s2t1', 'p2s1t1'])
    expect(activeWord(index, 0)).toBeNull()
    expect(activeWord(index, 100)).toBe('p1s1t1')
    expect(activeWord(index, 390)).toBe('p1s1t1')
    expect(activeWord(index, 400)).toBe('p1s1t2')
    expect(activeWord(index, 3399)).toBe('p2s1t1')
  })

  it('mantiene la palabra un instante en las pausas cortas y se apaga en las largas', () => {
    expect(activeWord(index, 700 + LINGER_MS - 1)).toBe('p1s1t2')
    expect(activeWord(index, 2000)).toBeNull()
    expect(activeWord(index, 99_999)).toBeNull()
  })

  it('sabe qué oración y qué párrafo suenan', () => {
    expect(activeSentence(index, 450)).toBe('p1s1')
    expect(activeSentence(index, 1300)).toBe('p1s2')
    expect(activeParagraph(index, 1300)).toBe('p1')
    expect(activeParagraph(index, 2500)).toBeNull()
    expect(activeParagraph(index, 3100)).toBe('p2')
  })

  it('salta a una palabra o a un párrafo', () => {
    expect(seekToWord(index, 'p1s2t1')).toBe(1200)
    expect(seekToWord(index, 'p1s1t9')).toBeNull()
    expect(rangeOf(index.paragraphs, 'p2')).toEqual({ id: 'p2', startMs: 3000, endMs: 3400 })
  })

  it('párrafo anterior y siguiente como en cualquier reproductor', () => {
    expect(neighbourParagraph(index, 1300, 1)).toBe(3000)
    expect(neighbourParagraph(index, 3100, 1)).toBeNull()
    expect(neighbourParagraph(index, 3100, -1)).toBe(100)
    expect(neighbourParagraph(index, 3300 + 1000, -1)).toBe(3000)
    expect(neighbourParagraph(index, 0, -1)).toBe(0)
  })

  it('formatea el reloj', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(69_189)).toBe('1:09')
  })
})
