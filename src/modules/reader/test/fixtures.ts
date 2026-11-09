import type { Lookup, ReadingContent } from '../contract'

// ejemplos del contrato de /api/lesen (docs/architecture/api-design.md del backend), compartidos por las pruebas
const word = (id: string, text: string, entry: string | null, space = true) => ({ id, text, kind: 'WORD' as const, space, entry })
const punct = (id: string, text: string, space = true) => ({ id, text, kind: 'PUNCT' as const, space, entry: null })

export const content: ReadingContent = {
  slug: 'der-alte-leuchtturm',
  version: 1,
  language: 'de',
  current: true,
  paragraphs: [
    {
      id: 'p1',
      sentences: [
        {
          id: 'p1s1',
          tokens: [
            word('p1s1t1', 'Mia', 'de:mia'),
            word('p1s1t2', 'verbringt', 'de:verbringen'),
            word('p1s1t3', 'den', 'de:der'),
            word('p1s1t4', 'Sommer', 'de:sommer', false),
            punct('p1s1t5', '.')
          ]
        },
        { id: 'p1s2', tokens: [word('p1s2t1', 'Er', 'de:er'), word('p1s2t2', 'wohnt', 'de:wohnen', false), punct('p1s2t3', '.')] }
      ]
    },
    { id: 'p2', sentences: [{ id: 'p2s1', tokens: [word('p2s1t1', 'Ende', null, false), punct('p2s1t2', '.')] }] }
  ]
}

export const lookup: Lookup = {
  token: 'verbringt',
  tokenRef: 'p1s1t2',
  sentenceRef: 'p1s1',
  sentence: 'Mia verbringt den Sommer.',
  translationLanguage: 'es',
  inflected: true,
  alternatives: [],
  entry: {
    key: 'de:verbringen',
    language: 'de',
    lemma: 'verbringen',
    pos: 'verb',
    ipa: 'fɛɐ̯ˈbʁɪŋən',
    grammar: { past: 'verbrachte', participle: 'verbracht', auxiliary: 'haben' },
    forms: ['verbringt', 'verbrachte'],
    senses: [
      {
        translations: ['pasar (tiempo)'],
        definition: 'Pasar un periodo de tiempo en un lugar.',
        examples: [{ text: 'Wir verbringen den Urlaub am Meer.', translation: 'Pasamos las vacaciones junto al mar.' }],
        synonyms: [],
        antonyms: [],
        related: [],
        note: null
      }
    ],
    favorite: false,
    saved: false,
    readings: []
  }
}

export const unknownLookup: Lookup = { ...lookup, token: 'Ende', tokenRef: 'p2s1t1', sentenceRef: 'p2s1', sentence: 'Ende.', inflected: false, entry: null }
