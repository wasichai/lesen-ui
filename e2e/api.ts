import type { Page, Route } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import fixture from './fixtures/lesen.json' with { type: 'json' }

// la API de Lesen simulada en el navegador, con respuestas reales del backend capturadas por e2e/fixtures/capture.mjs.
// lo de cada persona (perfil, progreso, marcadores, notas, vocabulario, favoritas, historial) vive en el estado de la
// prueba, no en la página: sobrevive a una recarga como en el servidor. Filtra el catálogo como el backend
// (docs/architecture/api-design.md). Cualquier ruta de /api/lesen sin simular es un 404 y queda en `unexpected`

type Json = Record<string, unknown>
type Card = (typeof fixture.cards)[number]
type Lang = 'es' | 'en'
interface Token {
  id: string
  text: string
  kind: string
  space: boolean
  entry: string | null
}
interface FixtureReading {
  detail: { reading: Card; paragraphs: number; related: Card[]; collections: string[] }
  content: Json & { paragraphs: { id: string; sentences: { id: string; tokens: Token[] }[] }[] }
  translations: Record<string, Json[]>
  entries: Record<string, Record<string, Json>>
  audio: Json | null
  assessment: (Json & { id: string; questions: (Json & { id: string; type: string })[]; answers: Record<string, FixtureAnswer> }) | null
}
const READINGS = fixture.readings as unknown as Record<string, FixtureReading | undefined>

const STORAGE_PREFIX = 'lesen'
export const LEARNER = { id: 'u-lena', email: 'lena@demo.lesen.test', displayName: 'Lena Lectora', organizationId: 'org-demo', roles: ['LECTOR'] }
const PERMISSIONS = { admin: false, capabilities: [], objects: { lectura: ['READ'], cuaderno: ['READ', 'UPDATE'] } }
export const PROFILE = {
  interfaceLanguage: 'es',
  targetLanguage: 'de',
  level: 'A2',
  levelEstimated: false,
  goals: ['TRAVEL'],
  topics: ['travel', 'nature'],
  dailyMinutes: 10,
  difficulty: 'BALANCED'
}
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const COVER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><rect width="600" height="800" fill="#2f5d62"/></svg>'

interface Progress {
  version: number
  position: string | null
  percent: number
  secondsRead: number
  startedAt: string
  updatedAt: string
  completedAt: string | null
}

interface VocabularyItem {
  id: string
  entryKey: string
  lemma: string
  pos: string
  language: string
  translations: string[]
  surface: string
  context: string | null
  tokenRef: string | null
  source: { slug: string; title: string; version: number } | null
  status: 'SAVED' | 'LEARNING' | 'FAMILIAR' | 'MASTERED'
  note: string | null
  savedAt: string
  dueAt: string
  reviews: number
}

interface FixtureAnswer {
  solution: Json & {
    options?: string[] | null
    value?: boolean | null
    blanks?: Record<string, string> | null
    pairs?: Record<string, string> | null
    order?: string[] | null
  }
  explanation: string
  refs: string[]
}
interface Activity {
  type: 'READING_STARTED' | 'PROGRESS' | 'READING_COMPLETED' | 'WORD_SAVED' | 'WORD_REVIEWED' | 'ASSESSMENT_SUBMITTED'
  at: string
  language: string
  seconds: number
  words: number
}
interface Totals {
  seconds: number
  started: number
  completed: number
  wordsRead: number
  saved: number
  reviewed: number
  assessments: number
}
type Attempt = Json & { id: string; answers: (Json & { questionId: string; result: string; evaluator: string | null })[] }

export interface FakeApi {
  profile: Json | null
  progress: Map<string, Progress>
  bookmarks: Set<string>
  vocabulary: VocabularyItem[]
  notes: Map<string, Json[]>
  favorites: Set<string>
  history: { query: string; entryKey: string | null }[]
  attempts: Attempt[]
  // las entradas vistas al terminar lecturas
  encountered: Set<string>
  reviews: { vocabularyId: string; rating: string; clientId: string }[]
  // la actividad que cuenta para el progreso, como la registra el backend (learning_activity)
  activity: Activity[]
  goals: { weeklyDays: number; timeZone: string; weeklySummary: boolean; configured: boolean }
  earned: Map<string, string>
  lists: { id: string; name: string; slugs: string[]; updatedAt: string }[]
  // lo que se pidió, como «MÉTODO /ruta»
  requests: string[]
  unexpected: string[]
}

const problem = (status: number, detail: string) => ({ type: `https://lesen.dev/problems/${status}`, title: detail, status, detail })
const now = () => new Date().toISOString()
const after = (ms: number) => new Date(Date.now() + ms).toISOString()
// la próxima fecha de cada respuesta en la simulación (en el backend la calcula FSRS-5)
const RATINGS: [string, number][] = [
  ['AGAIN', 60_000],
  ['HARD', 330_000],
  ['GOOD', 600_000],
  ['EASY', 16 * 86_400_000]
]
const normalize = (text: string) => text.normalize('NFC').replace('’', "'").toLowerCase()

export async function fakeApi(page: Page, options: { signedIn?: boolean; profile?: Json | null } = {}): Promise<FakeApi> {
  const api: FakeApi = {
    profile: options.profile === undefined ? PROFILE : options.profile,
    progress: new Map(),
    bookmarks: new Set(),
    vocabulary: [],
    notes: new Map(),
    favorites: new Set(),
    history: [],
    attempts: [],
    encountered: new Set(),
    reviews: [],
    activity: [],
    goals: { weeklyDays: 3, timeZone: 'UTC', weeklySummary: false, configured: false },
    earned: new Map(),
    lists: [],
    requests: [],
    unexpected: []
  }
  if (options.signedIn !== false)
    await page.addInitScript(
      ({ prefix, user }) => {
        localStorage.setItem(`${prefix}.token`, 'token-e2e')
        localStorage.setItem(`${prefix}.user`, JSON.stringify(user))
      },
      { prefix: STORAGE_PREFIX, user: LEARNER }
    )

  const ui = (): Lang => (api.profile?.interfaceLanguage as Lang) ?? 'es'
  const card = (base: Card) => {
    const progress = api.progress.get(base.slug)
    return {
      ...base,
      bookmarked: api.bookmarks.has(base.slug),
      progress: progress
        ? { percent: progress.percent, version: progress.version, completed: progress.completedAt !== null, updatedAt: progress.updatedAt }
        : null
    }
  }
  const cards = () => fixture.cards.map(card)
  const reading = (slug: string) => READINGS[slug]
  const entries = (language: Lang) => Object.values(READINGS).flatMap((r) => Object.values(r?.entries[language] ?? {}))
  const entry = (key: string, language: Lang) => entries(language).find((e) => e.key === key)
  const withMine = (e: Json) => ({ ...e, favorite: api.favorites.has(e.key as string), saved: api.vocabulary.some((v) => v.entryKey === e.key) })
  const summary = (e: Json, matchedBy: string) => ({
    key: e.key,
    language: e.language,
    lemma: e.lemma,
    pos: e.pos,
    translations: (e.senses as { translations: string[] }[]).flatMap((s) => s.translations).slice(0, 3),
    matchedBy
  })

  function filterCards(url: URL) {
    const p = url.searchParams
    let list = cards()
    const language = p.get('language')
    if (language) list = list.filter((c) => c.language === language)
    const levels = p.getAll('level')
    if (levels.length) list = list.filter((c) => levels.includes(c.level))
    const topic = p.get('topic')
    if (topic) list = list.filter((c) => c.topics.some((t) => t === topic || t.startsWith(`${topic}/`)))
    const min = p.get('minMinutes')
    const max = p.get('maxMinutes')
    if (min) list = list.filter((c) => c.minutes >= Number(min))
    if (max) list = list.filter((c) => c.minutes <= Number(max))
    const q = p.get('q')?.toLowerCase()
    if (q) list = list.filter((c) => [c.title, c.subtitle ?? '', c.summary].some((text) => text.toLowerCase().includes(q)))
    const status = p.get('status')
    if (status === 'BOOKMARKED') list = list.filter((c) => c.bookmarked)
    if (status === 'IN_PROGRESS') list = list.filter((c) => c.progress && !c.progress.completed)
    if (status === 'COMPLETED') list = list.filter((c) => c.progress?.completed)
    const sort = p.get('sort') ?? 'RECENT'
    if (sort === 'LEVEL') list.sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.title.localeCompare(b.title))
    else if (sort === 'DURATION') list.sort((a, b) => a.minutes - b.minutes)
    else if (sort === 'TITLE') list.sort((a, b) => a.title.localeCompare(b.title))
    else list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    const page = Number(p.get('page') ?? 0)
    const size = Number(p.get('size') ?? 12)
    if (size > 50) return { status: 400, body: problem(400, 'Invalid size') }
    return {
      status: 200,
      body: { content: list.slice(page * size, page * size + size), page, size, totalElements: list.length, totalPages: Math.ceil(list.length / size) }
    }
  }

  function discover() {
    if (!api.profile) return { status: 404, body: problem(404, 'No learner profile yet') }
    const target = api.profile.targetLanguage as string
    const mine = cards().filter((c) => c.language === target)
    const at = LEVELS.indexOf(api.profile.level as string)
    const topics = api.profile.topics as string[]
    const recommended = mine
      .filter((c) => !c.progress?.completed && Math.abs(LEVELS.indexOf(c.level) - at) <= 1)
      .map((c) => ({
        reading: c,
        reasons: [
          ...(c.level === api.profile!.level ? ['LEVEL'] : []),
          ...(c.topics.some((t) => topics.some((p) => t === p || t.startsWith(`${p}/`))) ? ['TOPIC'] : [])
        ]
      }))
      .sort((a, b) => b.reasons.length - a.reasons.length)
      .slice(0, 6)
    const counts = new Map<string, number>()
    for (const c of mine) for (const root of new Set(c.topics.map((t) => t.split('/')[0]!))) counts.set(root, (counts.get(root) ?? 0) + 1)
    return {
      status: 200,
      body: {
        continueReading: cards().filter((c) => c.progress && !c.progress.completed),
        featured: mine.filter((c) => c.featured),
        recommended,
        // como el backend: lo terminado en los últimos 7 días, y aquí la única persona es la de la prueba
        thisWeek: mine.filter((c) => c.progress?.completed).map((reading) => ({ reading, readers: 1 })),
        fresh: [...mine].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 6),
        collections: fixture.collections
          .map((c) => ({ ...c, readings: c.readings.map((slug) => mine.find((m) => m.slug === slug)).filter(Boolean) }))
          .filter((c) => c.readings.length),
        topics: [...counts].map(([slug, readings]) => ({ slug, readings }))
      }
    }
  }

  function record(type: Activity['type'], language: string, extra: { seconds?: number; words?: number } = {}) {
    api.activity.push({ type, at: now(), language, seconds: extra.seconds ?? 0, words: extra.words ?? 0 })
  }

  // la proyección por día (en la zona de las metas), como progress en el backend (ADR-0011)
  const ZERO: Totals = { seconds: 0, started: 0, completed: 0, wordsRead: 0, saved: 0, reviewed: 0, assessments: 0 }
  const localDay = (iso: string) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: api.goals.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
  const add = (t: Totals, a: Activity): Totals => ({
    seconds: t.seconds + a.seconds,
    started: t.started + (a.type === 'READING_STARTED' ? 1 : 0),
    completed: t.completed + (a.type === 'READING_COMPLETED' ? 1 : 0),
    wordsRead: t.wordsRead + (a.type === 'READING_COMPLETED' ? a.words : 0),
    saved: t.saved + (a.type === 'WORD_SAVED' ? 1 : 0),
    reviewed: t.reviewed + (a.type === 'WORD_REVIEWED' ? 1 : 0),
    assessments: t.assessments + (a.type === 'ASSESSMENT_SUBMITTED' ? 1 : 0)
  })
  const isActive = (t: Totals) => t.seconds > 0 || t.completed > 0 || t.saved > 0 || t.reviewed > 0 || t.assessments > 0
  const shiftDay = (date: string, days: number) => {
    const d = new Date(`${date}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + days)
    return d.toISOString().slice(0, 10)
  }
  const monday = (date: string) => shiftDay(date, -((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7))
  function perDay(language?: string) {
    const days = new Map<string, Totals>()
    for (const a of api.activity) if (!language || a.language === language) days.set(localDay(a.at), add(days.get(localDay(a.at)) ?? ZERO, a))
    return days
  }
  const sum = (list: Totals[]) =>
    list.reduce(
      (t, o) => ({
        seconds: t.seconds + o.seconds,
        started: t.started + o.started,
        completed: t.completed + o.completed,
        wordsRead: t.wordsRead + o.wordsRead,
        saved: t.saved + o.saved,
        reviewed: t.reviewed + o.reviewed,
        assessments: t.assessments + o.assessments
      }),
      ZERO
    )
  const measured = (value: number) => ({ value, kind: 'MEASURED' })
  const estimated = (value: number) => ({ value, kind: 'ESTIMATED' })
  const dailyMinutes = () => (api.profile?.dailyMinutes as number) ?? 10
  const dayView = (date: string, t: Totals | undefined) => ({
    date,
    minutes: Math.floor((t?.seconds ?? 0) / 60),
    active: t ? isActive(t) : false,
    goalMet: Math.floor((t?.seconds ?? 0) / 60) >= dailyMinutes()
  })
  function streak(today: string) {
    const need = api.goals.weeklyDays
    const weeks = new Map<string, number>()
    for (const [day, t] of perDay()) if (isActive(t) && day <= today) weeks.set(monday(day), (weeks.get(monday(day)) ?? 0) + 1)
    const met = new Set([...weeks].filter(([, n]) => n >= need).map(([w]) => w))
    const thisWeek = monday(today)
    let current = 0
    for (let w = shiftDay(thisWeek, -7); met.has(w); w = shiftDay(w, -7)) current++
    if (met.has(thisWeek)) current++
    let best = 0
    let run = 0
    let previous: string | null = null
    for (const w of [...met].sort()) {
      run = previous && shiftDay(previous, 7) === w ? run + 1 : 1
      best = Math.max(best, run)
      previous = w
    }
    return {
      current,
      best: Math.max(best, current),
      weeksMet: met.size,
      target: need,
      activeThisWeek: weeks.get(thisWeek) ?? 0,
      metThisWeek: met.has(thisWeek)
    }
  }
  function achievements(today: string) {
    const all = sum([...perDay().values()])
    const s = streak(today)
    const value = (kind: string) =>
      ({
        READINGS_COMPLETED: all.completed,
        MINUTES: Math.floor(all.seconds / 60),
        WORDS_SAVED: all.saved,
        WORDS_REVIEWED: all.reviewed,
        ASSESSMENTS: all.assessments,
        ACTIVE_DAYS: [...perDay().values()].filter(isActive).length,
        WEEKS_MET: s.weeksMet,
        BEST_STREAK: s.best
      })[kind] ?? 0
    return fixture.progress.achievements.map((rule) => {
      const v = value(rule.kind)
      if (v >= rule.threshold && !api.earned.has(rule.code)) api.earned.set(rule.code, now())
      return { ...rule, value: Math.min(v, rule.threshold), earnedAt: api.earned.get(rule.code) ?? null }
    })
  }
  function comprehension(language: string) {
    const first = new Map<string, Attempt>()
    for (const a of api.attempts) if (!first.has(a.assessmentId as string)) first.set(a.assessmentId as string, a)
    const rows: { type: string; level: string; score: number }[] = []
    for (const a of first.values()) {
      const card = fixture.cards.find((c) => c.slug === a.slug)
      if (!card || card.language !== language) continue
      for (const answer of a.answers as unknown as { type: string; result: string }[])
        if (['CORRECT', 'PARTIAL', 'INCORRECT'].includes(answer.result))
          rows.push({ type: answer.type, level: card.level, score: answer.result === 'CORRECT' ? 1 : answer.result === 'PARTIAL' ? 0.5 : 0 })
    }
    const by = (key: (r: (typeof rows)[number]) => string) =>
      [...new Set(rows.map(key))].sort().map((k) => {
        const group = rows.filter((r) => key(r) === k)
        return { key: k, answered: group.length, score: Math.round((group.reduce((n, r) => n + r.score, 0) * 100) / group.length) }
      })
    return {
      answered: measured(rows.length),
      average: rows.length ? measured(Math.round((rows.reduce((n, r) => n + r.score, 0) * 100) / rows.length)) : null,
      byType: by((r) => r.type),
      byLevel: by((r) => r.level)
    }
  }
  function progressRoutes(method: string, rest: string[], url: URL, body: Json) {
    if (!api.profile) return { status: 404, body: problem(404, 'No learner profile yet') }
    const today = localDay(now())
    if (rest[0] === 'goals') {
      if (method === 'PUT') {
        if (body.timeZone !== undefined) {
          try {
            new Intl.DateTimeFormat('en', { timeZone: body.timeZone as string })
          } catch {
            return { status: 400, body: problem(400, 'Invalid time zone') }
          }
        }
        if (typeof body.dailyMinutes === 'number') api.profile = { ...api.profile, dailyMinutes: body.dailyMinutes }
        api.goals = {
          weeklyDays: (body.weeklyDays as number) ?? api.goals.weeklyDays,
          timeZone: (body.timeZone as string) ?? api.goals.timeZone,
          weeklySummary: (body.weeklySummary as boolean) ?? api.goals.weeklySummary,
          configured: true
        }
      }
      return { status: 200, body: { dailyMinutes: dailyMinutes(), ...api.goals } }
    }
    if (rest[0] === 'achievements') return { status: 200, body: achievements(today) }
    if (rest[0] === 'weekly') {
      const asked = url.searchParams.get('week')
      if (asked && !/^\d{4}-\d{2}-\d{2}$/.test(asked)) return { status: 400, body: problem(400, 'Invalid week') }
      const start = monday(asked ?? today)
      const days = Array.from({ length: 7 }, (_, i) => shiftDay(start, i))
      const all = perDay()
      const week = sum(days.map((d) => all.get(d) ?? ZERO))
      const active = days.filter((d) => d <= today && all.get(d) && isActive(all.get(d)!)).length
      const end = shiftDay(start, 6)
      return {
        status: 200,
        body: {
          weekStart: start,
          weekEnd: end,
          current: start === monday(today),
          days: days.map((d) => dayView(d, all.get(d))),
          minutes: measured(Math.floor(week.seconds / 60)),
          readingsCompleted: measured(week.completed),
          wordsRead: estimated(week.wordsRead),
          wordsSaved: measured(week.saved),
          wordsReviewed: measured(week.reviewed),
          assessments: measured(week.assessments),
          activeDays: active,
          target: api.goals.weeklyDays,
          met: active >= api.goals.weeklyDays,
          streak: streak(today),
          achievements: achievements(today).filter((a) => a.earnedAt && localDay(a.earnedAt) >= start && localDay(a.earnedAt) <= end)
        }
      }
    }
    if (rest[0] === 'dashboard') {
      const language = url.searchParams.get('language') ?? (api.profile.targetLanguage as string)
      const all = perDay()
      const mine = perDay(language)
      const total = sum([...mine.values()])
      const thisWeek = sum([...mine].filter(([d]) => d >= monday(today)).map(([, t]) => t))
      const by = (status: string) => api.vocabulary.filter((v) => v.language === language && v.status === status).length
      const growthFrom = shiftDay(monday(today), -49)
      const list = achievements(today)
      const todayMinutes = Math.floor((all.get(today)?.seconds ?? 0) / 60)
      const c = comprehension(language)
      return {
        status: 200,
        body: {
          language,
          timeZone: api.goals.timeZone,
          today,
          goal: { dailyMinutes: dailyMinutes(), todayMinutes: measured(todayMinutes), met: todayMinutes >= dailyMinutes() },
          streak: streak(today),
          days: Array.from({ length: 28 }, (_, i) => shiftDay(today, i - 27)).map((d) => dayView(d, all.get(d))),
          reading: {
            started: measured(total.started),
            completed: measured(total.completed),
            minutes: measured(Math.floor(total.seconds / 60)),
            wordsRead: estimated(total.wordsRead),
            minutesThisWeek: measured(Math.floor(thisWeek.seconds / 60)),
            completedThisWeek: measured(thisWeek.completed)
          },
          vocabulary: {
            encountered: measured([...api.encountered].filter((k) => k.startsWith(`${language}:`)).length),
            saved: measured(api.vocabulary.filter((v) => v.language === language).length),
            learning: estimated(by('LEARNING') + by('FAMILIAR')),
            mastered: estimated(by('MASTERED')),
            due: measured(api.vocabulary.filter((v) => v.language === language && v.dueAt <= now()).length),
            growth: Array.from({ length: 8 }, (_, i) => shiftDay(growthFrom, i * 7)).map((weekStart) => ({
              weekStart,
              value: [...mine].filter(([d]) => d >= weekStart && d <= shiftDay(weekStart, 6)).reduce((n, [, t]) => n + t.saved, 0)
            }))
          },
          comprehension: c,
          level: {
            level: api.profile.level,
            kind: 'ESTIMATED',
            signal: 'STEADY',
            answeredAtLevel: c.byLevel.find((l) => l.key === api.profile!.level)?.answered ?? 0
          },
          recentAchievements: list
            .filter((a) => a.earnedAt)
            .sort((a, b) => b.earnedAt!.localeCompare(a.earnedAt!))
            .slice(0, 3)
        }
      }
    }
    return undefined
  }

  function listRoutes(method: string, rest: string[], url: URL, body: Json) {
    const summaryOf = (l: FakeApi['lists'][number], slug?: string | null) => ({
      id: l.id,
      name: l.name,
      count: l.slugs.length,
      contains: slug ? l.slugs.includes(slug) : null,
      updatedAt: l.updatedAt
    })
    const viewOf = (l: FakeApi['lists'][number]) => ({
      id: l.id,
      name: l.name,
      updatedAt: l.updatedAt,
      readings: [...l.slugs].reverse().map((slug) => card(fixture.cards.find((c) => c.slug === slug)!))
    })
    const taken = (name: string, except?: string) => api.lists.some((l) => l.id !== except && l.name.toLowerCase() === name.toLowerCase())
    if (rest.length === 0 && method === 'GET') {
      const slug = url.searchParams.get('reading')
      return { status: 200, body: [...api.lists].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((l) => summaryOf(l, slug)) }
    }
    if (rest.length === 0 && method === 'POST') {
      const name = String(body.name ?? '').trim()
      if (!name || name.length > 80) return { status: 400, body: problem(400, 'Invalid name') }
      if (taken(name)) return { status: 409, body: problem(409, 'A list with that name already exists') }
      const list = { id: `list-${api.lists.length + 1}`, name, slugs: [], updatedAt: now() }
      api.lists.push(list)
      return { status: 201, body: viewOf(list) }
    }
    const list = api.lists.find((l) => l.id === rest[0])
    if (!list) return { status: 404, body: problem(404, 'List not found') }
    if (rest.length === 1 && method === 'GET') return { status: 200, body: viewOf(list) }
    if (rest.length === 1 && method === 'PATCH') {
      const name = String(body.name ?? '').trim()
      if (!name || name.length > 80) return { status: 400, body: problem(400, 'Invalid name') }
      if (taken(name, list.id)) return { status: 409, body: problem(409, 'A list with that name already exists') }
      list.name = name
      list.updatedAt = now()
      return { status: 200, body: viewOf(list) }
    }
    if (rest.length === 1 && method === 'DELETE') {
      api.lists = api.lists.filter((l) => l !== list)
      return { status: 204, body: null }
    }
    if (rest[1] === 'readings' && rest[2]) {
      const slug = decodeURIComponent(rest[2])
      if (!fixture.cards.some((c) => c.slug === slug)) return { status: 404, body: problem(404, 'Reading not found') }
      if (method === 'PUT' && !list.slugs.includes(slug)) list.slugs.push(slug)
      if (method === 'DELETE') list.slugs = list.slugs.filter((s) => s !== slug)
      list.updatedAt = now()
      return { status: 204, body: null }
    }
    return undefined
  }

  function readingRoutes(method: string, rest: string[], url: URL, body: Json) {
    const [slug, ...tail] = rest
    const r = reading(slug!)
    const base = fixture.cards.find((c) => c.slug === slug)
    if (!base) return { status: 404, body: problem(404, 'Reading not found') }
    if (tail.length === 0 && method === 'GET') {
      if (!r) return { status: 404, body: problem(404, 'Reading not found') }
      return {
        status: 200,
        body: { ...r.detail, reading: card(base), related: r.detail.related.map((rel) => card(fixture.cards.find((c) => c.slug === rel.slug) ?? rel)) }
      }
    }
    if (!r) return { status: 404, body: problem(404, 'Reading version not found') }
    if (tail[0] === 'versions' && tail[2] === 'content') return { status: 200, body: r.content }
    if (tail[0] === 'versions' && tail[2] === 'assessment') {
      if (!r.assessment) return { status: 404, body: problem(404, 'No questions for this reading') }
      const { answers: _solutions, ...view } = r.assessment
      void _solutions
      const last = api.attempts.filter((a) => a.assessmentId === r.assessment!.id).at(-1)
      return { status: 200, body: { ...view, lastAttempt: last ? last.summary : null } }
    }
    if (tail[0] === 'versions' && tail[2] === 'audio') return r.audio ? { status: 200, body: r.audio } : { status: 404, body: problem(404, 'No audio') }
    if (tail[0] === 'versions' && tail[2] === 'translations') {
      const language = (url.searchParams.get('language') as Lang) ?? ui()
      const unit = url.searchParams.get('unit')
      const ref = url.searchParams.get('ref')
      const found = (r.translations[language] ?? []).filter((t) => t.unit === unit && (!ref || t.ref === ref))
      return ref && found.length === 0 ? { status: 404, body: problem(404, 'No translation') } : { status: 200, body: found }
    }
    if (tail[0] === 'progress' && method === 'GET') {
      const p = api.progress.get(slug!)
      return p ? { status: 200, body: view(p) } : { status: 404, body: problem(404, 'No progress yet') }
    }
    if (tail[0] === 'progress' && method === 'PUT') {
      const current = api.progress.get(slug!)
      if (!current) record('READING_STARTED', base.language)
      const extra = (body.secondsRead as number) - (current?.secondsRead ?? 0)
      if (extra > 0) record('PROGRESS', base.language, { seconds: extra })
      const same = current?.version === body.version
      const next: Progress = {
        version: body.version as number,
        position: (body.position as string | null) ?? current?.position ?? null,
        percent: same ? Math.max(current!.percent, body.percent as number) : (body.percent as number),
        secondsRead: Math.max(current?.secondsRead ?? 0, body.secondsRead as number),
        startedAt: current?.startedAt ?? now(),
        updatedAt: now(),
        completedAt: current?.completedAt ?? null
      }
      api.progress.set(slug!, next)
      return { status: 200, body: view(next) }
    }
    if (tail[0] === 'completion' && method === 'POST') {
      const current = api.progress.get(slug!)
      if (!current) record('READING_STARTED', base.language)
      const extra = ((body.secondsRead as number) ?? 0) - (current?.secondsRead ?? 0)
      if (extra > 0) record('PROGRESS', base.language, { seconds: extra })
      if (!current?.completedAt) record('READING_COMPLETED', base.language, { words: base.wordCount })
      const done: Progress = {
        version: body.version as number,
        position: current?.position ?? null,
        percent: 100,
        secondsRead: Math.max(current?.secondsRead ?? 0, (body.secondsRead as number) ?? 0),
        startedAt: current?.startedAt ?? now(),
        updatedAt: now(),
        completedAt: current?.completedAt ?? now()
      }
      api.progress.set(slug!, done)
      // como el backend: terminar anota cada entrada vista
      for (const p of r.content.paragraphs) for (const s of p.sentences) for (const t of s.tokens) if (t.entry) api.encountered.add(t.entry)
      return { status: 200, body: view(done) }
    }
    if (tail[0] === 'bookmark') {
      if (method === 'PUT') api.bookmarks.add(slug!)
      else api.bookmarks.delete(slug!)
      return { status: 204, body: null }
    }
    if (tail[0] === 'notes' && method === 'GET') return { status: 200, body: api.notes.get(slug!) ?? [] }
    if (tail[0] === 'notes' && method === 'POST') {
      const sentence = r.content.paragraphs.flatMap((p) => p.sentences).find((s) => s.id === body.sentenceRef)
      if (!sentence) return { status: 400, body: problem(400, 'Invalid sentence') }
      const note = {
        id: `n-${Date.now()}`,
        version: body.version,
        sentenceRef: sentence.id,
        quote: sentence.tokens
          .map((t) => t.text + (t.space ? ' ' : ''))
          .join('')
          .trim(),
        note: body.note ?? null,
        createdAt: now()
      }
      api.notes.set(slug!, [...(api.notes.get(slug!) ?? []), note])
      return { status: 201, body: note }
    }
    return undefined
  }

  const view = (p: Progress) => ({ ...p, completed: p.completedAt !== null })

  function dictionaryRoutes(method: string, rest: string[], url: URL) {
    const language = ui()
    if (rest[0] === 'lookup') {
      const r = reading(url.searchParams.get('reading') ?? '')
      const sentence = r?.content.paragraphs.flatMap((p) => p.sentences).find((s) => s.tokens.some((t) => t.id === url.searchParams.get('token')))
      const token = sentence?.tokens.find((t) => t.id === url.searchParams.get('token'))
      if (!r || !sentence || !token) return { status: 404, body: problem(404, 'Token not found') }
      const found = token.entry ? entry(token.entry, language) : undefined
      return {
        status: 200,
        body: {
          token: token.text,
          tokenRef: token.id,
          sentenceRef: sentence.id,
          sentence: sentence.tokens
            .map((t) => t.text + (t.space ? ' ' : ''))
            .join('')
            .trim(),
          translationLanguage: language,
          entry: found ? withMine(found) : null,
          inflected: found ? normalize(found.lemma as string) !== normalize(token.text) : false,
          alternatives: []
        }
      }
    }
    if (rest[0] === 'search') {
      const q = normalize(url.searchParams.get('q') ?? '')
      const byLemma = entries(language).filter((e) => normalize(e.lemma as string).startsWith(q))
      const byTranslation = entries(language).filter(
        (e) => !byLemma.includes(e) && (e.senses as { translations: string[] }[]).some((s) => s.translations.some((t) => normalize(t).startsWith(q)))
      )
      const results = [...byLemma.map((e) => summary(e, 'LEMMA')), ...byTranslation.map((e) => summary(e, 'TRANSLATION'))]
      const unique = results.filter((e, i) => results.findIndex((other) => other.key === e.key) === i).slice(0, Number(url.searchParams.get('limit') ?? 10))
      if (url.searchParams.get('record') === 'true')
        api.history.unshift({ query: url.searchParams.get('q') ?? '', entryKey: (unique[0]?.key as string) ?? null })
      return { status: 200, body: unique }
    }
    if (rest[0] === 'entries' && rest[1]) {
      const found = entry(decodeURIComponent(rest[1]), language)
      return found ? { status: 200, body: withMine(found) } : { status: 404, body: problem(404, 'Entry not found') }
    }
    if (rest[0] === 'history') {
      if (method === 'DELETE') api.history = []
      return method === 'DELETE' ? { status: 204, body: null } : { status: 200, body: api.history }
    }
    if (rest[0] === 'favorites' && !rest[1]) {
      return {
        status: 200,
        body: [...api.favorites]
          .map((k) => entry(k, language))
          .filter(Boolean)
          .map((e) => summary(e!, 'FAVORITE'))
      }
    }
    if (rest[0] === 'favorites' && rest[1]) {
      const key = decodeURIComponent(rest[1])
      if (method === 'PUT') api.favorites.add(key)
      else api.favorites.delete(key)
      return { status: 204, body: null }
    }
    return undefined
  }

  // corrige como el backend con las soluciones capturadas: lo cerrado por igualdad, la respuesta corta queda para valorar
  function submitAttempt(assessmentId: string, body: Json) {
    const r = Object.values(READINGS).find((x) => x?.assessment?.id === assessmentId)
    if (!r?.assessment) return { status: 404, body: problem(404, 'Assessment not found') }
    const given = new Map(((body.answers as Json[]) ?? []).map((a) => [a.questionId as string, a]))
    const answers = r.assessment.questions.map((q) => {
      const fixture = r.assessment!.answers[q.id]!
      const answer = given.get(q.id) ?? {}
      const solution = fixture.solution
      const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
      let result = 'INCORRECT'
      if (q.type === 'SHORT_ANSWER') result = typeof answer.text === 'string' && answer.text.trim() ? 'UNGRADED' : 'INCORRECT'
      else if (q.type === 'TRUE_FALSE') result = answer.value === solution.value ? 'CORRECT' : 'INCORRECT'
      else if (q.type === 'COMPLETION') {
        const blanks = (answer.blanks as Record<string, string>) ?? {}
        result = Object.entries(solution.blanks ?? {}).every(([k, v]) => normalize(blanks[k]?.trim() ?? '') === normalize(v)) ? 'CORRECT' : 'INCORRECT'
      } else if (q.type === 'MATCHING') result = same(answer.pairs ?? {}, solution.pairs) ? 'CORRECT' : 'INCORRECT'
      else if (q.type === 'ORDERING') result = same(answer.order, solution.order) ? 'CORRECT' : 'INCORRECT'
      else result = same([...((answer.options as string[]) ?? [])].sort(), [...(solution.options ?? [])].sort()) ? 'CORRECT' : 'INCORRECT'
      return {
        questionId: q.id,
        type: q.type,
        result,
        evaluator: result === 'UNGRADED' ? null : 'RULE',
        response: { questionId: q.id, ...answer },
        solution,
        explanation: fixture.explanation,
        refs: fixture.refs,
        justification: null,
        citations: []
      }
    })
    const { answers: _solutions, lastAttempt: _last, ...view } = r.assessment
    void _solutions
    void _last
    const id = `attempt-${api.attempts.length + 1}`
    const attempt: Attempt = {
      id,
      assessmentId,
      slug: view.slug,
      version: view.version,
      submittedAt: now(),
      questions: view.questions,
      answers,
      summary: {}
    }
    attempt.summary = summarize(attempt)
    api.attempts.push(attempt)
    record('ASSESSMENT_SUBMITTED', r.content.language as string)
    return { status: 201, body: attempt }
  }

  function summarize(attempt: Attempt) {
    const count = (result: string) => attempt.answers.filter((a) => a.result === result).length
    return {
      id: attempt.id,
      submittedAt: attempt.submittedAt,
      total: attempt.answers.length,
      correct: count('CORRECT'),
      partial: count('PARTIAL'),
      incorrect: count('INCORRECT'),
      pending: count('PENDING'),
      ungraded: count('UNGRADED')
    }
  }

  function attemptRoutes(method: string, rest: string[], body: Json) {
    const attempt = api.attempts.find((a) => a.id === rest[0])
    if (!attempt) return { status: 404, body: problem(404, 'Attempt not found') }
    if (method === 'GET') return { status: 200, body: attempt }
    const answer = attempt.answers.find((a) => a.questionId === rest[2])
    if (!answer || answer.result !== 'UNGRADED') return { status: 409, body: problem(409, 'This answer is not waiting for a self-assessment') }
    answer.result = body.result as string
    answer.evaluator = 'SELF'
    attempt.summary = summarize(attempt)
    return { status: 200, body: attempt }
  }

  function vocabularyRoutes(method: string, rest: string[], url: URL, body: Json) {
    const language = ui()
    if (rest[0] === 'known')
      return {
        status: 200,
        body: { saved: api.vocabulary.map((v) => ({ key: v.entryKey, status: v.status })), encountered: [...api.encountered].sort() }
      }
    if (rest[0] === 'stats') {
      const due = api.vocabulary.filter((v) => v.dueAt <= now()).length
      const by = (status: string) => api.vocabulary.filter((v) => v.status === status).length
      return {
        status: 200,
        body: {
          total: api.vocabulary.length,
          byStatus: { SAVED: by('SAVED'), LEARNING: by('LEARNING'), FAMILIAR: by('FAMILIAR'), MASTERED: by('MASTERED') },
          dueNow: due,
          reviewedToday: api.reviews.length,
          encountered: api.encountered.size
        }
      }
    }
    if (rest[0] === 'reviews' && rest[1] === 'next') {
      const due = api.vocabulary.filter((v) => v.dueAt <= now()).sort((a, b) => a.dueAt.localeCompare(b.dueAt))
      const later = api.vocabulary
        .filter((v) => v.dueAt > now())
        .map((v) => v.dueAt)
        .sort()
      return {
        status: 200,
        body: {
          cards: due
            .slice(0, 20)
            .map((item) => ({ item, state: item.reviews ? 'REVIEW' : 'LEARNING', preview: Object.fromEntries(RATINGS.map(([r, ms]) => [r, after(ms)])) })),
          due: due.length,
          nextDueAt: later[0] ?? null
        }
      }
    }
    if (rest[0] === 'reviews' && method === 'POST') {
      const item = api.vocabulary.find((v) => v.id === body.vocabularyId)
      if (!item) return { status: 404, body: problem(404, 'Word not found') }
      const previousStatus = item.status
      // una versión mínima del repaso: el servidor real usa FSRS-5 (sus pruebas, en el backend)
      if (!api.reviews.some((r) => r.clientId === body.clientId)) {
        const rating = RATINGS.find(([r]) => r === body.rating)
        if (!rating) return { status: 400, body: problem(400, 'Invalid rating') }
        api.reviews.push({ vocabularyId: item.id, rating: rating[0], clientId: body.clientId as string })
        record('WORD_REVIEWED', item.language)
        item.dueAt = after(rating[1])
        item.reviews += 1
        item.status = rating[0] === 'EASY' ? 'FAMILIAR' : 'LEARNING'
      }
      return { status: 200, body: { item, state: item.status === 'FAMILIAR' ? 'REVIEW' : 'LEARNING', previousStatus } }
    }
    if (rest[0] === 'keys')
      return {
        status: 200,
        body: api.vocabulary.filter((v) => !url.searchParams.get('language') || v.language === url.searchParams.get('language')).map((v) => v.entryKey)
      }
    if (!rest[0] && method === 'GET') {
      const q = url.searchParams.get('q')?.toLowerCase()
      const status = url.searchParams.get('status')
      const list = api.vocabulary.filter(
        (v) => (!q || v.lemma.toLowerCase().startsWith(q) || v.surface.toLowerCase().startsWith(q)) && (!status || v.status === status)
      )
      return { status: 200, body: { content: list, page: 0, size: 24, totalElements: list.length, totalPages: list.length ? 1 : 0 } }
    }
    if (!rest[0] && method === 'POST') {
      const existing = api.vocabulary.find((v) => v.entryKey === body.entryKey)
      if (existing) return { status: 200, body: existing }
      const found = entry(body.entryKey as string, language)
      if (!found) return { status: 404, body: problem(404, 'Entry not found') }
      let surface = found.lemma as string
      let context: string | null = null
      let source: VocabularyItem['source'] = null
      if (body.reading) {
        const r = reading(body.reading as string)
        const sentence = r?.content.paragraphs.flatMap((p) => p.sentences).find((s) => s.tokens.some((t) => t.id === body.tokenRef))
        const token = sentence?.tokens.find((t) => t.id === body.tokenRef)
        if (!r || !sentence || !token || token.entry !== body.entryKey) return { status: 400, body: problem(400, 'Invalid token') }
        surface = token.text
        context = sentence.tokens
          .map((t) => t.text + (t.space ? ' ' : ''))
          .join('')
          .trim()
        source = { slug: body.reading as string, title: r.detail.reading.title, version: body.version as number }
      }
      const item: VocabularyItem = {
        id: `v-${api.vocabulary.length + 1}`,
        entryKey: found.key as string,
        lemma: found.lemma as string,
        pos: found.pos as string,
        language: found.language as string,
        translations: summary(found, 'SAVED').translations,
        surface,
        context,
        tokenRef: (body.tokenRef as string) ?? null,
        source,
        status: 'SAVED',
        note: null,
        savedAt: now(),
        dueAt: now(),
        reviews: 0
      }
      api.vocabulary.unshift(item)
      record('WORD_SAVED', item.language)
      return { status: 201, body: item }
    }
    const item = api.vocabulary.find((v) => v.id === rest[0])
    if (!item) return { status: 404, body: problem(404, 'Word not found') }
    if (method === 'PATCH') {
      item.note = (body.note as string | null) ?? null
      return { status: 200, body: item }
    }
    if (method === 'DELETE') {
      api.vocabulary = api.vocabulary.filter((v) => v !== item)
      return { status: 204, body: null }
    }
    return undefined
  }

  await page.route('**/api/**', async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    let body: Json = {}
    try {
      body = (request.postDataJSON() as Json) ?? {}
    } catch {
      body = {}
    }
    api.requests.push(`${method} ${url.pathname}`)
    const path = url.pathname
    let reply: { status: number; body: unknown } | undefined
    if (path.startsWith('/api/lesen/public/covers/')) return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: COVER })
    if (path.startsWith('/api/lesen/public/audio/')) return fulfillAudio(route, path.split('/').pop()!)
    if (method === 'POST' && path === '/api/auth/login') reply = { status: 200, body: { token: 'token-e2e', expiresAt: '2099-01-01T00:00:00Z', user: LEARNER } }
    else if (path === '/api/auth/me/permissions') reply = { status: 200, body: PERMISSIONS }
    else if (path === '/api/lesen/public/languages') reply = { status: 200, body: fixture.languages }
    else if (path === '/api/lesen/public/topics') reply = { status: 200, body: fixture.topics }
    else if (path === '/api/lesen/learner/profile') {
      if (method === 'PUT') {
        api.profile = body
        reply = { status: 200, body: { ...body, createdAt: now(), updatedAt: now() } }
      } else reply = api.profile ? { status: 200, body: api.profile } : { status: 404, body: problem(404, 'No learner profile yet') }
    } else if (path === '/api/lesen/discover') reply = discover()
    else if (path === '/api/lesen/readings') reply = filterCards(url)
    else if (path.startsWith('/api/lesen/readings/')) reply = readingRoutes(method, path.slice('/api/lesen/readings/'.length).split('/'), url, body)
    else if (path === '/api/lesen/library') {
      const all = cards()
      reply = {
        status: 200,
        body: {
          inProgress: all.filter((c) => c.progress && !c.progress.completed),
          bookmarked: all.filter((c) => c.bookmarked),
          completed: all.filter((c) => c.progress?.completed)
        }
      }
    } else if (path.startsWith('/api/lesen/notes/') && method === 'DELETE') {
      const id = path.split('/').pop()
      let found = false
      for (const [slug, notes] of api.notes) {
        if (notes.some((n) => n.id === id)) found = true
        api.notes.set(
          slug,
          notes.filter((n) => n.id !== id)
        )
      }
      reply = found ? { status: 204, body: null } : { status: 404, body: problem(404, 'Note not found') }
    } else if (method === 'POST' && /^\/api\/lesen\/assessments\/[^/]+\/attempts$/.test(path)) reply = submitAttempt(path.split('/')[4]!, body)
    else if (/^\/api\/lesen\/attempts\/[^/]+(\/answers\/[^/]+\/self-assessment)?$/.test(path)) reply = attemptRoutes(method, path.split('/').slice(4), body)
    else if (path.startsWith('/api/lesen/dictionary/')) reply = dictionaryRoutes(method, path.slice('/api/lesen/dictionary/'.length).split('/'), url)
    else if (path === '/api/lesen/vocabulary' || path.startsWith('/api/lesen/vocabulary/'))
      reply = vocabularyRoutes(method, path.slice('/api/lesen/vocabulary'.length).split('/').filter(Boolean), url, body)
    else if (path.startsWith('/api/lesen/progress/')) reply = progressRoutes(method, path.slice('/api/lesen/progress/'.length).split('/'), url, body)
    else if (path === '/api/lesen/lists' || path.startsWith('/api/lesen/lists/'))
      reply = listRoutes(method, path.slice('/api/lesen/lists'.length).split('/').filter(Boolean), url, body)
    if (!reply) {
      // lo de la plataforma que core pide por su cuenta (preferencias): sin endpoint, core las guarda en el navegador
      if (!path.startsWith('/api/auth/')) api.unexpected.push(`${method} ${path}`)
      reply = { status: 404, body: problem(404, 'Not simulated') }
    }
    await route.fulfill({
      status: reply.status,
      contentType: reply.status < 400 ? 'application/json' : 'application/problem+json',
      body: reply.status === 204 ? '' : JSON.stringify(reply.body)
    })
  })
  return api
}

// el mp3 capturado, con rangos como el servidor: sin un 206 el navegador no deja buscar en el audio
function fulfillAudio(route: Route, file: string) {
  let bytes: Buffer
  try {
    bytes = readFileSync(join(import.meta.dirname, 'fixtures', 'audio', file))
  } catch {
    return route.fulfill({ status: 404, contentType: 'application/problem+json', body: JSON.stringify(problem(404, 'No audio')) })
  }
  const range = /bytes=(\d*)-(\d*)/.exec(route.request().headers()['range'] ?? '')
  if (!range) return route.fulfill({ status: 200, contentType: 'audio/mpeg', headers: { 'Accept-Ranges': 'bytes' }, body: bytes })
  const start = range[1] ? Number(range[1]) : bytes.length - Number(range[2])
  const end = range[1] && range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1
  return route.fulfill({
    status: 206,
    contentType: 'audio/mpeg',
    headers: { 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${bytes.length}` },
    body: bytes.subarray(start, end + 1)
  })
}
