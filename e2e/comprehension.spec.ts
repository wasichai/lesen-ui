import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { fakeApi } from './api'

// fase 4 de punta a punta con la API simulada: terminar una lectura → responder sus preguntas (los diez tipos se
// reparten en siete formas) → ver los resultados y valorar la abierta → repasar una palabra y ver su nueva fecha
const axe = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
}

test('terminar, responder las preguntas y entender los resultados', async ({ page }) => {
  const api = await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  await page.getByRole('button', { name: 'Terminé de leer' }).click()
  await page.getByRole('link', { name: /Comprueba lo que entendiste \(7 preguntas\)/ }).click()
  await expect(page).toHaveURL(/\/read\/der-alte-leuchtturm\/questions\?version=1/)
  await expect(page.getByRole('heading', { level: 1, name: 'Comprueba lo que entendiste' })).toBeVisible()
  await axe(page)
  await page.getByRole('button', { name: 'Empezar' }).click()

  // 1 · detalle (una respuesta)
  await expect(page.getByText('Pregunta 1 de 7')).toBeVisible()
  await expect(page.getByRole('heading', { level: 2 })).toBeFocused()
  await page.getByLabel('Porque la lámpara funciona automáticamente').check()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  // 2 · verdadero o falso
  await page.getByLabel('Verdadero').check()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  // 3 · vocabulario en contexto, con la palabra del texto marcada en su idioma
  await expect(page.locator('[lang="de"]', { hasText: 'Schlüssel' }).first()).toBeVisible()
  await page.getByLabel('una llave').check()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  // 4 · completar: un hueco a mano y otro desde el banco de palabras
  await page.getByLabel('Hueco 1').fill('zählt')
  await page.getByRole('button', { name: 'Poner «Stufen» en el primer hueco libre' }).click()
  await expect(page.getByLabel('Hueco 2')).toHaveValue('Stufen')
  await axe(page)
  await page.getByRole('button', { name: 'Siguiente' }).click()
  // 5 · emparejar con desplegables
  for (const [word, meaning] of [
    ['Leuchtturm', 'el faro'],
    ['Treppe', 'la escalera'],
    ['Schalter', 'el interruptor'],
    ['Hafen', 'el puerto']
  ])
    await page.getByLabel(`Significado de «${word}»`).selectOption({ label: meaning })
  await page.getByRole('button', { name: 'Siguiente' }).click()
  // 6 · ordenar solo con botones (también con teclado)
  await page.getByRole('button', { name: 'Subir «Mia y su abuelo suben la escalera.»' }).click()
  await page.getByRole('button', { name: 'Subir «Mia y su abuelo suben la escalera.»' }).click()
  await page.getByRole('button', { name: 'Subir «Mia pulsa el interruptor rojo.»' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('form ol li')).toHaveText([/suben la escalera/, /Se apaga la luz/, /pulsa el interruptor/, /Ven un barco/])
  await page.getByRole('button', { name: 'Siguiente' }).click()
  // 7 · respuesta corta, en el idioma de la persona
  await page.getByLabel('Tu respuesta').fill('Porque ella encendió la luz y el barco llegó bien.')
  await page.getByRole('button', { name: 'Ver resultados' }).click()

  await expect(page).toHaveURL(/\/attempts\/attempt-1/)
  await expect(page.getByRole('heading', { level: 1, name: 'Tus resultados' })).toBeFocused()
  await expect(page.getByText('6 de 6 bien')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Lo que entendiste bien' })).toBeVisible()
  // la abierta, con la respuesta modelo y la oración del texto, espera la valoración de la persona
  const open = page.getByRole('article').filter({ hasText: 'orgullosa' })
  await expect(open.getByText('Valórala tú')).toBeVisible()
  await expect(open.getByText('Respuesta modelo')).toBeVisible()
  await axe(page)
  await open.getByRole('button', { name: 'A medias' }).click()
  await expect(page.getByText('6,5 de 7 preguntas bien')).toBeVisible()
  expect(api.attempts[0]!.answers.find((a) => a.questionId === 'q7')).toMatchObject({ result: 'PARTIAL', evaluator: 'SELF' })

  // cada respuesta lleva a su oración en el lector
  await page.getByRole('article').filter({ hasText: 'farero?' }).getByRole('link', { name: 'Ver en el texto' }).click()
  await expect(page).toHaveURL(/\/read\/der-alte-leuchtturm#p2s1/)
  await expect(page.locator('#p2s1')).toHaveAttribute('data-cited', 'true')
  expect(api.unexpected).toEqual([])
})

test('una respuesta equivocada enseña la solución y la explicación, sin notas rojas', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm/questions')
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.getByLabel('Porque ya no pasan barcos').check()
  // saltar el resto: lo no respondido cuenta como por repasar (ordenar ya tiene un orden de partida)
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: /Siguiente|Saltar/ }).click()
  await expect(page.getByRole('status')).toContainText('Quedan 5 preguntas sin responder')
  await page.getByRole('button', { name: 'Ver resultados' }).click()
  const first = page.getByRole('article').filter({ hasText: 'farero?' })
  await expect(first.getByText('Por repasar')).toBeVisible()
  await expect(first.getByText('Porque ya no pasan barcos')).toBeVisible()
  await expect(first.getByText('Porque la lámpara funciona automáticamente')).toBeVisible()
  await expect(first.getByText('Por qué', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Para volver a mirar' })).toBeVisible()
  // la próxima vez, el resumen del último intento
  await page.getByRole('link', { name: 'Responder otra vez' }).click()
  await expect(page.getByText('La última vez: 0 de 7.')).toBeVisible()
})

test('una lectura sin preguntas no las ofrece al terminar', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/read/der-fuchs-im-garten')
  await page.getByRole('button', { name: 'Terminé de leer' }).click()
  await expect(page.getByRole('heading', { name: '¡Lectura terminada!' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Comprueba lo que entendiste/ })).toHaveCount(0)
})

test('repasar una palabra guardada cambia su próxima fecha y su estado', async ({ page }) => {
  const api = await fakeApi(page)
  await page.goto('/read/der-alte-leuchtturm')
  await page.locator('[data-token="p1s1t2"]').click()
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar en mi vocabulario' }).click()
  await expect(page.getByRole('dialog').getByRole('button', { name: 'En tu vocabulario' })).toBeVisible()
  await page.goto('/vocabulary')
  await expect(page.getByRole('heading', { name: 'Hoy toca repasar 1 palabra' })).toBeVisible()
  await expect(page.getByText('Toca repasarla')).toBeVisible()
  await page.getByRole('link', { name: 'Repasar ahora' }).click()

  await expect(page.getByText('1 de 1')).toBeVisible()
  await expect(page.getByRole('heading', { name: '¿Qué significa la palabra marcada?' })).toBeFocused()
  await expect(page.locator('mark', { hasText: 'verbringt' })).toBeVisible()
  await axe(page)
  // espacio muestra la respuesta; cada botón dice cuándo vuelve la palabra
  await page.keyboard.press(' ')
  await expect(page.getByText('pasar', { exact: false }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Fácil.*16 días/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Otra vez.*1 min/ })).toBeVisible()
  await axe(page)
  await page.getByRole('button', { name: /Fácil/ }).click()
  await expect(page.getByRole('heading', { name: 'Repasaste 1 palabra' })).toBeFocused()
  expect(api.reviews).toEqual([expect.objectContaining({ rating: 'EASY' })])

  await page.getByRole('link', { name: 'Volver al vocabulario' }).click()
  await expect(page.getByRole('heading', { name: 'Nada que repasar ahora' })).toBeVisible()
  await expect(page.getByRole('article').getByText('Conocida')).toBeVisible()
  await expect(page.getByText(/Próximo repaso:/)).toBeVisible()
  await page.getByRole('button', { name: 'Conocida' }).click()
  await expect(page.getByRole('heading', { name: 'verbringen' })).toBeVisible()
  await page.getByRole('button', { name: 'Aprendiendo' }).click()
  await expect(page.getByRole('heading', { name: 'Ninguna palabra en «Aprendiendo» por ahora.' })).toBeVisible()
})

test('sin nada que repasar, la sesión lo dice con calma', async ({ page }) => {
  await fakeApi(page)
  await page.goto('/vocabulary/review')
  await expect(page.getByRole('heading', { name: 'Nada que repasar ahora' })).toBeVisible()
  await axe(page)
})

test('las ayudas marcan las palabras nuevas y las aprendidas', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('lesen.reader', JSON.stringify({ highlightNew: true, highlightLearned: true })))
  const api = await fakeApi(page)
  await page.goto('/read/der-fuchs-im-garten')
  // nada encontrado todavía: toda palabra con entrada es nueva
  await expect(page.locator('[data-token="p1s1t1"][data-new="true"]')).toBeVisible()
  await page.getByRole('button', { name: 'Terminé de leer' }).click()
  await expect(page.getByRole('heading', { name: '¡Lectura terminada!' })).toBeVisible()
  expect(api.encountered.size).toBeGreaterThan(10)
  // en otra lectura, lo ya encontrado deja de ser nuevo
  await page.goto('/read/der-alte-leuchtturm')
  const shared = [...api.encountered][0]!
  await expect(page.locator('[data-new="true"]').first()).toBeVisible()
  const marks = await page.locator('[data-new="true"]').count()
  expect(marks).toBeGreaterThan(0)
  expect(marks).toBeLessThan(await page.locator('.word').count())
  expect(shared).toBeTruthy()
})
