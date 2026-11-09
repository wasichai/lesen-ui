import { describe, expect, it } from 'vitest'
import type { Achievement, Streak } from './contract'
import {
  achievementPercent,
  bars,
  dayName,
  goalPercent,
  hoursAndMinutes,
  mondayOf,
  shiftWeek,
  sortAchievements,
  streakMessage,
  thisWeek,
  weekRange
} from './progressModel'

const streak = (change: Partial<Streak> = {}): Streak => ({ current: 0, best: 0, weeksMet: 0, target: 3, activeThisWeek: 0, metThisWeek: false, ...change })
const achievement = (code: string, value: number, threshold: number, earnedAt: string | null = null): Achievement => ({
  code,
  kind: 'READINGS_COMPLETED',
  threshold,
  value,
  earnedAt
})

describe('las gráficas', () => {
  it('escalan al mayor valor y no esconden lo poco', () => {
    expect(bars([0, 5, 10], 100)).toEqual([0, 50, 100])
    expect(bars([1, 1000], 100)).toEqual([2, 100])
    expect(bars([0, 0], 100)).toEqual([0, 0])
    expect(bars([], 100)).toEqual([])
  })

  it('la meta diaria es un porcentaje entre 0 y 100', () => {
    expect(goalPercent(5, 10)).toBe(50)
    expect(goalPercent(25, 10)).toBe(100)
    expect(goalPercent(0, 10)).toBe(0)
    expect(goalPercent(3, 0)).toBe(100)
  })
})

describe('la racha', () => {
  it('nunca dice que se perdió: empieza, sigue o se cumplió', () => {
    expect(streakMessage(streak())).toEqual({ key: 'start', left: 3 })
    expect(streakMessage(streak({ current: 2, activeThisWeek: 1 }))).toEqual({ key: 'ongoing', count: 2, left: 2 })
    expect(streakMessage(streak({ current: 3, activeThisWeek: 3, metThisWeek: true }))).toEqual({ key: 'metThisWeek', count: 3 })
    expect(streakMessage(streak({ activeThisWeek: 5 }))).toEqual({ key: 'start', left: 0 })
  })
})

describe('las semanas', () => {
  it('se mueven de lunes en lunes sin depender de la zona del navegador', () => {
    expect(shiftWeek('2026-11-09', 1)).toBe('2026-11-16')
    expect(shiftWeek('2026-11-09', -1)).toBe('2026-11-02')
    expect(shiftWeek('2026-12-28', 1)).toBe('2027-01-04')
    expect(shiftWeek('2026-03-23', 1)).toBe('2026-03-30')
  })

  it('empiezan en lunes y la en curso llega hasta hoy', () => {
    expect(mondayOf('2026-11-15')).toBe('2026-11-09')
    expect(mondayOf('2026-11-09')).toBe('2026-11-09')
    expect(mondayOf('2027-01-01')).toBe('2026-12-28')
    const day = (date: string) => ({ date, minutes: 1, active: true, goalMet: false })
    expect(thisWeek([day('2026-11-08'), day('2026-11-09'), day('2026-11-11')], '2026-11-11').map((d) => d.date)).toEqual(['2026-11-09', '2026-11-11'])
  })

  it('nombran los días en el idioma de la interfaz', () => {
    expect(dayName('2026-11-09', 'es', 'long')).toBe('lunes')
    expect(dayName('2026-11-15', 'en', 'long')).toBe('Sunday')
    expect(weekRange('2026-11-09', '2026-11-15', 'en')).toBe('Nov 9 – Nov 15')
  })
})

describe('los logros', () => {
  it('muestran primero lo conseguido y después lo más cercano', () => {
    const list = [
      achievement('far', 1, 20),
      achievement('old', 1, 1, '2026-11-01T10:00:00Z'),
      achievement('near', 4, 5),
      achievement('new', 5, 5, '2026-11-09T10:00:00Z')
    ]
    expect(sortAchievements(list).map((a) => a.code)).toEqual(['new', 'old', 'near', 'far'])
    expect(achievementPercent(achievement('x', 4, 5))).toBe(80)
    expect(achievementPercent(achievement('x', 9, 5))).toBe(100)
  })

  it('los minutos se parten en horas y minutos', () => {
    expect(hoursAndMinutes(75)).toEqual({ hours: 1, minutes: 15 })
    expect(hoursAndMinutes(0)).toEqual({ hours: 0, minutes: 0 })
    expect(hoursAndMinutes(-3)).toEqual({ hours: 0, minutes: 0 })
  })
})
