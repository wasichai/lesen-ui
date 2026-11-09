import { z } from 'zod'
import { pageOf } from '../../shared/contract'

export const vocabularyItemSchema = z.object({
  id: z.string(),
  entryKey: z.string(),
  lemma: z.string(),
  pos: z.string(),
  language: z.string(),
  translations: z.array(z.string()),
  surface: z.string(),
  context: z.string().nullable(),
  tokenRef: z.string().nullable(),
  source: z.object({ slug: z.string(), title: z.string(), version: z.number().int() }).nullable(),
  status: z.enum(['SAVED', 'LEARNING', 'FAMILIAR', 'MASTERED']),
  note: z.string().nullable(),
  savedAt: z.string(),
  dueAt: z.string(),
  reviews: z.number().int()
})
export type VocabularyItem = z.infer<typeof vocabularyItemSchema>
export const vocabularyPageSchema = pageOf(vocabularyItemSchema)

// la oración con la palabra marcada: antes, la palabra y después. Si no aparece tal cual, la oración entera sin marca
export function splitContext(context: string, surface: string): [string, string, string] | null {
  const at = context.indexOf(surface)
  if (at < 0) return null
  return [context.slice(0, at), surface, context.slice(at + surface.length)]
}

export const ratings = ['AGAIN', 'HARD', 'GOOD', 'EASY'] as const
export type Rating = (typeof ratings)[number]
export const statuses = ['SAVED', 'LEARNING', 'FAMILIAR', 'MASTERED'] as const

export const reviewQueueSchema = z.object({
  cards: z.array(
    z.object({
      item: vocabularyItemSchema,
      state: z.enum(['LEARNING', 'REVIEW', 'RELEARNING']),
      preview: z.object({ AGAIN: z.string(), HARD: z.string(), GOOD: z.string(), EASY: z.string() })
    })
  ),
  due: z.number().int(),
  nextDueAt: z.string().nullable()
})
export type ReviewCard = z.infer<typeof reviewQueueSchema>['cards'][number]

export const reviewOutcomeSchema = z.object({
  item: vocabularyItemSchema,
  state: z.enum(['LEARNING', 'REVIEW', 'RELEARNING']),
  previousStatus: z.enum(statuses)
})

export const statsSchema = z.object({
  total: z.number().int(),
  byStatus: z.object({ SAVED: z.number().int(), LEARNING: z.number().int(), FAMILIAR: z.number().int(), MASTERED: z.number().int() }),
  dueNow: z.number().int(),
  reviewedToday: z.number().int(),
  encountered: z.number().int()
})

// los tiempos de la sentencia de origen en su audio, para escucharla en el repaso
export const sentenceAudioSchema = z.object({
  assets: z.array(z.object({ url: z.string(), sentences: z.array(z.object({ id: z.string(), startMs: z.number(), endMs: z.number() })) }))
})
