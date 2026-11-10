import { expect, test, type Page } from '@playwright/test'
import { fakeApi } from '../api'

const VIEWPORTS = { small: 360, phone: 390, tablet: 768, laptop: 1024, desktop: 1440, wide: 1920 } as const
const chosen = (process.env.VISUAL_VIEWPORTS?.split(',') ?? Object.keys(VIEWPORTS)) as (keyof typeof VIEWPORTS)[]
// VISUAL_DIRECTION=gaceta (o pulso, atlas, papel) pinta las pantallas con otra identidad del perfil; sin ella, la de por
// defecto (Musgo). Las capturas de Papel y tinta no llevan sufijo: son las de antes de que hubiera identidades
const direction = process.env.VISUAL_DIRECTION ?? 'musgo'
const dark = Boolean(process.env.VISUAL_DARK)

interface Screen {
  name: string
  path: string
  profile?: null
  reader?: 'light' | 'sepia' | 'dark'
  // lo que se hace antes de la captura: abrir el vistazo de una palabra
  act?: (page: Page) => Promise<void>
}

const SCREENS: Screen[] = [
  { name: 'onboarding', path: '/welcome', profile: null },
  { name: 'discover', path: '/discover' },
  { name: 'explore', path: '/explore' },
  { name: 'detail', path: '/readings/der-alte-leuchtturm' },
  { name: 'reader', path: '/read/der-alte-leuchtturm' },
  { name: 'reader-sepia', path: '/read/der-alte-leuchtturm', reader: 'sepia' },
  { name: 'reader-dark', path: '/read/der-alte-leuchtturm', reader: 'dark' },
  {
    name: 'reader-word',
    path: '/read/der-alte-leuchtturm',
    act: async (page) => {
      await page.locator('[data-token="p1s1t2"]').hover()
      await page.getByRole('dialog', { name: 'La palabra «verbringt»' }).getByText('pasar (tiempo)').waitFor()
    }
  },
  { name: 'library', path: '/library' },
  { name: 'vocabulary', path: '/vocabulary' },
  { name: 'dictionary', path: '/dictionary?q=Meer' },
  { name: 'progress', path: '/progress' },
  { name: 'week', path: '/progress/week' },
  { name: 'profile', path: '/profile' }
]

const suffix = `${direction === 'papel' ? '' : `-${direction}`}${dark ? '-dark' : ''}`

for (const viewport of chosen)
  for (const screen of SCREENS)
    test(`${screen.name} @ ${viewport}`, async ({ page }) => {
      await page.setViewportSize({ width: VIEWPORTS[viewport], height: 900 })
      if (dark) await page.emulateMedia({ colorScheme: 'dark' })
      await page.addInitScript(
        ({ reader, direction }) => {
          if (reader) localStorage.setItem('lesen.reader', JSON.stringify({ theme: reader }))
          localStorage.setItem('lesen.direction', direction)
        },
        { reader: screen.reader, direction }
      )
      // el saludo y las semanas dependen de la hora: un reloj fijo hace las capturas repetibles
      await page.clock.setFixedTime(new Date('2026-11-10T09:00:00+01:00'))
      await fakeApi(page, { profile: screen.profile })
      await page.goto(screen.path)
      await page.locator('main, form').first().waitFor()
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => document.fonts.ready)
      if (screen.act) await screen.act(page)
      await expect(page).toHaveScreenshot(`${screen.name}-${viewport}${suffix}.png`, { fullPage: !screen.act, animations: 'disabled' })
    })
