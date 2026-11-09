import { z } from 'zod'
import { levelSchema } from '../../shared/schemas'

// studio/** del backend (docs/architecture/api-design.md §Estudio editorial, ADR-0012)
export const DRAFT_STATUSES = ['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'DISCARDED'] as const
export type DraftStatus = (typeof DRAFT_STATUSES)[number]

export const QUESTION_TYPES = [
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'COMPLETION',
  'MATCHING',
  'ORDERING',
  'SHORT_ANSWER',
  'VOCABULARY_IN_CONTEXT',
  'MAIN_IDEA',
  'INFERENCE',
  'DETAIL'
] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

const texts = z.record(z.string(), z.string())

export const sentenceSchema = z.object({ text: z.string(), translations: texts.default({}), senses: texts.default({}) })
export const paragraphSchema = z.object({ sentences: z.array(sentenceSchema), translations: texts.default({}) })
export const documentSchema = z.object({
  slug: z.string(),
  language: z.string(),
  level: z.string(),
  topics: z.array(z.string()),
  featured: z.boolean().default(false),
  cover: z.string().nullable().optional(),
  accent: z.string().nullable().optional(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  summary: z.string(),
  paragraphs: z.array(paragraphSchema)
})
export type Document = z.infer<typeof documentSchema>
export type DraftSentence = z.infer<typeof sentenceSchema>
export type DraftParagraph = z.infer<typeof paragraphSchema>

// el texto de una opción: una cadena en el idioma de la lectura o {es, en} en el de quien responde
export const itemTextSchema = z.union([z.string(), texts])
export type ItemText = z.infer<typeof itemTextSchema>
export const itemSchema = z.object({ id: z.string(), text: itemTextSchema })
export type Item = z.infer<typeof itemSchema>

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(QUESTION_TYPES),
  difficulty: z.number().int(),
  prompt: texts,
  explanation: texts,
  refs: z.array(z.string()),
  spec: z.record(z.string(), z.unknown())
})
export type Question = z.infer<typeof questionSchema>

export const eventSchema = z.object({
  draftId: z.string(),
  slug: z.string(),
  action: z.enum(['CREATED', 'SAVED', 'AUDIO_ATTACHED', 'AUDIO_REMOVED', 'SUBMITTED', 'RETURNED', 'PUBLISHED', 'DISCARDED']),
  actor: z.string(),
  note: z.string().nullable(),
  version: z.number().int().nullable(),
  at: z.string()
})
export type StudioEvent = z.infer<typeof eventSchema>

export const sentenceRefSchema = z.object({
  id: z.string(),
  text: z.string(),
  words: z.array(z.object({ id: z.string(), text: z.string() }))
})
export type SentenceRef = z.infer<typeof sentenceRefSchema>

export const draftSchema = z.object({
  id: z.string(),
  slug: z.string(),
  language: z.string(),
  status: z.enum(DRAFT_STATUSES),
  baseVersion: z.number().int().nullable(),
  publishedVersion: z.number().int().nullable(),
  revision: z.number().int(),
  document: documentSchema,
  questions: z.array(questionSchema),
  audio: z
    .object({
      file: z.string(),
      url: z.string(),
      format: z.string(),
      durationMs: z.number().int(),
      voice: z.string(),
      license: z.string(),
      timedWords: z.number().int()
    })
    .nullable(),
  sentences: z.array(sentenceRefSchema),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  events: z.array(eventSchema)
})
export type Draft = z.infer<typeof draftSchema>

export const draftSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  language: z.string(),
  level: z.string(),
  title: z.string(),
  status: z.enum(DRAFT_STATUSES),
  baseVersion: z.number().int().nullable(),
  publishedVersion: z.number().int().nullable(),
  questions: z.number().int(),
  audio: z.boolean(),
  updatedBy: z.string(),
  updatedAt: z.string()
})
export type DraftSummary = z.infer<typeof draftSummarySchema>

export const issueSchema = z.object({ code: z.string(), ref: z.string().nullable(), detail: z.string().nullable() })
export type Issue = z.infer<typeof issueSchema>

export const checkSchema = z.object({
  ready: z.boolean(),
  errors: z.array(issueSchema),
  warnings: z.array(issueSchema),
  words: z.number().int(),
  sentences: z.number().int(),
  unresolved: z.number().int(),
  missingTranslations: z.number().int(),
  questions: z.number().int(),
  alignedWords: z.number().int().nullable()
})
export type Check = z.infer<typeof checkSchema>

export const publishedReadingSchema = z.object({
  slug: z.string(),
  language: z.string(),
  level: levelSchema,
  title: z.string(),
  currentVersion: z.number().int(),
  versions: z.number().int(),
  updatedAt: z.string(),
  openDraft: z.string().nullable()
})
export type PublishedReading = z.infer<typeof publishedReadingSchema>

export const historySchema = z.object({
  slug: z.string(),
  versions: z.array(
    z.object({
      number: z.number().int(),
      status: z.string(),
      title: z.string(),
      wordCount: z.number().int(),
      publishedAt: z.string(),
      audio: z.boolean(),
      questions: z.number().int()
    })
  ),
  events: z.array(eventSchema)
})
export type History = z.infer<typeof historySchema>

export const mediaSchema = z.object({ file: z.string(), kind: z.string(), contentType: z.string(), sizeBytes: z.number(), sha256: z.string() })

export const POS = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'article',
  'preposition',
  'conjunction',
  'numeral',
  'interjection',
  'particle',
  'determiner',
  'proper-noun',
  'phrase',
  'contraction'
] as const
