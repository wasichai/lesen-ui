import { expect, test } from '@playwright/test'
import { fakeApi } from './api'

// la identidad visual se elige en el perfil, se guarda en el navegador y sobrevive a una recarga; Musgo por defecto
test('Musgo por defecto; elegir otra identidad en el perfil la aplica y la guarda', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/profile')
  const root = page.locator('html')
  await expect(root).toHaveAttribute('data-direction', 'musgo')
  const identity = page.getByRole('group', { name: 'Identidad' })
  await expect(identity.getByRole('button', { name: /Musgo/ })).toHaveAttribute('aria-pressed', 'true')

  await identity.getByRole('button', { name: /Gaceta/ }).click()
  await expect(root).toHaveAttribute('data-direction', 'gaceta')
  await expect(identity.getByRole('button', { name: /Gaceta/ })).toHaveAttribute('aria-pressed', 'true')

  await page.reload()
  await expect(root).toHaveAttribute('data-direction', 'gaceta')
  await expect(page.getByRole('group', { name: 'Identidad' }).getByRole('button', { name: /Gaceta/ })).toHaveAttribute('aria-pressed', 'true')

  // Papel y tinta, la clásica: la de lesen.css, sin atributo
  await page
    .getByRole('group', { name: 'Identidad' })
    .getByRole('button', { name: /Papel y tinta/ })
    .click()
  await expect(root).not.toHaveAttribute('data-direction')
  await page.reload()
  await expect(root).not.toHaveAttribute('data-direction')
})
