import { ApiError, useApiClient } from '@wasichai/core'
import { useCallback } from 'react'

// las descargas que no son JSON (la exportación de una lectura). El cliente de core espera JSON: aquí se usa su token y su
// base con fetch, y los errores llegan como ApiError igual que con él (CLAUDE.md, regla 5)
export function useDownload() {
  const client = useApiClient()
  return useCallback(
    async (path: string): Promise<Blob> => {
      const token = client.getToken()
      const response = await fetch(`${client.baseUrl}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      if (!response.ok) {
        let problem: { detail?: string; title?: string; errors?: { field: string; message: string }[] } = {}
        try {
          problem = JSON.parse(await response.text())
        } catch {
          problem = {}
        }
        throw new ApiError(response.status, problem.detail ?? problem.title ?? `HTTP ${response.status}`, problem.errors ?? [])
      }
      return response.blob()
    },
    [client]
  )
}

// guarda un archivo con el diálogo del navegador
export function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// imprime una página en un marco oculto: el diálogo del sistema ofrece «Guardar como PDF». El marco va sin scripts
// (sandbox sin allow-scripts) y se quita al cerrar el diálogo
export function printDocument(html: string, title: string) {
  const frame = document.createElement('iframe')
  frame.setAttribute('sandbox', 'allow-modals allow-same-origin')
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
  frame.title = title
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none'
  frame.addEventListener(
    'load',
    () => {
      const view = frame.contentWindow
      if (!view) return frame.remove()
      view.addEventListener('afterprint', () => frame.remove(), { once: true })
      view.focus()
      view.print()
    },
    { once: true }
  )
  frame.srcdoc = html
  document.body.append(frame)
}
