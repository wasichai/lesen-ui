import { z } from 'zod'
import { entrySchema, entrySummarySchema } from '../../shared/entry'

export const tokenSchema = z.object({ id: z.string(), text: z.string(), kind: z.enum(['WORD', 'PUNCT']), space: z.boolean(), entry: z.string().nullable() })
export const sentenceSchema = z.object({ id: z.string(), tokens: z.array(tokenSchema) })
export const paragraphSchema = z.object({ id: z.string(), sentences: z.array(sentenceSchema) })
export const contentSchema = z.object({
  slug: z.string(),
  version: z.number().int().positive(),
  language: z.string(),
  current: z.boolean(),
  paragraphs: z.array(paragraphSchema)
})
export type ReadingContent = z.infer<typeof contentSchema>
export type Paragraph = z.infer<typeof paragraphSchema>
export type Sentence = z.infer<typeof sentenceSchema>
export type Token = z.infer<typeof tokenSchema>

export const translationsSchema = z.array(z.object({ unit: z.enum(['SENTENCE', 'PARAGRAPH']), ref: z.string(), language: z.string(), text: z.string() }))

export const progressSchema = z.object({
  version: z.number().int().positive(),
  position: z.string().nullable(),
  percent: z.number().int().min(0).max(100),
  secondsRead: z.number().int().nonnegative(),
  completed: z.boolean(),
  startedAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable()
})
export type Progress = z.infer<typeof progressSchema>

export type { Entry } from '../../shared/entry'

export const lookupSchema = z.object({
  token: z.string(),
  tokenRef: z.string(),
  sentenceRef: z.string(),
  sentence: z.string(),
  translationLanguage: z.string(),
  entry: entrySchema.nullable(),
  inflected: z.boolean(),
  alternatives: z.array(entrySummarySchema)
})
export type Lookup = z.infer<typeof lookupSchema>

export const noteSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  sentenceRef: z.string(),
  quote: z.string(),
  note: z.string().nullable(),
  createdAt: z.string()
})
export type Note = z.infer<typeof noteSchema>

export const savedKeysSchema = z.array(z.string())

const rangeSchema = z.object({ id: z.string(), startMs: z.number().int().nonnegative(), endMs: z.number().int().nonnegative() })
export const audioSchema = z.object({
  assets: z.array(
    z.object({
      id: z.string(),
      voice: z.object({ id: z.string(), provider: z.string(), language: z.string(), name: z.string(), license: z.string() }),
      url: z.string(),
      format: z.string(),
      durationMs: z.number().int().positive(),
      origin: z.enum(['GENERATED', 'UPLOADED']),
      timings: z.array(z.tuple([z.string(), z.number().int().nonnegative(), z.number().int().nonnegative()])),
      sentences: z.array(rangeSchema),
      paragraphs: z.array(rangeSchema)
    })
  )
})
export type ReadingAudio = z.infer<typeof audioSchema>
export type AudioAsset = ReadingAudio['assets'][number]
