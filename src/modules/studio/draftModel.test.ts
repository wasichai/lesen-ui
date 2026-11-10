import { describe, expect, it } from 'vitest'
import type { Document, Question } from './contract'
import {
  addImage,
  addParagraph,
  imagesAt,
  moveImage,
  removeImage,
  updateImage,
  addSentence,
  entryKey,
  groupIssues,
  isDirty,
  localSentences,
  issueTab,
  move,
  moveParagraph,
  newQuestion,
  nextItemId,
  nextQuestionId,
  normalizeQuestion,
  removeParagraph,
  removeSentence,
  sentenceId,
  slugify,
  splitList,
  translateInto,
  updateSentence
} from './draftModel'

const doc = (texts: string[][]): Document => ({
  slug: 'x',
  language: 'de',
  level: 'A1',
  topics: [],
  featured: false,
  title: 'T',
  summary: 'S',
  paragraphs: texts.map((sentences) => ({ sentences: sentences.map((text) => ({ text, translations: {}, senses: {} })), translations: {} })),
  format: 'TEXT',
  layout: null,
  pages: [],
  images: []
})
const texts = (d: Document) => d.paragraphs.map((p) => p.sentences.map((s) => s.text))

describe('el documento', () => {
  it('añade, cambia, mueve y quita oraciones y párrafos', () => {
    let d = doc([['Eins.', 'Zwei.'], ['Drei.']])
    d = updateSentence(d, 0, 1, { text: 'Zwei!', translations: { es: '¡Dos!' } })
    expect(d.paragraphs[0]!.sentences[1]).toEqual({ text: 'Zwei!', translations: { es: '¡Dos!' }, senses: {} })
    d = addSentence(d, 0, 0)
    expect(texts(d)).toEqual([['Eins.', '', 'Zwei!'], ['Drei.']])
    d = moveParagraph(d, 1, -1)
    expect(texts(d)).toEqual([['Drei.'], ['Eins.', '', 'Zwei!']])
    d = removeSentence(d, 0, 0)
    expect(texts(d)).toEqual([['Eins.', '', 'Zwei!']])
    d = addParagraph(d, 0)
    expect(texts(d)).toEqual([['Eins.', '', 'Zwei!'], ['']])
    expect(texts(removeParagraph(removeParagraph(d, 1), 0))).toEqual([['']])
  })

  it('los ids son los que tendrá la versión publicada', () => {
    expect(sentenceId(0, 0)).toBe('p1s1')
    expect(sentenceId(2, 4)).toBe('p3s5')
  })

  it('mover fuera de la lista no cambia nada', () => {
    expect(move([1, 2, 3], 0, -1)).toEqual([1, 2, 3])
    expect(move([1, 2, 3], 0, 1)).toEqual([2, 1, 3])
  })

  it('el slug sale del título sin acentos ni signos', () => {
    expect(slugify('Der alte Leuchtturm')).toBe('der-alte-leuchtturm')
    expect(slugify('  Ein Spaziergang in Köln!  ')).toBe('ein-spaziergang-in-koln')
    expect(slugify('Straße & Meer')).toBe('strasse-meer')
    expect(slugify('¿?')).toBe('')
  })

  it('las oraciones para citar salen de lo que se edita, con las palabras de lo guardado si no cambió', () => {
    const saved = [{ id: 'p1s1', text: 'Eins.', words: [{ id: 'p1s1t1', text: 'Eins' }] }]
    const local = localSentences(doc([['Eins.', 'Neu.']]), saved)
    expect(local).toEqual([
      { id: 'p1s1', text: 'Eins.', words: [{ id: 'p1s1t1', text: 'Eins' }] },
      { id: 'p1s2', text: 'Neu.', words: [] }
    ])
    expect(localSentences(doc([['Anders.']]), saved)[0]!.words).toEqual([])
  })

  it('se traduce a los idiomas de interfaz menos el de la lectura', () => {
    expect(translateInto(['es', 'en'], 'de')).toEqual(['es', 'en'])
    expect(translateInto(['es', 'en'], 'en')).toEqual(['es'])
  })

  it('sabe si hay cambios sin guardar', () => {
    const d = doc([['Eins.']])
    expect(isDirty({ document: d, questions: [] }, { document: d, questions: [] })).toBe(false)
    expect(isDirty({ document: d, questions: [] }, { document: updateSentence(d, 0, 0, { text: 'Zwei.' }), questions: [] })).toBe(true)
  })
})

describe('las preguntas', () => {
  const sentence = { id: 'p2s1', text: 'Das Haus ist rot.', words: [{ id: 'p2s1t1', text: 'Das' }] }

  it('nacen con la forma de su tipo y citan la oración elegida', () => {
    const choice = newQuestion('VOCABULARY_IN_CONTEXT', [], sentence)
    expect(choice).toMatchObject({ id: 'q1', refs: ['p2s1'], spec: { token: 'p2s1t1', correct: [] } })
    expect((choice.spec.options as unknown[]).length).toBe(2)
    expect(newQuestion('TRUE_FALSE', [choice]).spec).toEqual({ correct: true })
    expect(newQuestion('COMPLETION', [], sentence).spec).toEqual({ sentence: 'p2s1', blanks: [], bank: [] })
    expect(Object.keys(newQuestion('MATCHING', []).spec)).toEqual(['left', 'right', 'pairs'])
    expect(newQuestion('SHORT_ANSWER', []).spec).toEqual({ model: {}, rubric: {} })
  })

  it('los ids no se repiten', () => {
    const qs = [{ id: 'q2' }, { id: 'q1' }] as Question[]
    expect(nextQuestionId(qs)).toBe('q3')
    expect(nextQuestionId([{ id: 'q3' }] as Question[])).toBe('q2')
    expect(
      nextItemId([
        { id: 'a', text: '' },
        { id: 'c', text: '' }
      ])
    ).toBe('b')
    expect(nextItemId([{ id: '1', text: '' }], 'number')).toBe('2')
  })

  it('el orden correcto es el de los elementos en el editor y el banco no guarda huecos', () => {
    const ordering = newQuestion('ORDERING', [])
    const swapped = { ...ordering, spec: { ...ordering.spec, items: [...(ordering.spec.items as unknown[])].reverse() } }
    expect(normalizeQuestion(swapped).spec.order).toEqual(['b', 'a'])
    const completion = { ...newQuestion('COMPLETION', []), spec: { sentence: 'p1s1', blanks: ['p1s1t1'], bank: [' Haus ', '', 'Meer'] } }
    expect(normalizeQuestion(completion).spec.bank).toEqual(['Haus', 'Meer'])
  })
})

describe('la comprobación', () => {
  it('cada hallazgo lleva a la pestaña donde se arregla', () => {
    expect(issueTab({ code: 'FIELD', ref: 'summary', detail: null })).toBe('details')
    expect(issueTab({ code: 'FIELD', ref: 'paragraphs[0].sentences[1]', detail: null })).toBe('text')
    expect(issueTab({ code: 'TRANSLATION_MISSING', ref: 'p1s1', detail: 'en' })).toBe('text')
    expect(issueTab({ code: 'QUESTION', ref: 'q1', detail: 'x' })).toBe('questions')
    expect(issueTab({ code: 'AUDIO_UNALIGNED', ref: null, detail: '3' })).toBe('audio')
    expect(issueTab({ code: 'UNRESOLVED', ref: 'Garten', detail: null })).toBe('review')
  })

  it('agrupa por código en el orden de llegada', () => {
    const groups = groupIssues([
      { code: 'UNRESOLVED', ref: 'a', detail: null },
      { code: 'NO_AUDIO', ref: null, detail: null },
      { code: 'UNRESOLVED', ref: 'b', detail: null }
    ])
    expect(groups.map(([code, list]) => [code, list.length])).toEqual([
      ['UNRESOLVED', 2],
      ['NO_AUDIO', 1]
    ])
  })

  it('las entradas del diccionario y sus formas', () => {
    expect(entryKey('de', ' Garten ')).toBe('de:garten')
    expect(splitList('Gärten, Gartens, , Gärten')).toEqual(['Gärten', 'Gartens'])
  })
})

describe('las imágenes entre párrafos', () => {
  it('se añaden en un hueco, se mueven sin salirse y siguen a su párrafo', () => {
    let d = doc([['Eins.'], ['Zwei.'], ['Drei.']])
    d = addImage(d, 1)
    d = updateImage(d, 0, { file: 'bild.png', width: 4, height: 3, alt: 'Ein Bild' })
    expect(imagesAt(d, 1).map((x) => x.image.alt)).toEqual(['Ein Bild'])
    expect(moveImage(d, 0, -1).images[0]!.after).toBe(0)
    expect(moveImage(moveImage(moveImage(d, 0, 1), 0, 1), 0, 1).images[0]!.after).toBe(3)
    // un párrafo nuevo antes de la imagen la empuja; quitar uno anterior la trae
    expect(addParagraph(d, 0).images[0]!.after).toBe(2)
    expect(addParagraph(d, 1).images[0]!.after).toBe(1)
    expect(removeParagraph(d, 0).images[0]!.after).toBe(0)
    expect(removeImage(d, 0).images).toEqual([])
    expect(issueTab({ code: 'IMAGE_ALT_MISSING', ref: 'images[0]', detail: null })).toBe('text')
  })
})
