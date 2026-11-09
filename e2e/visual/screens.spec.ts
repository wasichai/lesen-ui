import { expect, test } from '@playwright/test'
import { fakeApi } from '../api'

const VIEWPORTS = { small: 360, phone: 390, tablet: 768, laptop: 1024, desktop: 1440, wide: 1920 } as const
const chosen = (process.env.VISUAL_VIEWPORTS?.split(',') ?? Object.keys(VIEWPORTS)) as (keyof typeof VIEWPORTS)[]
const SCREENS = [
  { name: 'onboarding', path: '/welcome', profile: null },
  { name: 'discover', path: '/discover' },
  { name: 'explore', path: '/explore' },
  { name: 'detail', path: '/readings/der-alte-leuchtturm' },
  { name: 'reader', path: '/read/der-alte-leuchtturm' },
  { name: 'library', path: '/library' },
  { name: 'vocabulary', path: '/vocabulary' },
  { name: 'dictionary', path: '/dictionary?q=Meer' },
  { name: 'profile', path: '/profile' }
]

for (const viewport of chosen)
  for (const screen of SCREENS)
    test(`${screen.name} @ ${viewport}`, async ({ page }) => {
      await page.setViewportSize({ width: VIEWPORTS[viewport], height: 900 })
      if (process.env.VISUAL_DARK) await page.emulateMedia({ colorScheme: 'dark' })
      await fakeApi(page, { profile: screen.profile })
      await page.goto(screen.path)
      await page.locator('main, form').first().waitFor()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(`${screen.name}-${viewport}${process.env.VISUAL_DARK ? '-dark' : ''}.png`, { fullPage: true, animations: 'disabled' })
    })
