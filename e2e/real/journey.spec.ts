import { expect, test } from '@playwright/test'

// humo contra el backend de verdad (E2E_REAL=1, vite preview con WASICHAI_API_URL), con el contenido de demostración y las
// personas de model/apply.py --demo. LESEN_EMAIL y LESEN_PASSWORD eligen quién entra (por defecto, Lena)
const EMAIL = process.env.LESEN_EMAIL ?? 'lena@demo.lesen.test'
const PASSWORD = process.env.LESEN_PASSWORD ?? ''

test('leer, escuchar, consultar y guardar una palabra contra el backend', async ({ page }) => {
  test.skip(!PASSWORD, 'LESEN_PASSWORD sin poner')
  await page.goto('/login')
  await page.getByLabel(/correo|email/i).fill(EMAIL)
  await page.getByLabel(/contraseña|password/i).fill(PASSWORD)
  await page.getByRole('button', { name: /entrar|iniciar|sign in|log in/i }).click()
  await page.waitForURL(/\/(discover|welcome)/)
  // una cuenta recién creada (la de CI) no tiene perfil: el marco la lleva al onboarding, que se completa como cualquier persona.
  // tras el login se llega primero a /discover y la redirección llega cuando responde el perfil: hasta entonces no hay h1
  await page.locator('h1').first().waitFor()
  if (page.url().includes('/welcome')) {
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByText('alemán', { exact: true }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByText('A2 · Básico').click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('button', { name: 'Empezar a leer' }).click()
    await page.waitForURL(/\/discover/)
  }
  await page.goto('/read/der-alte-leuchtturm')
  // la narración de demostración suena y marca la palabra que se oye
  const audio = page.getByRole('region', { name: 'Audio de la lectura' })
  await audio.getByRole('button', { name: 'Escuchar' }).click()
  await expect(page.locator('.word[data-playing="true"]')).toHaveCount(1)
  await audio.getByRole('button', { name: 'Pausar' }).click()
  const word = page.locator('[data-token="p1s1t2"]')
  await word.click()
  await expect(page.getByRole('dialog').getByText('verbringen').first()).toBeVisible()
  const save = page.getByRole('button', { name: /Guardar en mi vocabulario|En tu vocabulario/ })
  if (await save.isEnabled()) await save.click()
  await expect(page.getByRole('button', { name: 'En tu vocabulario' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.goto('/vocabulary')
  await expect(page.getByRole('heading', { name: 'verbringen' })).toBeVisible()
})
