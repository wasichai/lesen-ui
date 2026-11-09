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
  savedAt: z.string()
})
export type VocabularyItem = z.infer<typeof vocabularyItemSchema>
export const vocabularyPageSchema = pageOf(vocabularyItemSchema)

// la oración con la palabra marcada: antes, la palabra y después. Si no aparece tal cual, la oración entera sin marca
export function splitContext(context: string, surface: string): [string, string, string] | null {
  const at = context.indexOf(surface)
  if (at < 0) return null
  return [context.slice(0, at), surface, context.slice(at + surface.length)]
}
