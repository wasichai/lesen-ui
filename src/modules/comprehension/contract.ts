import { z } from 'zod'

// las preguntas de comprensión de una versión y los intentos (docs/architecture/api-design.md §Comprensión del backend)
export const questionTypes = [
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
export type QuestionType = (typeof questionTypes)[number]

const optionSchema = z.object({ id: z.string(), text: z.string(), lang: z.string() })
export type Option = z.infer<typeof optionSchema>

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(questionTypes),
  difficulty: z.number().int(),
  prompt: z.string(),
  refs: z.array(z.string()),
  multiple: z.boolean().nullable(),
  options: z.array(optionSchema).nullable(),
  word: z.object({ id: z.string(), text: z.string(), sentence: z.string() }).nullable(),
  completion: z
    .object({
      sentence: z.string(),
      parts: z.array(z.object({ text: z.string().nullable(), blank: z.string().nullable() })),
      bank: z.array(z.string())
    })
    .nullable(),
  left: z.array(optionSchema).nullable(),
  right: z.array(optionSchema).nullable(),
  items: z.array(optionSchema).nullable()
})
export type Question = z.infer<typeof questionSchema>

export const resultSchema = z.enum(['CORRECT', 'PARTIAL', 'INCORRECT', 'PENDING', 'UNGRADED'])
export type Result = z.infer<typeof resultSchema>

export const summarySchema = z.object({
  id: z.string(),
  submittedAt: z.string(),
  total: z.number().int(),
  correct: z.number().int(),
  partial: z.number().int(),
  incorrect: z.number().int(),
  pending: z.number().int(),
  ungraded: z.number().int()
})
export type Summary = z.infer<typeof summarySchema>

export const assessmentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  version: z.number().int(),
  language: z.string(),
  questions: z.array(questionSchema),
  lastAttempt: summarySchema.nullable()
})
export type Assessment = z.infer<typeof assessmentSchema>

const responseSchema = z.object({
  questionId: z.string(),
  options: z.array(z.string()).nullish(),
  value: z.boolean().nullish(),
  blanks: z.record(z.string(), z.string()).nullish(),
  pairs: z.record(z.string(), z.string()).nullish(),
  order: z.array(z.string()).nullish(),
  text: z.string().nullish()
})
export type AnswerInput = z.infer<typeof responseSchema>

export const answerSchema = z.object({
  questionId: z.string(),
  type: z.enum(questionTypes),
  result: resultSchema,
  evaluator: z.enum(['RULE', 'AI', 'SELF']).nullable(),
  response: responseSchema,
  solution: responseSchema.omit({ questionId: true }),
  explanation: z.string(),
  refs: z.array(z.string()),
  justification: z.string().nullable(),
  citations: z.array(z.string())
})
export type Answer = z.infer<typeof answerSchema>

export const attemptSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  slug: z.string(),
  version: z.number().int(),
  submittedAt: z.string(),
  summary: summarySchema,
  questions: z.array(questionSchema),
  answers: z.array(answerSchema)
})
export type Attempt = z.infer<typeof attemptSchema>

// lo justo de la ficha de la lectura: el título y la versión vigente
export const readingRefSchema = z.object({ reading: z.object({ title: z.string(), version: z.number().int(), language: z.string() }) })

// las oraciones de la versión, para citar las que sostienen cada respuesta: el texto se rehace con sus tokens
export const sentencesSchema = z
  .object({
    language: z.string(),
    paragraphs: z.array(z.object({ sentences: z.array(z.object({ id: z.string(), tokens: z.array(z.object({ text: z.string(), space: z.boolean() })) })) }))
  })
  .transform((content) => ({
    language: content.language,
    sentences: new Map(
      content.paragraphs.flatMap((p) =>
        p.sentences.map(
          (s) =>
            [
              s.id,
              s.tokens
                .map((t) => t.text + (t.space ? ' ' : ''))
                .join('')
                .trim()
            ] as const
        )
      )
    )
  }))
