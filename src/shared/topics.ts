import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTopics } from './api'
import type { TopicNode } from './schemas'

export function flattenTopics(tree: TopicNode[]): TopicNode[] {
  return tree.flatMap((node) => [node, ...flattenTopics(node.children)])
}

export function localizedLabel(labels: Record<string, string>, language: string): string {
  return labels[language] ?? labels.en ?? Object.values(labels)[0] ?? ''
}

// el nombre de un tema en el idioma de la interfaz; mientras carga el árbol, la última parte del slug
export function useTopicLabel() {
  const { i18n } = useTranslation()
  const topics = useTopics()
  const all = topics.data ? flattenTopics(topics.data) : []
  return useCallback(
    (slug: string) => {
      const node = all.find((topic) => topic.slug === slug)
      return node ? localizedLabel(node.labels, i18n.language) : (slug.split('/').pop() ?? slug)
    },
    [topics.data, i18n.language]
  )
}

// el color de un tema principal: uno de los cuatro tonos de la marca, siempre el mismo para el mismo tema
const TONES = ['sea', 'sage', 'ochre', 'plum'] as const
export function topicTone(slug: string): (typeof TONES)[number] {
  const root = slug.split('/')[0] ?? slug
  let hash = 0
  for (const char of root) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return TONES[hash % TONES.length]!
}

// las clases de Tailwind de cada tono, escritas enteras para que Tailwind las genere
export const TONE_CLASSES = {
  sea: { text: 'text-sea', bg: 'bg-sea' },
  sage: { text: 'text-sage', bg: 'bg-sage' },
  ochre: { text: 'text-ochre', bg: 'bg-ochre' },
  plum: { text: 'text-plum', bg: 'bg-plum' }
} as const
