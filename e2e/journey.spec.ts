import { expect, test } from '@playwright/test'
import { fakeApi } from './api'

// el recorrido de la primera entrega (fases 0–2), de punta a punta: onboarding → catálogo filtrado → lector → palabra en
// contexto → guardarla → traducir la oración → posición restaurada → terminar → biblioteca → cuaderno → diccionario
test('una persona nueva lee su primera historia y se lleva una palabra', async ({ page }) => {
  const api = await fakeApi(page, { profile: null })
  await page.goto('/discover')

  // sin perfil, el onboarding
  await expect(page).toHaveURL(/\/welcome/)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByText('alemán', { exact: true }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByText('A2 · Básico').click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: 'Viajar' }).click()
  await page.getByRole('button', { name: 'Viajes' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: 'Empezar a leer' }).click()
  await expect(page).toHaveURL(/\/discover/)
  expect(api.profile).toMatchObject({ interfaceLanguage: 'es', targetLanguage: 'de', level: 'A2', goals: ['TRAVEL'], topics: ['travel'] })
  await expect(page.getByRole('heading', { name: 'Para ti' })).toBeVisible()

  // el catálogo filtrado por idioma, nivel y tema, en la URL
  await page.goto('/explore?level=A2&topic=travel')
  await expect(page.getByRole('heading', { name: '1 lectura' })).toBeVisible()
  await page.getByRole('link', { name: /Der alte Leuchtturm/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Der alte Leuchtturm' })).toBeVisible()
  await page.getByRole('link', { name: 'Empezar a leer' }).click()

  // el lector: vistazo al pasar el cursor, hoja al hacer clic
  await expect(page).toHaveURL(/\/read\/der-alte-leuchtturm/)
  const word = page.locator('[data-token="p1s1t2"]')
  await word.hover()
  const preview = page.getByRole('dialog', { name: 'La palabra «verbringt»' })
  await expect(preview.getByText('pasar (tiempo)')).toBeVisible()
  await word.click()
  const sheet = page.getByRole('dialog', { name: 'La palabra «verbringt»' })
  await expect(sheet.getByText('«verbringt» es una forma de «verbringen».')).toBeVisible()
  await sheet.getByRole('button', { name: 'Guardar en mi vocabulario' }).click()
  await expect(sheet.getByRole('button', { name: 'En tu vocabulario' })).toBeDisabled()
  await sheet.getByRole('button', { name: 'Traducir la oración' }).click()
  await expect(sheet.getByText('Mia pasa el verano con su abuelo junto al mar del Norte.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(word).toHaveAttribute('data-saved', 'true')
  await expect(word).toBeFocused()

  // la traducción de un párrafo, a petición y debajo de él
  await page.getByRole('button', { name: 'Traducir el párrafo' }).first().click()
  await expect(page.getByText(/^Mia pasa el verano con su abuelo/).last()).toBeVisible()

  // la posición se guarda y vuelve al recargar
  await page.locator('#p4s1').scrollIntoViewIfNeeded()
  await expect.poll(() => api.progress.get('der-alte-leuchtturm')?.position ?? null).not.toBeNull()
  const saved = api.progress.get('der-alte-leuchtturm')!.position!
  await page.reload()
  await expect(page.locator(`#${saved}`)).toBeInViewport()

  // terminar
  await page.getByRole('button', { name: 'Terminé de leer' }).click()
  await expect(page.getByRole('heading', { name: '¡Lectura terminada!' })).toBeVisible()
  expect(api.progress.get('der-alte-leuchtturm')?.completedAt).not.toBeNull()

  // la biblioteca y el cuaderno
  await page.goto('/library?tab=completed')
  await expect(page.getByRole('link', { name: /Der alte Leuchtturm/ })).toBeVisible()
  await page.goto('/vocabulary')
  await expect(page.getByRole('heading', { name: 'verbringen' })).toBeVisible()
  await expect(page.getByText('Mia verbringt den Sommer', { exact: false })).toBeVisible()

  // el diccionario, desde el español
  await page.goto('/dictionary?q=pasar')
  await expect(page.getByRole('link', { name: /verbringen/ }).first()).toBeVisible()
  expect(api.unexpected).toEqual([])
})

test('la palabra se abre y se recorre solo con el teclado', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  const first = page.locator('[data-token="p1s1t1"]')
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('[data-token="p1s1t2"]')).toBeFocused()
  await page.keyboard.press('Enter')
  const sheet = page.getByRole('dialog', { name: 'La palabra «verbringt»' })
  await expect(sheet.getByText('pasar (tiempo)')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(page.locator('[data-token="p1s1t2"]')).toBeFocused()
})

test('en el móvil la palabra sube en una hoja y el tema de lectura cambia', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await fakeApi(page)
  await page.goto('/read/der-fuchs-im-garten')
  await page.locator('[data-token="p1s1t1"]').click()
  const sheet = page.getByRole('dialog').last()
  await expect(sheet).toBeVisible()
  const box = await sheet.boundingBox()
  expect(box!.y + box!.height).toBeGreaterThan(800)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Texto y ayudas' }).click()
  await page.getByRole('button', { name: 'Sepia' }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-theme="lesen-reader-sepia"]').first()).toBeVisible()
})

test('una palabra sin entrada lo dice y nada se inventa', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  // la última palabra del texto no está entre las capturadas (solo el primer párrafo): el backend respondería igual
  const last = page.locator('[data-token]').last()
  await last.click()
  await expect(page.getByText('Todavía no tenemos esta palabra en el diccionario.')).toBeVisible()
})
