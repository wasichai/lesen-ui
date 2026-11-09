// captura los ejemplos de las pruebas e2e desde un backend de Lesen en marcha con el contenido de demostración
// (README, «Pruebas»). Así la API simulada de e2e/api.ts sirve respuestas reales del contrato, no inventadas.
// uso: LESEN_EMAIL=lena@demo.lesen.test LESEN_PASSWORD=… node e2e/fixtures/capture.mjs [http://localhost:8095]
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const base = (process.argv[2] ?? 'http://localhost:8095') + '/api'
const READINGS = ['der-alte-leuchtturm', 'der-fuchs-im-garten', 'a-morning-in-lisbon']
// la narración solo de esta lectura: las otras dos hacen de lecturas sin audio (el lector sigue igual)
const WITH_AUDIO = ['der-alte-leuchtturm']
const login = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: process.env.LESEN_EMAIL, password: process.env.LESEN_PASSWORD })
})
const { token } = await login.json()
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
  readings: {}
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
  fixture.readings[slug] = {
    detail: { ...detail, reading: anonymous(detail.reading), related: detail.related.map(anonymous) },
    content,
    translations,
    entries,
    audio
  }
}
writeFileSync(join(import.meta.dirname, 'lesen.json'), JSON.stringify(fixture) + '\n')
console.log(`${cards.length} tarjetas, ${READINGS.length} lecturas con texto`)
