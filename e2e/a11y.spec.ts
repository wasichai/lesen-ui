import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { fakeApi, seedDraft } from './api'

// WCAG 2.2 AA con axe en las pantallas principales, en claro y en los tres temas del lector, con la identidad por defecto
// (Musgo). A11Y_DIRECTION=gaceta (o pulso, atlas, papel) repite la revisión con otra identidad del perfil, y A11Y_DARK=1
// con la página oscura
const direction = process.env.A11Y_DIRECTION
test.beforeEach(async ({ page }) => {
  if (process.env.A11Y_DARK) await page.emulateMedia({ colorScheme: 'dark' })
  if (direction) await page.addInitScript((d) => localStorage.setItem('lesen.direction', d), direction)
})
const PAGES = [
  '/welcome',
  '/discover',
  '/explore',
  '/readings/der-alte-leuchtturm',
  '/read/der-alte-leuchtturm',
  '/library',
  '/vocabulary',
  '/dictionary',
  '/progress',
  '/progress/week',
  '/profile',
  '/studio',
  '/studio/drafts/draft-seed',
  '/studio/drafts/draft-seed?tab=text',
  '/studio/drafts/draft-seed?tab=questions',
  '/studio/drafts/draft-seed?tab=audio',
  '/studio/drafts/draft-seed?tab=review',
  '/studio/readings/der-alte-leuchtturm'
]

for (const path of PAGES) {
  test(`${path} no tiene problemas de accesibilidad`, async ({ page }) => {
    const api = await fakeApi(page, { profile: path === '/welcome' ? null : undefined, as: path.startsWith('/studio') ? 'editor' : 'learner' })
    seedDraft(api)
    await page.goto(path)
    await page.locator('main, form').first().waitFor()
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
  })
}

for (const theme of ['light', 'sepia', 'dark']) {
  test(`el lector en tema ${theme} cumple el contraste`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('lesen.reader', JSON.stringify({ theme: t })), theme)
    await fakeApi(page)
    await page.goto('/read/der-alte-leuchtturm')
    await page.locator('[data-token="p1s1t1"]').waitFor()
    const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).withRules(['color-contrast']).analyze()
    expect(results.violations.map((v) => v.nodes.map((n) => n.target.join(' ')).join(', '))).toEqual([])
  })
}
