import { z } from 'zod'
import { levelSchema } from '../../shared/schemas'

// progress/** del backend (docs/architecture/api-design.md, ADR-0011). Cada cifra dice si es medida o estimada
export const metricSchema = z.object({ value: z.number().int(), kind: z.enum(['MEASURED', 'ESTIMATED']) })
export type Metric = z.infer<typeof metricSchema>

export const daySchema = z.object({ date: z.string(), minutes: z.number().int().nonnegative(), active: z.boolean(), goalMet: z.boolean() })
export type Day = z.infer<typeof daySchema>

export const streakSchema = z.object({
  current: z.number().int().nonnegative(),
  best: z.number().int().nonnegative(),
  weeksMet: z.number().int().nonnegative(),
  target: z.number().int().min(1).max(7),
  activeThisWeek: z.number().int().nonnegative(),
  metThisWeek: z.boolean()
})
export type Streak = z.infer<typeof streakSchema>

export const ACHIEVEMENT_KINDS = [
  'READINGS_COMPLETED',
  'MINUTES',
  'WORDS_SAVED',
  'WORDS_REVIEWED',
  'ASSESSMENTS',
  'ACTIVE_DAYS',
  'WEEKS_MET',
  'BEST_STREAK'
] as const
export const achievementSchema = z.object({
  code: z.string(),
  kind: z.enum(ACHIEVEMENT_KINDS),
  threshold: z.number().int().positive(),
  value: z.number().int().nonnegative(),
  earnedAt: z.string().nullable()
})
export type Achievement = z.infer<typeof achievementSchema>

// la clave es el tipo de pregunta (MULTIPLE_CHOICE…) o el nivel (A2…), según el reparto
const scoreSchema = z.object({ key: z.string(), answered: z.number().int().nonnegative(), score: z.number().int().min(0).max(100) })
export type Score = z.infer<typeof scoreSchema>

export const dashboardSchema = z.object({
  language: z.string(),
  timeZone: z.string(),
  today: z.string(),
  goal: z.object({ dailyMinutes: z.number().int(), todayMinutes: metricSchema, met: z.boolean() }),
  streak: streakSchema,
  days: z.array(daySchema),
  reading: z.object({
    started: metricSchema,
    completed: metricSchema,
    minutes: metricSchema,
    wordsRead: metricSchema,
    minutesThisWeek: metricSchema,
    completedThisWeek: metricSchema
  }),
  vocabulary: z.object({
    encountered: metricSchema,
    saved: metricSchema,
    learning: metricSchema,
    mastered: metricSchema,
    due: metricSchema,
    growth: z.array(z.object({ weekStart: z.string(), value: z.number().int().nonnegative() }))
  }),
  comprehension: z.object({ answered: metricSchema, average: metricSchema.nullable(), byType: z.array(scoreSchema), byLevel: z.array(scoreSchema) }),
  level: z.object({ level: levelSchema, kind: z.enum(['MEASURED', 'ESTIMATED']), signal: z.enum(['UP', 'STEADY', 'DOWN']), answeredAtLevel: z.number().int() }),
  recentAchievements: z.array(achievementSchema)
})
export type Dashboard = z.infer<typeof dashboardSchema>

export const weeklySchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
  current: z.boolean(),
  days: z.array(daySchema),
  minutes: metricSchema,
  readingsCompleted: metricSchema,
  wordsRead: metricSchema,
  wordsSaved: metricSchema,
  wordsReviewed: metricSchema,
  assessments: metricSchema,
  activeDays: z.number().int().nonnegative(),
  target: z.number().int(),
  met: z.boolean(),
  streak: streakSchema,
  achievements: z.array(achievementSchema)
})
export type Weekly = z.infer<typeof weeklySchema>
