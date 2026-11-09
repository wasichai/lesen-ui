import { describe as group, expect, it } from 'vitest'
import type { Question } from './contract'
import { describe, emptyDraft, fillFromBank, groupOf, isAnswered, move, score, toggleOption, toInputs } from './quizModel'

const base = { difficulty: 1, prompt: '?', refs: ['p1s1'], multiple: null, options: null, word: null, completion: null, left: null, right: null, items: null }
const opt = (id: string, text = id) => ({ id, text, lang: 'es' })
const single: Question = { ...base, id: 'q1', type: 'DETAIL', multiple: false, options: [opt('a', 'A'), opt('b', 'B')] }
const multiple: Question = { ...base, id: 'q2', type: 'MULTIPLE_CHOICE', multiple: true, options: [opt('a'), opt('b'), opt('c')] }
const completion: Question = {
  ...base,
  id: 'q3',
  type: 'COMPLETION',
  completion: {
    sentence: 'p1s1',
    parts: [
      { text: 'Mia ', blank: null },
      { text: null, blank: 't2' },
      { text: ' hundert ', blank: null },
      { text: null, blank: 't4' }
    ],
    bank: ['zählt', 'Stufen']
  }
}
const matching: Question = { ...base, id: 'q4', type: 'MATCHING', left: [opt('1', 'Hund'), opt('2', 'Katze')], right: [opt('x', 'perro'), opt('y', 'gato')] }
const ordering: Question = { ...base, id: 'q5', type: 'ORDERING', items: [opt('b', 'B'), opt('a', 'A'), opt('c', 'C')] }
const open: Question = { ...base, id: 'q6', type: 'SHORT_ANSWER' }
const tf: Question = { ...base, id: 'q7', type: 'TRUE_FALSE' }

group('quizModel', () => {
  it('starts every type empty except ordering, which keeps the presented order', () => {
    expect(isAnswered(single, emptyDraft(single))).toBe(false)
    expect(isAnswered(tf, emptyDraft(tf))).toBe(false)
    expect(isAnswered(open, emptyDraft(open))).toBe(false)
    expect(emptyDraft(ordering)).toEqual({ order: ['b', 'a', 'c'] })
    expect(isAnswered(ordering, emptyDraft(ordering))).toBe(true)
    expect(isAnswered(tf, { value: false })).toBe(true)
  })

  it('replaces the choice with one right answer and toggles with several', () => {
    expect(toggleOption(single, toggleOption(single, {}, 'a'), 'b').options).toEqual(['b'])
    const twice = toggleOption(multiple, toggleOption(multiple, {}, 'a'), 'c')
    expect(twice.options).toEqual(['a', 'c'])
    expect(toggleOption(multiple, twice, 'a').options).toEqual(['c'])
  })

  it('fills the first empty blank from the bank and needs every blank', () => {
    const one = fillFromBank(completion, { blanks: {} }, 'zählt')
    expect(one.blanks).toEqual({ t2: 'zählt' })
    expect(isAnswered(completion, one)).toBe(false)
    const two = fillFromBank(completion, one, 'Stufen')
    expect(isAnswered(completion, two)).toBe(true)
    expect(fillFromBank(completion, two, 'Wolken')).toBe(two)
  })

  it('needs a pair for each item on the left', () => {
    expect(isAnswered(matching, { pairs: { '1': 'x' } })).toBe(false)
    expect(isAnswered(matching, { pairs: { '1': 'x', '2': 'y' } })).toBe(true)
  })

  it('moves an item within bounds', () => {
    expect(move(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
    expect(move(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c'])
    expect(move(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c'])
  })

  it('sends only what was answered, with the trimmed text', () => {
    const inputs = toInputs([single, open, ordering, tf], { q1: { options: ['b'] }, q6: { text: '  Weil  ' }, q5: { order: ['a', 'b', 'c'] }, q7: {} })
    expect(inputs).toEqual([
      { questionId: 'q1', options: ['b'], text: undefined },
      { questionId: 'q6', text: 'Weil' },
      { questionId: 'q5', order: ['a', 'b', 'c'], text: undefined }
    ])
  })

  it('groups results and scores only what was graded', () => {
    expect(groupOf('CORRECT')).toBe('strength')
    expect(groupOf('PARTIAL')).toBe('improve')
    expect(groupOf('UNGRADED')).toBe('waiting')
    expect(score({ id: 'x', submittedAt: '', total: 7, correct: 4, partial: 1, incorrect: 1, pending: 1, ungraded: 0 })).toEqual({ points: 4.5, graded: 6 })
  })

  it('describes an answer with the texts the person saw', () => {
    expect(describe(single, { options: ['b'] })).toEqual(['B'])
    expect(describe(matching, { pairs: { '1': 'y' } })).toEqual(['Hund → gato'])
    expect(describe(ordering, { order: ['a', 'c', 'b'] })).toEqual(['A', 'C', 'B'])
    expect(describe(completion, { blanks: { t2: 'zählt' } })).toEqual(['zählt', ''])
    expect(describe(tf, { value: true })).toEqual(['true'])
  })
})
