import type { Achievement, Day, Streak } from './contract'

// la lógica del panel de progreso, sin React: escalas de las gráficas, mensajes de la racha (siempre en positivo),
// semanas y logros

// alturas de 0 a `height` proporcionales al mayor valor; un valor positivo nunca queda invisible
export function bars(values: number[], height: number): number[] {
  const max = Math.max(0, ...values)
  if (max === 0) return values.map(() => 0)
  return values.map((value) => (value <= 0 ? 0 : Math.max(2, Math.round((value / max) * height))))
}

export function goalPercent(minutes: number, goal: number): number {
  if (goal <= 0) return 100
  return Math.max(0, Math.min(100, Math.round((minutes / goal) * 100)))
}

// el mensaje de la racha: nunca «perdiste» ni «te faltó». La semana en curso solo puede sumar
export type StreakMessage = { key: 'metThisWeek'; count: number } | { key: 'ongoing'; count: number; left: number } | { key: 'start'; left: number }

export function streakMessage(streak: Streak): StreakMessage {
  const left = Math.max(0, streak.target - streak.activeThisWeek)
  if (streak.metThisWeek) return { key: 'metThisWeek', count: streak.current }
  if (streak.current > 0) return { key: 'ongoing', count: streak.current, left }
  return { key: 'start', left }
}

// fechas AAAA-MM-DD sin zona: se calculan en UTC para que el navegador no mueva el día
const parse = (date: string) => new Date(`${date}T00:00:00Z`)
const iso = (date: Date) => date.toISOString().slice(0, 10)

export function shiftWeek(weekStart: string, weeks: number): string {
  const date = parse(weekStart)
  date.setUTCDate(date.getUTCDate() + weeks * 7)
  return iso(date)
}

// el lunes de la semana de un día
export function mondayOf(date: string): string {
  const day = parse(date)
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7))
  return iso(day)
}

// los días de la semana en curso dentro de los últimos días del panel, de lunes a hoy
export function thisWeek(days: Day[], today: string): Day[] {
  const monday = mondayOf(today)
  return days.filter((day) => day.date >= monday && day.date <= today)
}

export function dayName(date: string, language: string, style: 'short' | 'narrow' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat(language, { weekday: style, timeZone: 'UTC' }).format(parse(date))
}

export function shortDate(date: string, language: string): string {
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(parse(date))
}

export function weekRange(start: string, end: string, language: string): string {
  return `${shortDate(start, language)} – ${shortDate(end, language)}`
}

// días activos de una lista de días (para el resumen de las últimas semanas)
export const activeDays = (days: Day[]) => days.filter((day) => day.active).length

export function achievementPercent(achievement: Achievement): number {
  return Math.max(0, Math.min(100, Math.round((achievement.value / achievement.threshold) * 100)))
}

// primero lo conseguido (lo más reciente arriba), después lo que está más cerca
export function sortAchievements(list: Achievement[]): Achievement[] {
  return [...list].sort((a, b) => {
    if (a.earnedAt && b.earnedAt) return b.earnedAt.localeCompare(a.earnedAt)
    if (a.earnedAt) return -1
    if (b.earnedAt) return 1
    return achievementPercent(b) - achievementPercent(a)
  })
}

// los minutos de un periodo de forma legible: 75 → «1 h 15 min» lo arma la interfaz con estas dos partes
export function hoursAndMinutes(minutes: number): { hours: number; minutes: number } {
  const safe = Math.max(0, Math.floor(minutes))
  return { hours: Math.floor(safe / 60), minutes: safe % 60 }
}
