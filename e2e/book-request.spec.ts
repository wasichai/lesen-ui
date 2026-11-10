import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { fakeApi } from './api'

// una lectura a medida (ADR-0016 del backend): quien lee pide un libro ilustrado desde Descubrir, sigue su avance, lo lee
// y lo encuentra en Mis lecturas; la cuota se dice y, agotada, no se puede pedir
test('quien lee pide un libro ilustrado escrito a su medida y lo lee', async ({ page }) => {
  const api = await fakeApi(page)
  await page.goto('/discover')
  await page.getByRole('link', { name: /Pide una lectura escrita para ti/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Pide tu lectura' })).toBeVisible()
  await expect(page.getByTestId('quota')).toHaveText('Te quedan 3 para hoy y 4 libros ilustrados este mes.')
  // el perfil propone el idioma, el nivel (A2: un libro) y el largo
  await expect(page.getByRole('button', { name: 'Libro ilustrado' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByLabel('Nivel')).toHaveValue('A2')
  await page.getByLabel('Tu idea (opcional)').fill('  Ein Sonntag bei Oma  ')

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map((v) => v.id)).toEqual([])

  await page.getByRole('button', { name: 'Pedir', exact: true }).click()
  expect(api.mine[0]).toMatchObject({ request: { language: 'de', level: 'A2', format: 'PICTURE_BOOK', prompt: 'Ein Sonntag bei Oma' } })
  const progress = page.getByTestId('commission')
  await expect(progress.getByText(/ilustraciones dibujadas/)).toBeVisible({ timeout: 15_000 })
  await progress.getByRole('link', { name: 'Leer ahora' }).click()
  await expect(page.getByRole('region', { name: 'Libro ilustrado' })).toBeVisible()

  // en Mis lecturas, con lo demás
  await page.goto('/library')
  const custom = page.getByRole('region', { name: 'Mis lecturas a medida' })
  await expect(custom.getByRole('link', { name: 'Ein Sonntag bei Oma' })).toBeVisible()
})

test('sin cuota no se puede pedir, y se dice', async ({ page }) => {
  const api = await fakeApi(page)
  api.quota = { dailyLimit: 3, dailyUsed: 3, monthlyBooksLimit: 4, monthlyBooksUsed: 0, resetsAt: '2026-11-11T00:00:00Z' }
  await page.goto('/request')
  await expect(page.getByTestId('quota')).toContainText('Te quedan 0 para hoy')
  await expect(page.getByTestId('quota')).toContainText('Vuelve a haber el')
  await expect(page.getByRole('button', { name: 'Pedir', exact: true })).toBeDisabled()
  await expect(page.getByText('No te quedan lecturas por ahora.')).toBeVisible()
})
