import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// humo del estudio contra el backend de verdad (fase 6): la editora de model/apply.py --demo publica una lectura nueva con
// audio y una pregunta, sin tocar JSON. LESEN_EDITOR_EMAIL elige quién entra (por defecto, la editora de la demostración)
const EMAIL = process.env.LESEN_EDITOR_EMAIL ?? 'editor@demo.lesen.test'
const PASSWORD = process.env.LESEN_EDITOR_PASSWORD ?? process.env.LESEN_PASSWORD ?? ''
const MP3 = readFileSync(join(import.meta.dirname, '..', 'fixtures', 'audio', 'der-alte-leuchtturm.mp3'))
const VTT =
  'WEBVTT\n\n00:00:00.100 --> 00:00:00.400\nDer\n\n00:00:00.400 --> 00:00:00.900\nHafen\n\n00:00:00.900 --> 00:00:01.200\nist\n\n00:00:01.200 --> 00:00:01.800\nklein\n'

test('una editora publica una lectura nueva con audio y preguntas contra el backend', async ({ page }) => {
  test.skip(!PASSWORD, 'LESEN_PASSWORD sin poner')
  const slug = `der-kleine-hafen-${Date.now().toString(36)}`
  await page.goto('/login')
  await page.getByLabel(/correo|email/i).fill(EMAIL)
  await page.getByLabel(/contraseña|password/i).fill(PASSWORD)
  await page.getByRole('button', { name: /entrar|iniciar|sign in|log in/i }).click()
  // sin cuaderno, el inicio es el estudio
  await page.waitForURL(/\/studio$/)
  await page.getByLabel('Título', { exact: true }).fill('Der kleine Hafen')
  await page.getByLabel('Slug').fill(slug)
  await page.getByRole('region', { name: 'Nueva lectura' }).getByLabel('Idioma de la lectura').selectOption('de')
  await page.getByRole('button', { name: 'Crear borrador' }).click()
  await page.waitForURL(/\/studio\/drafts\//)

  await page.getByLabel('Resumen').fill('Ein kleiner Hafen am Meer.')
  await page.getByRole('button', { name: 'Naturaleza', exact: true }).click()
  await page.getByRole('tab', { name: 'Texto y traducciones' }).click()
  await page.getByRole('textbox', { name: 'Oración p1s1' }).fill('Der Hafen ist klein.')
  await page.getByLabel('Traducción al español').first().fill('El puerto es pequeño.')
  await page.getByLabel('Traducción al inglés').first().fill('The harbour is small.')
  await page.getByLabel('Traducción del párrafo al español').fill('El puerto es pequeño.')
  await page.getByLabel('Traducción del párrafo al inglés').fill('The harbour is small.')
  await page.getByRole('tab', { name: 'Preguntas' }).click()
  await page.getByLabel('Tipo').selectOption('TRUE_FALSE')
  await page.getByRole('button', { name: 'Añadir pregunta' }).click()
  const question = page.getByRole('region', { name: 'Pregunta q1' })
  await question.getByLabel('Enunciado (español)').fill('El puerto es pequeño.')
  await question.getByLabel('Enunciado (inglés)').fill('The harbour is small.')
  await question.getByLabel('Explicación (español)').fill('Lo dice la oración.')
  await question.getByLabel('Explicación (inglés)').fill('The sentence says so.')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Guardado.')).toBeVisible()

  // el audio, casado por el servidor con las cuatro palabras
  await page.getByRole('tab', { name: 'Audio' }).click()
  await page.getByLabel('Archivo de audio (mp3, ogg o m4a)').setInputFiles({ name: 'hafen.mp3', mimeType: 'audio/mpeg', buffer: MP3 })
  await page.getByLabel('Archivo de tiempos (.vtt, .srt o .json)').setInputFiles({ name: 'hafen.vtt', mimeType: 'text/vtt', buffer: Buffer.from(VTT) })
  await page.getByLabel('Quién lee').fill('Ana Pérez')
  await page.getByLabel('Derechos y licencia').fill('Grabación propia')
  await page.getByRole('button', { name: 'Subir audio' }).click()
  await expect(page.getByText('4/4 palabras con tiempo')).toBeVisible()

  await page.getByRole('tab', { name: 'Revisión' }).click()
  await expect(page.getByText('Lista para revisión y publicación')).toBeVisible()
  await page.getByRole('button', { name: 'Enviar a revisión' }).click()
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByText('Publicado como versión 1.')).toBeVisible()

  // su historial dice quién la publicó
  await page.getByRole('link', { name: 'Volver al estudio' }).click()
  await page
    .getByRole('link', { name: new RegExp(`Historial\\s*: Der kleine Hafen`) })
    .first()
    .click()
  await expect(page.getByText(EMAIL).first()).toBeVisible()
})
