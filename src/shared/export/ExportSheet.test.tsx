import { mockFetch, renderWithProviders } from '@wasichai/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { appModule } from '../../modules/app/module'
import { ExportChoice } from './ExportSheet'

const modules = [appModule()]
let fetchMock: ReturnType<typeof mockFetch> | null = null

beforeEach(() => {
  localStorage.clear()
  URL.createObjectURL = vi.fn(() => 'blob:export')
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => fetchMock?.restore())

describe('exportar una lectura', () => {
  it('descarga el ePub con lo que se eligió y lo recuerda', async () => {
    fetchMock = mockFetch([{ path: /\/export/, body: {} }])
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderWithProviders(<ExportChoice slug="der-alte-leuchtturm" version={1} title="Der alte Leuchtturm" />, { modules })
    await userEvent.click(screen.getByRole('checkbox', { name: /Glosario/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: /Mis notas/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Descargar ePub' }))
    expect(await screen.findByText('Listo: el ePub está en tus descargas.')).toBeInTheDocument()
    const call = fetchMock.calls.find((c) => c.path.includes('/export'))
    expect(call?.path).toContain('/lesen/readings/der-alte-leuchtturm/versions/1/export?format=epub&translations=true&notes=true')
    expect(click).toHaveBeenCalledOnce()
    expect(JSON.parse(localStorage.getItem('lesen.export') ?? '{}')).toEqual({ translations: true, glossary: false, notes: true })
    click.mockRestore()
  })

  it('si la cuenta no puede incluir notas, lo dice', async () => {
    fetchMock = mockFetch([{ path: /\/export/, status: 403, body: { title: 'Forbidden', status: 403 } }])
    renderWithProviders(<ExportChoice slug="der-alte-leuchtturm" version={1} title="Der alte Leuchtturm" />, { modules })
    await userEvent.click(screen.getByRole('checkbox', { name: /Mis notas/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Imprimir o guardar como PDF' }))
    expect(await screen.findByText(/Tu cuenta no puede incluir notas/)).toBeInTheDocument()
  })
})
