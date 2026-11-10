import { WasichaiApp } from '@wasichai/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createConfig } from './config'
import { modules } from './modules'
import './index.css'

// una sola app y un solo router: los de WasichaiApp
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WasichaiApp config={createConfig()} modules={modules} />
  </StrictMode>
)

// el laboratorio de diseño (src/dev/design-lab), solo en desarrollo: la build elimina esta rama y no lo incluye
if (import.meta.env.DEV) void import('./dev/design-lab')
