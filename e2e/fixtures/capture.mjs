// captura los ejemplos de las pruebas e2e desde un backend de Lesen en marcha con el contenido de demostración
// (README, «Pruebas»). Así la API simulada de e2e/api.ts sirve respuestas reales del contrato, no inventadas.
// uso: LESEN_EMAIL=lena@demo.lesen.test LESEN_PASSWORD=… node e2e/fixtures/capture.mjs [http://localhost:8095]
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const base = (process.argv[2] ?? 'http://localhost:8095') + '/api'
// ein-sonntag-bei-oma: el libro ilustrado de la demostración (ADR-0014 del backend)
const READINGS = ['der-alte-leuchtturm', 'der-fuchs-im-garten', 'a-morning-in-lisbon', 'ein-sonntag-bei-oma']
// la narración solo de esta lectura: las otras dos hacen de lecturas sin audio (el lector sigue igual)
const WITH_AUDIO = ['der-alte-leuchtturm']
// las preguntas de comprensión de esta lectura, y sus soluciones y explicaciones (de un intento en blanco), para que la
// simulación corrija como el backend
const WITH_QUESTIONS = ['der-alte-leuchtturm']
const login = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: process.env.LESEN_EMAIL, password: process.env.LESEN_PASSWORD })
})
const { token } = await login.json()
const send = async (method, path, body) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return response.json()
}
const get = async (path) => {
  const response = await fetch(`${base}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error(`${path}: ${response.status}`)
  return response.json()
}

// las tarjetas, sin lo personal de quien capturó: la simulación pone el progreso y el marcador de cada prueba
const anonymous = (card) => ({ ...card, bookmarked: false, progress: null, readers: 0 })
const cards = (await get('/lesen/readings?size=50&sort=TITLE')).content.map(anonymous)
const fixture = {
  languages: await get('/lesen/public/languages'),
  topics: await get('/lesen/public/topics'),
  collections: (await get('/lesen/discover')).collections.map((c) => ({ ...c, readings: c.readings.map((r) => r.slug) })),
  cards,
  readings: {},
  // las reglas de los logros (lesen.achievement): la simulación calcula cuánto lleva cada prueba
  progress: { achievements: (await get('/lesen/progress/achievements')).map(({ code, kind, threshold }) => ({ code, kind, threshold })) }
}
for (const slug of READINGS) {
  const detail = await get(`/lesen/readings/${slug}`)
  const version = detail.reading.version
  const content = await get(`/lesen/readings/${slug}/versions/${version}/content`)
  const translations = {}
  for (const language of ['es', 'en'].filter((l) => l !== content.language)) {
    translations[language] = [
      ...(await get(`/lesen/readings/${slug}/versions/${version}/translations?unit=SENTENCE&language=${language}`)),
      ...(await get(`/lesen/readings/${slug}/versions/${version}/translations?unit=PARAGRAPH&language=${language}`))
    ]
  }
  // las entradas del primer párrafo: las palabras que tocan las pruebas. Las demás responden «sin entrada»
  const keys = [...new Set(content.paragraphs[0].sentences.flatMap((s) => s.tokens.map((t) => t.entry).filter(Boolean)))]
  const entries = {}
  for (const language of ['es', 'en'].filter((l) => l !== content.language)) {
    entries[language] = {}
    for (const key of keys) {
      const entry = await get(`/lesen/dictionary/entries/${encodeURIComponent(key)}?language=${language}`)
      entries[language][key] = { ...entry, favorite: false, saved: false }
    }
  }
  let audio = null
  if (WITH_AUDIO.includes(slug)) {
    audio = await get(`/lesen/readings/${slug}/versions/${version}/audio`)
    const file = await fetch(`${base.slice(0, -'/api'.length)}${audio.assets[0].url}`)
    if (!file.ok) throw new Error(`${audio.assets[0].url}: ${file.status}`)
    mkdirSync(join(import.meta.dirname, 'audio'), { recursive: true })
    writeFileSync(join(import.meta.dirname, 'audio', audio.assets[0].url.split('/').pop()), Buffer.from(await file.arrayBuffer()))
  }
  let assessment = null
  if (WITH_QUESTIONS.includes(slug)) {
    const questions = await get(`/lesen/readings/${slug}/versions/${version}/assessment?language=es`)
    const blank = await send('POST', `/lesen/assessments/${questions.id}/attempts`, { answers: [] })
    assessment = {
      ...questions,
      lastAttempt: null,
      answers: Object.fromEntries(blank.answers.map((a) => [a.questionId, { solution: a.solution, explanation: a.explanation, refs: a.refs }]))
    }
  }
  fixture.readings[slug] = {
    detail: { ...detail, reading: anonymous(detail.reading), related: detail.related.map(anonymous) },
    content,
    translations,
    entries,
    audio,
    assessment
  }
}
// el estudio, como editora (LESEN_EDITOR_EMAIL, por defecto la de la demostración, con la misma contraseña): las lecturas
// publicadas, y un borrador de una de ellas con su comprobación, que se descarta al terminar
const editorLogin = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: process.env.LESEN_EDITOR_EMAIL ?? 'editor@demo.lesen.test',
    password: process.env.LESEN_EDITOR_PASSWORD ?? process.env.LESEN_PASSWORD
  })
})
const editorToken = (await editorLogin.json()).token
const studio = async (method, path, body) => {
  const response = await fetch(`${base}/lesen/studio${path}`, {
    method,
    headers: { Authorization: `Bearer ${editorToken}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  if (!response.ok) throw new Error(`studio${path}: ${response.status}`)
  return response.status === 204 ? null : response.json()
}
const draft = await studio('POST', '/drafts', { from: 'der-alte-leuchtturm' })
fixture.studio = {
  readings: (await studio('GET', '/readings')).map((r) => ({ ...r, openDraft: null })),
  draft: { ...draft, events: [] },
  check: await studio('GET', `/drafts/${draft.id}/check`)
}
await studio('DELETE', `/drafts/${draft.id}`)
// las portadas ilustradas de cada tarjeta, para que las capturas visuales enseñen las de verdad
mkdirSync(join(import.meta.dirname, 'covers'), { recursive: true })
for (const card of cards) {
  const file = await fetch(`${base}/lesen/public/covers/${card.slug}.svg`)
  if (file.ok) writeFileSync(join(import.meta.dirname, 'covers', `${card.slug}.svg`), await file.text())
}

writeFileSync(join(import.meta.dirname, 'lesen.json'), JSON.stringify(fixture) + '\n')
console.log(`${cards.length} tarjetas, ${READINGS.length} lecturas con texto`)
