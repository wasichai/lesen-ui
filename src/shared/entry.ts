import { z } from 'zod'

// una entrada del diccionario en el idioma de quien lee (la comparten el lector y el diccionario)
const senseSchema = z.object({
  translations: z.array(z.string()),
  definition: z.string().nullable(),
  examples: z.array(z.object({ text: z.string(), translation: z.string().nullable() })),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  related: z.array(z.object({ key: z.string(), lemma: z.string() })),
  note: z.string().nullable()
})

export const entrySchema = z.object({
  key: z.string(),
  language: z.string(),
  lemma: z.string(),
  pos: z.string(),
  ipa: z.string().nullable(),
  grammar: z.record(z.string(), z.unknown()),
  forms: z.array(z.string()),
  senses: z.array(senseSchema),
  favorite: z.boolean(),
  saved: z.boolean(),
  readings: z.array(z.object({ slug: z.string(), title: z.string(), level: z.string(), occurrences: z.number().int() }))
})
export type Entry = z.infer<typeof entrySchema>

export const entrySummarySchema = z.object({
  key: z.string(),
  language: z.string(),
  lemma: z.string(),
  pos: z.string(),
  translations: z.array(z.string()),
  matchedBy: z.string()
})
export type EntrySummary = z.infer<typeof entrySummarySchema>
