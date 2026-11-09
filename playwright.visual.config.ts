import { defineConfig, devices } from '@playwright/test'

// el recorrido visual (solo en local): capturas de cada pantalla a los anchos de referencia, para revisarlas a ojo o
// compararlas con las de referencia (e2e/visual/*-snapshots, ignoradas por git: dependen del sistema).
// VISUAL_VIEWPORTS=phone,desktop limita los anchos; VISUAL_DARK=1 añade el tema oscuro
const PORT = Number(process.env.VISUAL_PORT ?? 5190)

export default defineConfig({
  testDir: 'e2e/visual',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PORT}`, locale: 'es-ES', timezoneId: 'Europe/Madrid' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: `yarn dev --port ${PORT}`, url: `http://localhost:${PORT}/login`, reuseExistingServer: true, timeout: 120_000 }
})
