import { expect, test } from '@playwright/test'
import { fakeApi } from './api'
import { horizontalOverflow } from './overflow'

// sin desplazamiento horizontal en ningún ancho de referencia (docs/product/requirements.md, RNF)
const WIDTHS = [360, 390, 768, 1024, 1440, 1920]
const PAGES = [
  '/welcome',
  '/discover',
  '/explore',
  '/readings/der-alte-leuchtturm',
  '/read/der-alte-leuchtturm',
  '/library',
  '/vocabulary',
  '/read/der-alte-leuchtturm/questions',
  '/vocabulary/review',
  '/dictionary?q=Meer',
  '/progress',
  '/progress/week',
  '/profile'
]

for (const width of WIDTHS) {
  test(`nada se sale por la derecha a ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of PAGES) {
      await fakeApi(page, { profile: path === '/welcome' ? null : undefined })
      await page.goto(path)
      await page.locator('main, form').first().waitFor()
      await page.waitForLoadState('networkidle')
      const overflow = await horizontalOverflow(page)
      expect.soft(overflow.wider, `${path} a ${width}px`).toEqual([])
      expect.soft(overflow.scrollWidth, `${path} a ${width}px`).toBeLessThanOrEqual(overflow.clientWidth)
      await page.unrouteAll({ behavior: 'ignoreErrors' })
    }
  })
}

test('los controles del móvil miden al menos 44 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await fakeApi(page)
  await page.goto('/discover')
  await page.getByRole('heading', { name: 'Para ti' }).waitFor()
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('nav a, header button, main button')]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0 && r.height < 44)
      .map((r) => Math.round(r.height))
  )
  expect(small).toEqual([])
})
