import { z } from 'zod'
import { readingCardSchema } from '../../shared/schemas'

export const discoverSchema = z.object({
  continueReading: z.array(readingCardSchema),
  featured: z.array(readingCardSchema),
  recommended: z.array(z.object({ reading: readingCardSchema, reasons: z.array(z.enum(['LEVEL', 'COMPREHENSION', 'TOPIC', 'HISTORY', 'NEW', 'TRENDING'])) })),
  // lo que la organización terminó en los últimos 7 días: cuántas personas, nunca quiénes
  thisWeek: z.array(z.object({ reading: readingCardSchema, readers: z.number().int().positive() })),
  fresh: z.array(readingCardSchema),
  collections: z.array(
    z.object({
      slug: z.string(),
      labels: z.record(z.string(), z.string()),
      descriptions: z.record(z.string(), z.string()),
      readings: z.array(readingCardSchema)
    })
  ),
  topics: z.array(z.object({ slug: z.string(), readings: z.number().int().nonnegative() }))
})
export type Discover = z.infer<typeof discoverSchema>

// lo que el aviso semanal (si quien lee lo activó) cuenta de la semana en curso
export const weekGlanceSchema = z.object({
  minutes: z.object({ value: z.number().int() }),
  readingsCompleted: z.object({ value: z.number().int() }),
  activeDays: z.number().int(),
  target: z.number().int(),
  met: z.boolean()
})
