import type { HomeRoute, WasichaiConfig } from '@wasichai/core'
import { createElement } from 'react'
import { LesenMark } from './shared/LesenMark'
import { ROUTES } from './shared/routes'
import { LESEN_SYSTEM_THEMES, LESEN_THEMES } from './theme/themes'

// nombre de trabajo: el producto se llama como diga VITE_APP_NAME en cada despliegue
export const DEFAULT_APP_NAME = 'Lesen'
// el administrador de la semilla de Wasichai (perfil dev del backend); en producción el login sale vacío
export const DEV_LOGIN_EMAIL = 'admin@wasichai.local'

export interface AppEnv {
  VITE_APP_NAME?: string
  DEV: boolean
}

export function appName(env: Pick<AppEnv, 'VITE_APP_NAME'> = import.meta.env): string {
  return env.VITE_APP_NAME?.trim() || DEFAULT_APP_NAME
}

// el inicio de todo el que entra es Descubrir. Si los permisos no se pudieron leer, el panel de core (que lo explica)
export const homeRoute: HomeRoute = (_permissions, { permissionsFailed }) => (permissionsFailed ? null : ROUTES.discover)

// la configuración de <WasichaiApp>. /api lo atiende el proxy de Vite (vite.config.ts) o el del despliegue.
// storagePrefix propio: otra app de Wasichai en el mismo origen no comparte sesión, idioma ni tema
export function createConfig(env: AppEnv = import.meta.env): WasichaiConfig {
  return {
    apiBaseUrl: '/api',
    appName: appName(env),
    appTagline: '',
    appLogo: createElement(LesenMark, { className: 'size-8' }),
    storagePrefix: 'lesen',
    languages: ['es', 'en'],
    themes: LESEN_THEMES,
    systemThemes: LESEN_SYSTEM_THEMES,
    defaultLoginEmail: env.DEV ? DEV_LOGIN_EMAIL : '',
    homeRoute
  }
}
