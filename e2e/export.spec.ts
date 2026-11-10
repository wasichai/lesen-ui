import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { fakeApi } from './api'

// exportar una lectura (ADR-0015 del backend): desde la ficha baja un ePub con lo elegido; desde el lector se imprime
test('desde la ficha se descarga el ePub con lo que se eligió', async ({ page }) => {
  const api = await fakeApi(page)
  await page.goto('/readings/der-alte-leuchtturm')
  await page.getByRole('button', { name: 'Exportar' }).click()
  const sheet = page.getByRole('dialog', { name: 'Exportar la lectura' })
  await sheet.getByRole('checkbox', { name: /Mis notas/ }).check()
  const download = page.waitForEvent('download')
  await sheet.getByRole('button', { name: 'Descargar ePub' }).click()
  expect((await download).suggestedFilename()).toBe('der-alte-leuchtturm-v1.epub')
  await expect(sheet.getByText('Listo: el ePub está en tus descargas.')).toBeVisible()
  expect(api.requests).toContain('GET /api/lesen/readings/der-alte-leuchtturm/versions/1/export')
})

test('desde el lector se prepara la página para imprimir o guardar como PDF', async ({ page }) => {
  const api = await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  await page.locator('[data-token="p1s1t1"]').waitFor()
  await page.getByRole('toolbar').getByRole('button', { name: 'Exportar' }).click()
  const sheet = page.getByRole('dialog', { name: 'Exportar la lectura' })
  // la página se imprime en un marco oculto, que se quita al cerrar el diálogo de impresión
  const framed = page.waitForEvent('frameattached')
  await sheet.getByRole('button', { name: 'Imprimir o guardar como PDF' }).click()
  await framed
  await expect(sheet.getByText('Listo: elige «Guardar como PDF» en el diálogo de impresión.')).toBeVisible()
  expect(api.requests.filter((r) => r.endsWith('/export'))).toHaveLength(1)
})

test('la hoja de exportar no tiene problemas de accesibilidad', async ({ page }) => {
  // sin la entrada animada de la hoja: axe mediría el contraste a media transparencia
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await fakeApi(page)
  await page.goto('/readings/der-alte-leuchtturm')
  await page.getByRole('button', { name: 'Exportar' }).click()
  await page.getByRole('dialog', { name: 'Exportar la lectura' }).waitFor()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
})
