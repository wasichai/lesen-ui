import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { fakeApi, seedDraft } from './api'

// las imágenes entre párrafos de un texto (ADR-0018 del backend): en su sitio, con su alt y su pie en el idioma de la
// lectura, y editables desde el estudio
test('el lector muestra la imagen tras su párrafo, con su texto alternativo y su pie', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  const figure = page.locator('figure[data-image="img-1"]')
  const image = figure.getByRole('img', { name: /Ein weißer Leuchtturm/ })
  await expect(image).toHaveAttribute('lang', 'de')
  await expect(image).toHaveAttribute('width', '1200')
  await expect(figure.locator('figcaption')).toHaveText('Plötzlich geht das Licht aus.')
  // entre el párrafo de la tormenta y el siguiente
  const order = await page.locator('.reading-text > *').evaluateAll((nodes) => nodes.map((n) => n.querySelector('p[id]')?.id ?? n.getAttribute('data-image')))
  expect(order).toEqual(['p1', 'p2', 'p3', 'img-1', 'p4', 'p5'])
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map((v) => v.id)).toEqual([])
})

test('una editora añade una imagen entre párrafos, ve que le falta el texto alternativo y la guarda', async ({ page }) => {
  const api = await fakeApi(page, { as: 'editor' })
  seedDraft(api)
  await page.goto('/studio/drafts/draft-seed?tab=text')
  // la versión publicada ya trae la suya tras el párrafo 3
  await expect(page.getByRole('region', { name: 'Imagen 1' }).getByLabel('Texto alternativo')).toHaveValue(/Ein weißer Leuchtturm/)
  await page.getByRole('button', { name: 'Añadir una imagen tras el párrafo 1' }).click()
  const image = page.getByRole('region', { name: 'Imagen 2' })
  await image.getByLabel('Subir la imagen 2').setInputFiles({ name: 'bild.png', mimeType: 'image/png', buffer: Buffer.from('png') })
  await expect(image.getByText('Falta el texto alternativo: sin él no se publica.')).toBeVisible()
  await image.getByLabel('Texto alternativo').fill('Ein Leuchtturm im Sturm')
  await image.getByLabel('Pie de imagen (opcional)').fill('Das Licht geht aus.')
  await expect(image.getByText('Falta el texto alternativo')).toHaveCount(0)
  await image.getByRole('button', { name: 'Mover abajo la imagen 2' }).click()

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map((v) => v.id)).toEqual([])

  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Guardado.')).toBeVisible()
  expect(api.drafts[0]!.document.images?.[1]).toEqual({
    after: 2,
    file: 'illustration-0123456789abcdef01234567.png',
    width: 640,
    height: 480,
    alt: 'Ein Leuchtturm im Sturm',
    caption: 'Das Licht geht aus.'
  })
})
