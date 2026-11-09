import type { AnswerInput, Question, Result, Summary } from './contract'

// lo que la persona va respondiendo en una pregunta, antes de enviar
export type Draft = Omit<AnswerInput, 'questionId'>

export function emptyDraft(question: Question): Draft {
  switch (question.type) {
    case 'TRUE_FALSE':
      return {}
    case 'COMPLETION':
      return { blanks: {} }
    case 'MATCHING':
      return { pairs: {} }
    case 'ORDERING':
      return { order: (question.items ?? []).map((item) => item.id) }
    case 'SHORT_ANSWER':
      return { text: '' }
    default:
      return { options: [] }
  }
}

export function blanksOf(question: Question): string[] {
  return (question.completion?.parts ?? []).flatMap((part) => (part.blank ? [part.blank] : []))
}

// respondida: lo que hace falta para enviarla tal cual (ordenar siempre lo está: el orden de partida es una respuesta)
export function isAnswered(question: Question, draft: Draft | undefined): boolean {
  if (!draft) return false
  switch (question.type) {
    case 'TRUE_FALSE':
      return draft.value !== undefined && draft.value !== null
    case 'COMPLETION':
      return blanksOf(question).every((blank) => (draft.blanks?.[blank] ?? '').trim() !== '')
    case 'MATCHING':
      return (question.left ?? []).every((item) => Boolean(draft.pairs?.[item.id]))
    case 'ORDERING':
      return true
    case 'SHORT_ANSWER':
      return (draft.text ?? '').trim() !== ''
    default:
      return (draft.options ?? []).length > 0
  }
}

// una opción: con una sola correcta la elegida sustituye a la anterior; con varias, se marca o se desmarca
export function toggleOption(question: Question, draft: Draft, id: string): Draft {
  const chosen = draft.options ?? []
  if (!question.multiple) return { ...draft, options: [id] }
  return { ...draft, options: chosen.includes(id) ? chosen.filter((o) => o !== id) : [...chosen, id] }
}

// una palabra del banco va al primer hueco vacío; si están todos llenos, no cambia nada
export function fillFromBank(question: Question, draft: Draft, word: string): Draft {
  const empty = blanksOf(question).find((blank) => !(draft.blanks?.[blank] ?? '').trim())
  if (!empty) return draft
  return { ...draft, blanks: { ...draft.blanks, [empty]: word } }
}

export function move(order: string[], index: number, delta: -1 | 1): string[] {
  const target = index + delta
  if (target < 0 || target >= order.length) return order
  const next = [...order]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  return next
}

// lo que se envía: solo lo respondido, cada pregunta con el campo de su tipo
export function toInputs(questions: Question[], drafts: Record<string, Draft>): AnswerInput[] {
  return questions.filter((q) => isAnswered(q, drafts[q.id])).map((q) => ({ questionId: q.id, ...drafts[q.id], text: drafts[q.id]?.text?.trim() }))
}

export type Group = 'strength' | 'improve' | 'waiting'

export function groupOf(result: Result): Group {
  if (result === 'CORRECT') return 'strength'
  if (result === 'PENDING' || result === 'UNGRADED') return 'waiting'
  return 'improve'
}

// puntos sobre lo ya corregido (un acierto vale 1, un parcial 0,5); lo que espera corrección no cuenta todavía
export function score(summary: Summary): { points: number; graded: number } {
  return { points: summary.correct + summary.partial / 2, graded: summary.correct + summary.partial + summary.incorrect }
}

// la respuesta como texto legible, para enseñarla junto a la solución
export function describe(question: Question, response: Draft): string[] {
  const label = (items: Question['options'], id: string) => items?.find((item) => item.id === id)?.text ?? id
  switch (question.type) {
    case 'TRUE_FALSE':
      return response.value === undefined || response.value === null ? [] : [String(response.value)]
    case 'COMPLETION':
      return blanksOf(question).map((blank) => response.blanks?.[blank] ?? '')
    case 'MATCHING':
      return (question.left ?? []).flatMap((item) => {
        const right = response.pairs?.[item.id]
        return right ? [`${item.text} → ${label(question.right, right)}`] : []
      })
    case 'ORDERING':
      return (response.order ?? []).map((id) => label(question.items, id))
    case 'SHORT_ANSWER':
      return response.text ? [response.text] : []
    default:
      return (response.options ?? []).map((id) => label(question.options, id))
  }
}
