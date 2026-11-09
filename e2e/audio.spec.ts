import { expect, test } from '@playwright/test'
import { fakeApi } from './api'
import fixture from './fixtures/lesen.json' with { type: 'json' }

// la narración de demostración (fase 3) contra sus tiempos reales: la palabra marcada sigue al audio, pausar la congela,
// «escuchar desde aquí» busca la palabra y una lectura sin audio no enseña barra
const audio = fixture.readings['der-alte-leuchtturm'].audio!.assets[0]!
const timings = audio.timings as [string, number, number][]
const playing = '.word[data-playing="true"]'

// la palabra que debería sonar en un instante, con el margen del fotograma y del reloj
const spokenAround = (ms: number, slackMs = 400) => timings.filter(([, start, end]) => start <= ms + slackMs && end + slackMs >= ms).map(([id]) => id)

test('la palabra que suena se marca al ritmo del audio y la pausa la deja quieta', async ({ page }) => {
  await fakeApi(page)
  // el elemento de audio no está en el DOM: se guarda al reproducir para leer su reloj
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      ;(window as unknown as { lesenAudio: HTMLMediaElement }).lesenAudio = this
      return play.call(this)
    }
  })
  await page.goto('/read/der-alte-leuchtturm')
  const bar = page.getByRole('region', { name: 'Audio de la lectura' })
  await expect(bar.getByText('Voz: ' + audio.voice.name)).toBeVisible()
  await bar.getByLabel('Velocidad').selectOption('1.5')
  await bar.getByRole('button', { name: 'Escuchar' }).click()
  await expect(bar.getByRole('button', { name: 'Pausar' })).toBeVisible()

  // tres muestras: el token marcado es el que dicen los tiempos para el instante en que se mira
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(700)
    const sample = await page.evaluate((selector) => {
      const element = (window as unknown as { lesenAudio: HTMLMediaElement }).lesenAudio
      return { ms: element.currentTime * 1000, word: document.querySelector(selector)?.getAttribute('data-token') ?? null }
    }, playing)
    expect(sample.ms).toBeGreaterThan(0)
    if (sample.word) expect(spokenAround(sample.ms)).toContain(sample.word)
  }
  await expect(page.locator(playing)).toHaveCount(1)
  await expect(page.locator('.sentence[data-spoken="true"]')).toHaveCount(1)

  await bar.getByRole('button', { name: 'Pausar' }).click()
  const word = await page.locator(playing).getAttribute('data-token')
  await page.waitForTimeout(800)
  await expect(page.locator(playing)).toHaveAttribute('data-token', word!)
  await expect(bar.getByRole('button', { name: 'Escuchar' })).toBeVisible()
})

test('escuchar desde una palabra empieza en ella', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  const [tokenId, start] = timings.find(([id]) => id.startsWith('p2'))!
  await page.locator(`[data-token="${tokenId}"]`).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Escuchar desde aquí' }).click()
  await expect(page.locator(playing)).toHaveAttribute('data-token', /^p2/)
  const position = Number(await page.getByLabel('Posición del audio').inputValue())
  expect(position).toBeGreaterThanOrEqual(start - 50)
})

test('escuchar un párrafo se detiene al acabarlo', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  await page.locator('#p1').waitFor()
  const first = page.getByRole('button', { name: 'Escuchar este párrafo' }).first()
  await page.getByRole('region', { name: 'Audio de la lectura' }).getByLabel('Velocidad').selectOption('1.5')
  await first.click()
  await expect(page.locator(playing)).toHaveAttribute('data-token', /^p1/)
  const p1End = Math.max(...timings.filter(([id]) => id.startsWith('p1')).map(([, , end]) => end))
  await expect(page.getByRole('button', { name: 'Escuchar', exact: true })).toBeVisible({ timeout: p1End / 1.5 + 5_000 })
  expect(Number(await page.getByLabel('Posición del audio').inputValue())).toBeLessThan(p1End + 400)
})

test('una lectura sin audio no enseña la barra y se lee igual', async ({ page }) => {
  const api = await fakeApi(page)
  await page.goto('/read/der-fuchs-im-garten')
  await expect(page.locator('[data-token="p1s1t1"]')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Audio de la lectura' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Escuchar este párrafo' })).toHaveCount(0)
  expect(api.requests).toContain('GET /api/lesen/readings/der-fuchs-im-garten/versions/1/audio')
})

test('en el móvil la barra del audio cabe y no tapa el final del texto', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  const bar = page.getByRole('region', { name: 'Audio de la lectura' })
  await expect(bar.getByRole('button', { name: 'Escuchar' })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  for (const button of await bar.getByRole('button').all()) {
    const box = await button.boundingBox()
    if (box) expect(box.height).toBeGreaterThanOrEqual(44)
  }
  // al final de la página, lo último del artículo queda por encima de la barra
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  const barTop = (await bar.boundingBox())!.y
  const articleBottom = await page.evaluate(() => document.querySelector('article')!.getBoundingClientRect().bottom)
  expect(articleBottom).toBeLessThanOrEqual(barTop)
})
