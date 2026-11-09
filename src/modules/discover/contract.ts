import { z } from 'zod'
import { readingCardSchema } from '../../shared/schemas'

export const discoverSchema = z.object({
  continueReading: z.array(readingCardSchema),
  featured: z.array(readingCardSchema),
  recommended: z.array(z.object({ reading: readingCardSchema, reasons: z.array(z.enum(['LEVEL', 'TOPIC', 'NEW'])) })),
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
