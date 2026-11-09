import type { SystemThemes, ThemeDefinition } from '@wasichai/core'

// los temas de página de Lesen (lesen.css). la etiqueta es una clave del espacio de nombres del perfil, donde viven sus textos
export const LESEN_THEME = { id: 'lesen', label: 'profile:theme.lesen', colorScheme: 'light' } satisfies ThemeDefinition
export const LESEN_DARK_THEME = { id: 'lesen-dark', label: 'profile:theme.lesenDark', colorScheme: 'dark' } satisfies ThemeDefinition

export const LESEN_THEMES = [LESEN_THEME, LESEN_DARK_THEME]

// una persona nueva («sistema») entra en Lesen, claro u oscuro según su sistema operativo
export const LESEN_SYSTEM_THEMES: SystemThemes = { light: LESEN_THEME.id, dark: LESEN_DARK_THEME.id }

// los temas del lector: solo como subárbol (data-theme en el contenedor de la lectura). los elige quien lee en la barra
// del lector, con independencia del tema de la página; no están en config.themes
export const READER_THEMES = {
  light: { id: 'lesen-reader-light', colorScheme: 'light' },
  sepia: { id: 'lesen-reader-sepia', colorScheme: 'light' },
  dark: { id: 'lesen-reader-dark', colorScheme: 'dark' }
} as const

export type ReaderTheme = keyof typeof READER_THEMES

export const LESEN_STYLED_THEMES = [LESEN_THEME.id, LESEN_DARK_THEME.id, ...Object.values(READER_THEMES).map((theme) => theme.id)]
