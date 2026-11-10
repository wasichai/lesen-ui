import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { fakeApi } from './api'

// el libro ilustrado de la demostración (ADR-0014 del backend): página a página, con su maqueta y sus ilustraciones, y las
// mismas palabras, traducciones y posición que un texto
const BOOK = '/read/ein-sonntag-bei-oma'

test('un libro ilustrado se lee página a página y recuerda dónde se quedó', async ({ page }) => {
  const api = await fakeApi(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/explore?format=PICTURE_BOOK&language=all')
  await expect(page.getByRole('heading', { name: '1 lectura' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Ein Sonntag bei Oma/ }).getByText('Libro ilustrado')).toBeVisible()

  await page.goto(BOOK)
  const book = page.getByRole('region', { name: 'Libro ilustrado' })
  // en escritorio, la primera vista lleva la página 1 sola (la siguiente es doble)
  await expect(book.getByTestId('book-page')).toHaveText('Página 1 de 7')
  await expect(book.getByRole('img', { name: /Lena baja de un autobús amarillo/ })).toBeVisible()
  await expect(page.locator('[data-page="g1"]')).toHaveAttribute('data-layout', 'IMAGE_TOP')

  // una palabra de la página abre su hoja, como en un texto
  await page.locator('[data-token="p1s1t3"]').click()
  await expect(page.getByRole('dialog', { name: 'La palabra «Sonntag»' })).toBeVisible()
  await page.keyboard.press('Escape')

  // la siguiente vista es una doble página con la ilustración a la izquierda
  await book.getByRole('button', { name: 'Siguiente' }).click()
  await expect(book.getByTestId('book-page')).toHaveText('Páginas 2 y 3 de 7')
  await expect(page.locator('[data-page="g2"]')).toHaveAttribute('data-layout', 'SPREAD_IMAGE_LEFT')
  await expect(page.locator('[data-page="g1"]')).toBeHidden()
  await expect.poll(() => api.progress.get('ein-sonntag-bei-oma')?.position ?? null).toBe('p2s1')

  // las flechas del teclado pasan de página cuando la palabra siguiente está en otra
  await page.locator('[data-token="p2s3t5"]').focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('[data-page="g3"]')).toBeVisible()
  await expect(page.locator('[data-token="p3s1t1"]')).toBeFocused()

  // una página sin texto es una pausa; el final ofrece terminar
  await book.getByRole('button', { name: 'Siguiente' }).click()
  await expect(page.locator('[data-page="g5"]')).toHaveAttribute('data-layout', 'PANORAMA')
  await expect(book.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Terminé de leer' })).toBeVisible()

  // al volver, abre en la página guardada
  await expect.poll(() => api.progress.get('ein-sonntag-bei-oma')?.position ?? null).toBe('p4s1')
  await page.reload()
  await expect(page.locator('[data-page="g5"]')).toBeVisible()
})

test('en el móvil va una página por vista y se pasa deslizando', async ({ page }) => {
  await fakeApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(BOOK)
  const book = page.getByRole('region', { name: 'Libro ilustrado' })
  await expect(book.getByTestId('book-page')).toHaveText('Página 1 de 7')
  const box = (await page.locator('[data-page="g1"]').boundingBox())!
  await page.locator('[data-page="g1"]').dispatchEvent('touchstart', { touches: [{ identifier: 0, clientX: box.x + 300, clientY: box.y + 100 }] })
  await page.locator('[data-page="g1"]').dispatchEvent('touchend', { changedTouches: [{ identifier: 0, clientX: box.x + 40, clientY: box.y + 110 }] })
  await expect(book.getByTestId('book-page')).toHaveText('Páginas 2 y 3 de 7')
  await expect(page.locator('[data-page="g2"]')).toBeInViewport({ ratio: 0.2 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

for (const width of [390, 1280]) {
  test(`el libro a ${width} px no tiene problemas de accesibilidad`, async ({ page }) => {
    await fakeApi(page)
    await page.setViewportSize({ width, height: 900 })
    await page.goto(BOOK)
    await page.getByRole('region', { name: 'Libro ilustrado' }).waitFor()
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
  })
}
