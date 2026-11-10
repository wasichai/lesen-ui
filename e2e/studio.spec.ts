import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fakeApi, seedDraft } from './api'

// fase 6: una editora publica una lectura nueva con audio y preguntas sin tocar JSON, y cada lectura tiene su historial
const MP3 = readFileSync(join(import.meta.dirname, 'fixtures', 'audio', 'der-alte-leuchtturm.mp3'))
const VTT =
  'WEBVTT\n\n00:00:00.100 --> 00:00:00.400\nDer\n\n00:00:00.400 --> 00:00:00.900\nHafen\n\n00:00:00.900 --> 00:00:01.200\nist\n\n00:00:01.200 --> 00:00:01.800\nklein\n'

test('una editora escribe, revisa y publica una lectura nueva con audio y preguntas', async ({ page }) => {
  const api = await fakeApi(page, { as: 'editor' })
  // quien solo trabaja en el estudio entra directamente en él
  await page.goto('/')
  await expect(page).toHaveURL(/\/studio$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Estudio editorial' })).toBeVisible()

  // una lectura nueva: el slug sale del título
  await page.getByLabel('Título', { exact: true }).fill('Der kleine Hafen')
  await expect(page.getByLabel('Slug')).toHaveValue('der-kleine-hafen')
  await page.getByLabel('Idioma de la lectura').selectOption('de')
  await page.getByRole('button', { name: 'Crear borrador' }).click()
  await expect(page).toHaveURL(/\/studio\/drafts\/draft-1/)
  await expect(page.getByRole('heading', { level: 1, name: 'Der kleine Hafen' })).toBeVisible()

  // datos
  await page.getByLabel('Resumen').fill('Ein kleiner Hafen am Meer.')
  await page.getByRole('button', { name: 'Naturaleza', exact: true }).click()
  // texto y traducciones
  await page.getByRole('tab', { name: 'Texto y traducciones' }).click()
  await page.getByRole('textbox', { name: 'Oración p1s1' }).fill('Der Hafen ist klein.')
  await page.getByLabel('Traducción al español').first().fill('El puerto es pequeño.')
  await page.getByLabel('Traducción al inglés').first().fill('The harbour is small.')
  await page.getByLabel('Traducción del párrafo al español').fill('El puerto es pequeño.')
  await page.getByLabel('Traducción del párrafo al inglés').fill('The harbour is small.')
  await expect(page.getByText('Cambios sin guardar')).toBeVisible()
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Guardado.')).toBeVisible()

  // una pregunta de verdadero o falso que cita la oración
  await page.getByRole('tab', { name: 'Preguntas' }).click()
  await page.getByLabel('Tipo').selectOption('TRUE_FALSE')
  await page.getByRole('button', { name: 'Añadir pregunta' }).click()
  const question = page.getByRole('region', { name: 'Pregunta q1' })
  await question.getByLabel('Enunciado (español)').fill('El puerto es pequeño.')
  await question.getByLabel('Enunciado (inglés)').fill('The harbour is small.')
  await question.getByLabel('Explicación (español)').fill('Lo dice la oración.')
  await question.getByLabel('Explicación (inglés)').fill('The sentence says so.')
  await expect(question.getByRole('checkbox', { name: /p1s1/ })).toBeChecked()
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Guardado.')).toBeVisible()

  // el audio con sus tiempos por palabra
  await page.getByRole('tab', { name: 'Audio' }).click()
  await page.getByLabel('Archivo de audio (mp3, ogg o m4a)').setInputFiles({ name: 'hafen.mp3', mimeType: 'audio/mpeg', buffer: MP3 })
  await page.getByLabel('Archivo de tiempos (.vtt, .srt o .json)').setInputFiles({ name: 'hafen.vtt', mimeType: 'text/vtt', buffer: Buffer.from(VTT) })
  await page.getByLabel('Quién lee').fill('Ana Pérez')
  await page.getByLabel('Derechos y licencia').fill('Grabación propia')
  await page.getByRole('button', { name: 'Subir audio' }).click()
  await expect(page.getByText('4/4 palabras con tiempo')).toBeVisible()

  // revisión: lo que falta en el diccionario («klein») se añade desde aquí
  await page.getByRole('tab', { name: 'Revisión' }).click()
  await expect(page.getByText('Lista para revisión y publicación')).toBeVisible()
  await page.getByRole('button', { name: /Añadir al diccionario\s*: klein/ }).click()
  const sheet = page.getByRole('dialog', { name: 'Nueva entrada: klein' })
  await expect(sheet.getByLabel('Lema (la forma de diccionario)')).toHaveValue('klein')
  await sheet.getByLabel('Traducción al español (separadas por comas)').fill('pequeño')
  await sheet.getByRole('button', { name: 'Añadir al diccionario' }).click()
  await expect(sheet).toBeHidden()
  await expect(page.getByRole('button', { name: /Añadir al diccionario\s*: klein/ })).toBeHidden()
  expect(api.entries).toContain('klein')

  // enviar, publicar
  await page.getByRole('button', { name: 'Enviar a revisión' }).click()
  await expect(page.getByText('En revisión: no se edita.', { exact: false })).toBeVisible()
  await page.getByLabel('Qué hay que corregir').fill('Primera versión')
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByText('Publicado como versión 1.')).toBeVisible()
  await expect(page.getByText('Publicó la versión 1')).toBeVisible()
  expect(api.drafts[0]).toMatchObject({ status: 'PUBLISHED', publishedVersion: 1 })

  // su historial
  await page.getByRole('link', { name: 'Volver al estudio' }).click()
  await page.getByRole('link', { name: /Historial\s*: Der kleine Hafen/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Historial de der-kleine-hafen' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Versiones' }).getByText('Versión 1')).toBeVisible()
  expect(api.unexpected).toEqual([])
})

test('editar una lectura publicada parte de su versión vigente y avisa si no cambia', async ({ page }) => {
  const api = await fakeApi(page, { as: 'editor' })
  await page.goto('/studio')
  await page.getByRole('button', { name: /Editar\s*: Der alte Leuchtturm/ }).click()
  await expect(page).toHaveURL(/\/studio\/drafts\//)
  await page.getByRole('tab', { name: 'Preguntas' }).click()
  await expect(page.getByRole('region', { name: /^Pregunta q1/ })).toBeVisible()
  await page.getByRole('tab', { name: 'Revisión' }).click()
  await expect(page.getByText('Lista para revisión y publicación')).toBeVisible()
  await expect(page.getByText('El texto es el de la versión publicada: no habrá versión nueva.')).toBeVisible()
  // la otra persona guardó antes: no se pisa
  await page.getByRole('tab', { name: 'Datos' }).click()
  await page.getByLabel('Título', { exact: true }).fill('Der alte Leuchtturm!')
  api.drafts[0]!.revision += 1
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Alguien guardó este borrador mientras tanto.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Recargar' }).click()
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Der alte Leuchtturm')
  // descartarlo
  await page.getByRole('tab', { name: 'Revisión' }).click()
  await page.getByRole('button', { name: 'Descartar el borrador' }).click()
  await page.getByRole('button', { name: 'Sí, descartar' }).click()
  await expect(page).toHaveURL(/\/studio$/)
  expect(api.drafts[0]!.status).toBe('DISCARDED')
  expect(api.unexpected).toEqual([])
})

test('quien solo lee no tiene estudio', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/discover')
  await page.getByRole('heading', { name: 'Para ti' }).waitFor()
  await expect(page.getByRole('link', { name: 'Estudio' })).toHaveCount(0)
  await page.goto('/studio')
  await expect(page.getByRole('heading', { name: 'El estudio es para el equipo editorial' })).toBeVisible()
})

test('una editora convierte una lectura en libro ilustrado y diseña sus páginas', async ({ page }) => {
  const api = await fakeApi(page, { as: 'editor' })
  seedDraft(api)
  await page.goto('/studio/drafts/draft-seed')
  await expect(page.getByRole('tab', { name: 'Páginas' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Libro ilustrado' }).click()
  await page.getByRole('tab', { name: 'Páginas' }).click()

  // la maqueta del libro, y otra para la segunda página; la primera se une con la siguiente
  await page.getByLabel('Maqueta del libro').selectOption('IMAGE_BOTTOM')
  const second = page.getByRole('listitem', { name: 'Página 2' })
  await second.getByLabel('Maqueta').selectOption('TEXT_ONLY')
  await expect(second.getByText('Esta maqueta no lleva ilustración.')).toBeVisible()
  const first = page.getByRole('listitem', { name: 'Página 1' })
  await expect(first.getByText('Falta la ilustración.')).toBeVisible()

  // la ilustración de la primera página con su texto alternativo
  await first.getByLabel('Subir la ilustración de la página 1').setInputFiles({ name: 'bild.png', mimeType: 'image/png', buffer: Buffer.from('png') })
  await first.getByLabel('Texto alternativo en español').fill('Un faro junto al mar')
  await expect(first.getByText('Falta el texto alternativo en algún idioma.')).toBeVisible()
  await first.getByLabel('Texto alternativo en inglés').fill('A lighthouse by the sea')
  await expect(first.getByText('Falta el texto alternativo en algún idioma.')).toHaveCount(0)
  await first.getByRole('button', { name: 'Unir con la siguiente' }).click()

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map((v) => v.id)).toEqual([])

  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Guardado.')).toBeVisible()
  const document = api.drafts[0]!.document
  expect(document).toMatchObject({ format: 'PICTURE_BOOK', layout: 'IMAGE_BOTTOM' })
  expect(document.pages![0]).toMatchObject({
    span: 1,
    layout: null,
    paragraphs: 2,
    illustration: { file: 'illustration-0123456789abcdef01234567.png', alt: { es: 'Un faro junto al mar', en: 'A lighthouse by the sea' } }
  })
  expect((document.pages as { paragraphs: number }[]).reduce((n, p) => n + p.paragraphs, 0)).toBe(document.paragraphs.length)
})
