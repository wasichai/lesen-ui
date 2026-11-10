import { z } from 'zod'

// los contratos de /api/lesen/** que comparten varios módulos (docs/architecture/api-design.md del backend). Cada módulo
// declara además los suyos en su contract.ts

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export const levelSchema = z.enum(LEVELS)
export type Level = z.infer<typeof levelSchema>

// el catálogo cerrado de maquetas de un libro ilustrado (ADR-0014 del backend): ancho que admite (1 página, 2 páginas),
// si lleva ilustración y si va sin texto. Lo comparten el lector y el estudio
export const PAGE_LAYOUTS = {
  IMAGE_TOP: { spans: [1], illustrated: true, textless: false },
  IMAGE_BOTTOM: { spans: [1], illustrated: true, textless: false },
  TEXT_OVER_IMAGE: { spans: [1, 2], illustrated: true, textless: false },
  VIGNETTE: { spans: [1], illustrated: true, textless: false },
  TEXT_ONLY: { spans: [1], illustrated: false, textless: false },
  IMAGE_ONLY: { spans: [1, 2], illustrated: true, textless: true },
  SPREAD_IMAGE_LEFT: { spans: [2], illustrated: true, textless: false },
  SPREAD_IMAGE_RIGHT: { spans: [2], illustrated: true, textless: false },
  PANORAMA: { spans: [2], illustrated: true, textless: false }
} as const satisfies Record<string, { spans: readonly number[]; illustrated: boolean; textless: boolean }>
export type PageLayout = keyof typeof PAGE_LAYOUTS
export const pageLayoutSchema = z.enum(Object.keys(PAGE_LAYOUTS) as [PageLayout, ...PageLayout[]])
export const readingFormatSchema = z.enum(['TEXT', 'PICTURE_BOOK'])
export type ReadingFormat = z.infer<typeof readingFormatSchema>

export const GOALS = ['TRAVEL', 'WORK', 'STUDY', 'CULTURE', 'FAMILY', 'FUN', 'EXAM'] as const
export const DIFFICULTIES = ['COMFORTABLE', 'BALANCED', 'CHALLENGING'] as const

const labels = z.record(z.string(), z.string())

export const languageCatalogSchema = z.object({
  languages: z.array(z.object({ code: z.string(), nativeName: z.string(), interfaceLanguage: z.boolean(), study: z.boolean() })),
  levels: z.array(z.object({ code: levelSchema, position: z.number().int(), wordsPerMinute: z.number().int().positive() }))
})
export type LanguageCatalog = z.infer<typeof languageCatalogSchema>

export interface TopicNode {
  slug: string
  labels: Record<string, string>
  children: TopicNode[]
}
export const topicNodeSchema: z.ZodType<TopicNode> = z.lazy(() => z.object({ slug: z.string(), labels, children: z.array(topicNodeSchema) }))
export const topicTreeSchema = z.array(topicNodeSchema)

export const profileSchema = z.object({
  interfaceLanguage: z.string(),
  targetLanguage: z.string(),
  level: levelSchema,
  levelEstimated: z.boolean(),
  goals: z.array(z.enum(GOALS)),
  topics: z.array(z.string()),
  dailyMinutes: z.number().int(),
  difficulty: z.enum(DIFFICULTIES)
})
export type Profile = z.infer<typeof profileSchema>

export const readingCardSchema = z.object({
  slug: z.string(),
  language: z.string(),
  level: levelSchema,
  topics: z.array(z.string()),
  featured: z.boolean(),
  version: z.number().int().positive(),
  title: z.string(),
  subtitle: z.string().nullable(),
  summary: z.string(),
  cover: z.string().nullable(),
  accent: z.string().nullable(),
  wordCount: z.number().int().nonnegative(),
  minutes: z.number().int().positive(),
  publishedAt: z.string(),
  bookmarked: z.boolean(),
  progress: z.object({ percent: z.number().int().min(0).max(100), version: z.number().int(), completed: z.boolean(), updatedAt: z.string() }).nullable(),
  readers: z.number().int().nonnegative(),
  // texto o libro ilustrado (ADR-0014 del backend); un backend anterior no lo manda y es un texto
  format: readingFormatSchema.default('TEXT')
})
export type ReadingCard = z.infer<typeof readingCardSchema>

export const readingDetailSchema = z.object({
  reading: readingCardSchema,
  paragraphs: z.number().int().nonnegative(),
  related: z.array(readingCardSchema),
  collections: z.array(z.string())
})
export type ReadingDetail = z.infer<typeof readingDetailSchema>

// los encargos de generación (ADR-0015 del backend): una lectura o un libro que se escribe y se ilustra en segundo plano.
// Los usan el estudio y las lecturas a medida
export const COMMISSION_STATUSES = ['QUEUED', 'WRITING', 'ILLUSTRATING', 'READY', 'FAILED'] as const
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number]
export const TEXT_KINDS = ['STORY', 'ARTICLE', 'DIALOGUE', 'LETTER'] as const
export const MINUTES = [2, 5, 8] as const
export const commissionRequestSchema = z.object({
  language: z.string(),
  level: z.string(),
  minutes: z.number().int(),
  kind: z.enum(TEXT_KINDS),
  format: readingFormatSchema,
  topics: z.array(z.string()),
  prompt: z.string().nullable()
})
export type CommissionRequest = z.infer<typeof commissionRequestSchema>
export const commissionSchema = z.object({
  id: z.string(),
  target: z.enum(['STUDIO', 'PRIVATE']),
  status: z.enum(COMMISSION_STATUSES),
  request: commissionRequestSchema,
  draftId: z.string().nullable(),
  readingSlug: z.string().nullable(),
  reason: z.string().nullable(),
  findings: z.array(z.object({ code: z.string(), ref: z.string().nullable().optional(), detail: z.string().nullable().optional() })),
  directedBy: z.string().nullable(),
  illustrations: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})
export type Commission = z.infer<typeof commissionSchema>
