import { expect, test } from '@playwright/test'
import { fakeApi } from './api'

// fase 5: lo que se hace (leer, terminar, guardar una palabra) llega al panel, cada cifra dice si es medida o estimada y
// ningún texto castiga un día sin leer; las metas en el perfil, el resumen semanal y las listas propias
test('leer, terminar y guardar una palabra se ve en el panel de progreso', async ({ page }) => {
  const api = await fakeApi(page)

  // antes de nada: un panel vacío y amable
  await page.goto('/progress')
  await expect(page.getByRole('heading', { level: 1, name: 'Tu progreso' })).toBeVisible()
  await expect(page.getByText('Hoy aún no has leído. Cuando quieras, aquí estará.')).toBeVisible()
  await expect(page.getByText('Lee 3 días esta semana y empiezas una racha. Los demás son de descanso.')).toBeVisible()
  // la primera vez, los días se cuentan en la zona del dispositivo
  await expect.poll(() => api.goals).toMatchObject({ configured: true, timeZone: 'Europe/Madrid' })

  // leer un rato, guardar una palabra y terminar
  await page.goto('/read/der-alte-leuchtturm')
  const word = page.locator('[data-token="p1s1t2"]')
  await word.click()
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar en mi vocabulario' }).click()
  await expect(page.getByRole('dialog').getByRole('button', { name: 'En tu vocabulario' })).toBeDisabled()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Terminé de leer' }).click()
  await expect(page.getByRole('heading', { name: '¡Lectura terminada!' })).toBeVisible()
  expect(api.activity.map((a) => a.type)).toEqual(expect.arrayContaining(['READING_STARTED', 'WORD_SAVED', 'READING_COMPLETED']))

  await page.goto('/progress')
  const reading = page.getByRole('region', { name: 'Lectura' })
  const finished = reading
    .locator('div')
    .filter({ has: page.getByText('Lecturas terminadas', { exact: true }) })
    .last()
  await expect(finished).toContainText('1')
  await expect(finished).toContainText('medido')
  const words = reading
    .locator('div')
    .filter({ has: page.getByText('Palabras leídas', { exact: true }) })
    .last()
  await expect(words).toContainText('≈')
  await expect(words).toContainText('estimado')
  const vocabulary = page.getByRole('region', { name: 'Vocabulario' })
  await expect(
    vocabulary
      .locator('div')
      .filter({ has: page.getByText('Guardadas', { exact: true }) })
      .last()
  ).toContainText('1')
  // el nivel siempre es una estimación
  await expect(page.getByRole('region', { name: 'Tu nivel' })).toContainText('estimado')
  // el logro de la primera lectura, conseguido
  await expect(page.getByRole('region', { name: 'Logros' }).getByText('Primera lectura terminada')).toBeVisible()
  await expect(
    page
      .getByRole('region', { name: 'Logros' })
      .getByText(/^Conseguido el/)
      .first()
  ).toBeVisible()
  // ningún mensaje de culpa
  await expect(page.locator('main')).not.toContainText(/perdiste|fallaste|rompiste/i)

  // el resumen de la semana, y la anterior
  await page.getByRole('link', { name: 'Ver el resumen de la semana' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Resumen semanal' })).toBeVisible()
  await expect(page.getByText(/^Esta semana ·/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Semana siguiente' })).toBeDisabled()
  await page.getByRole('button', { name: 'Semana anterior' }).click()
  await expect(page.getByText('Una semana tranquila. Cada semana empieza de nuevo.')).toBeVisible()
  await expect(page).toHaveURL(/week=\d{4}-\d{2}-\d{2}/)
  expect(api.unexpected).toEqual([])
})

test('las metas se cambian en el perfil y el resumen semanal aparece en Descubrir', async ({ page }) => {
  const api = await fakeApi(page)
  await page.goto('/profile')
  await page.getByRole('radio', { name: '5 días' }).click()
  await page.getByRole('checkbox', { name: 'Mostrarme el resumen de la semana al abrir la app' }).check()
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Cambios guardados.')).toBeVisible()
  expect(api.goals).toMatchObject({ weeklyDays: 5, weeklySummary: true, configured: true })

  await page.goto('/discover')
  const glance = page.getByRole('complementary', { name: 'Tu semana' })
  await expect(glance.getByText('Una semana nueva para leer a tu ritmo.')).toBeVisible()
  await glance.getByRole('link', { name: 'Ver el resumen' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Resumen semanal' })).toBeVisible()
  expect(api.unexpected).toEqual([])
})

test('una lista propia se crea desde la ficha y se gestiona en Mis lecturas', async ({ page }) => {
  const api = await fakeApi(page)
  await page.goto('/readings/der-alte-leuchtturm')
  await page.getByRole('button', { name: 'Añadir a una lista' }).click()
  const sheet = page.getByRole('dialog', { name: 'Tus listas' })
  await expect(sheet.getByText('Aún no tienes listas. Crea una para guardar esta lectura.')).toBeVisible()
  await sheet.getByLabel('Nombre de la lista nueva').fill('Para el viaje')
  await sheet.getByRole('button', { name: 'Crear y añadir' }).click()
  await expect(sheet.getByRole('checkbox', { name: 'Para el viaje' })).toBeChecked()
  expect(api.lists[0]).toMatchObject({ name: 'Para el viaje', slugs: ['der-alte-leuchtturm'] })
  // el mismo nombre otra vez no
  await sheet.getByLabel('Nombre de la lista nueva').fill('para el viaje')
  await sheet.getByRole('button', { name: 'Crear y añadir' }).click()
  await expect(sheet.getByText('Ya tienes una lista con ese nombre.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'En 1 lista' })).toBeVisible()

  await page.goto('/library?tab=lists')
  await page.getByRole('link', { name: /Para el viaje/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Para el viaje' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Der alte Leuchtturm/ })).toBeVisible()
  await page.getByRole('button', { name: 'Cambiar el nombre' }).click()
  await page.getByLabel('Cambiar el nombre').fill('Verano')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Verano' })).toBeVisible()
  await page.getByRole('button', { name: 'Quitar «Der alte Leuchtturm» de la lista' }).click()
  await expect(page.getByText('Esta lista está vacía')).toBeVisible()
  await page.getByRole('button', { name: 'Borrar la lista' }).click()
  await page.getByRole('alert').getByRole('button', { name: 'Borrar la lista' }).click()
  await expect(page).toHaveURL(/\/library\?tab=lists/)
  await expect(page.getByText('Aún no tienes listas')).toBeVisible()
  expect(api.lists).toEqual([])
  expect(api.unexpected).toEqual([])
})
