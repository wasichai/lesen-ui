import { useWasichaiConfig } from '@wasichai/core'
import { useEffect } from 'react'

// el nombre del producto sale de la configuración (VITE_APP_NAME, src/config.ts), nunca de un literal en un componente
export function useAppName(): string {
  const { appName } = useWasichaiConfig()
  return typeof appName === 'function' ? appName(null) : (appName ?? '')
}

// el título de la pestaña de una pantalla: «Pantalla · Producto»; vacío mientras carga, solo el producto
export function usePageTitle(title: string) {
  const app = useAppName()
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · ${app}` : app
    return () => {
      document.title = previous
    }
  }, [title, app])
}
