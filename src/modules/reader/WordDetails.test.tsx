import { mockFetch, renderWithProviders } from '@wasichai/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { appModule } from '../app/module'
import { readerModule } from './module'
import { lookup, unknownLookup } from './test/fixtures'
import { WordDetails } from './WordDetails'

const modules = [appModule(), readerModule()]
let fetchMock: ReturnType<typeof mockFetch> | null = null
afterEach(() => fetchMock?.restore())

describe('la palabra en contexto', () => {
  it('muestra el lema, la forma flexionada y la traducción, y guarda la palabra con su token', async () => {
    fetchMock = mockFetch([
      { path: /\/lesen\/dictionary\/lookup/, body: lookup },
      { method: 'POST', path: /\/lesen\/vocabulary$/, status: 201, body: {} }
    ])
    renderWithProviders(<WordDetails slug="der-alte-leuchtturm" version={1} tokenRef="p1s1t2" language="de" mode="full" saved={false} />, { modules })
    expect(await screen.findByText('verbringen')).toBeInTheDocument()
    expect(screen.getByText('pasar (tiempo)')).toBeInTheDocument()
    expect(screen.getByText('«verbringt» es una forma de «verbringen».')).toBeInTheDocument()
    expect(screen.getByText('verbrachte')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar en mi vocabulario' }))
    expect(await screen.findByRole('button', { name: 'En tu vocabulario' })).toBeDisabled()
    const saved = fetchMock.calls.find((call) => call.method === 'POST')
    expect(saved?.body).toEqual({ entryKey: 'de:verbringen', reading: 'der-alte-leuchtturm', version: 1, tokenRef: 'p1s1t2' })
  })

  it('la traducción de la oración solo se pide al pulsar, y su falta se dice', async () => {
    fetchMock = mockFetch([
      { path: /\/lesen\/dictionary\/lookup/, body: lookup },
      { path: /\/translations/, status: 404, body: { title: 'Not Found', status: 404 } }
    ])
    renderWithProviders(<WordDetails slug="der-alte-leuchtturm" version={1} tokenRef="p1s1t2" language="de" mode="full" saved={false} />, { modules })
    await screen.findByText('verbringen')
    expect(fetchMock.calls.some((call) => call.path.includes('translations'))).toBe(false)
    await userEvent.click(screen.getByRole('button', { name: 'Traducir la oración' }))
    expect(await screen.findByText('Esta oración aún no tiene traducción.')).toBeInTheDocument()
  })

  it('sin entrada en el diccionario, lo dice en vez de inventar', async () => {
    fetchMock = mockFetch([{ path: /\/lesen\/dictionary\/lookup/, body: unknownLookup }])
    renderWithProviders(<WordDetails slug="der-alte-leuchtturm" version={1} tokenRef="p2s1t1" language="de" mode="compact" saved={false} />, { modules })
    expect(await screen.findByText('Todavía no tenemos esta palabra en el diccionario.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar en mi vocabulario' })).toBeNull()
  })
})
