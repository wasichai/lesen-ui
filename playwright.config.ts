import { defineConfig, devices } from '@playwright/test'

// pruebas extremo a extremo sobre la build de producción (vite preview), en Chromium. las de e2e/ simulan la API en el
// navegador (e2e/api.ts, con respuestas capturadas del backend): no necesitan backend. las de e2e/real/ (contra el backend
// de verdad, al que vite preview envía /api según WASICHAI_API_URL) solo corren con E2E_REAL=1, y entonces solas
const PORT = Number(process.env.E2E_PORT ?? 5190)
const BASE_URL = `http://localhost:${PORT}`
const real = Boolean(process.env.E2E_REAL)

export default defineConfig({
  testDir: 'e2e',
  ...(real ? { testMatch: /\/real\/.*\.spec\.ts$/, expect: { timeout: 15_000 } } : { testIgnore: [/\/real\//, /\/visual\//] }),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `yarn build && yarn preview --port ${PORT} --strictPort`,
    url: `${BASE_URL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
})
