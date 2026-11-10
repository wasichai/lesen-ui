import { Palette, X } from 'lucide-react'
import { StrictMode, useEffect, useId, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LESEN_DARK_THEME, LESEN_THEME } from '../../theme/themes'
import '../../theme/explorations/lab.css'

// el laboratorio de diseño (docs/design-system/lesen/explorations): compara las direcciones de exploración sobre las
// pantallas reales. Solo existe en desarrollo: main.tsx lo importa tras import.meta.env.DEV, así que no llega a la build.
// Una dirección es un atributo en <html> (data-direction) que vuelve a pintar los temas de Lesen; quitarla deja la app
// tal cual. Es una herramienta interna: sus textos no pasan por i18n

const DIRECTIONS = [
  { id: 'actual', name: 'Papel y tinta', note: 'La identidad de hoy, como referencia' },
  { id: 'gaceta', name: 'Gaceta', note: 'Editorial y literaria' },
  { id: 'pulso', name: 'Pulso', note: 'Aprendizaje vibrante' },
  { id: 'musgo', name: 'Musgo', note: 'Calma natural' },
  { id: 'atlas', name: 'Atlas', note: 'Minimal premium' }
] as const
type Direction = (typeof DIRECTIONS)[number]['id']

const MODES = [
  { id: 'app', name: 'Como la app' },
  { id: 'light', name: 'Claro' },
  { id: 'dark', name: 'Oscuro' }
] as const
type Mode = (typeof MODES)[number]['id']

interface Lab {
  direction: Direction
  mode: Mode
}

const KEY = 'lesen.lab'
const isDirection = (value: unknown): value is Direction => DIRECTIONS.some((d) => d.id === value)
const isMode = (value: unknown): value is Mode => MODES.some((m) => m.id === value)

function readLab(): Lab {
  let stored: Partial<Record<keyof Lab, unknown>> = {}
  try {
    stored = JSON.parse(localStorage.getItem(KEY) ?? '{}') as typeof stored
  } catch {
    // un valor roto vuelve a la identidad actual
  }
  // ?direction=pulso en la URL manda, para enlazar una dirección o capturarla
  const fromUrl = new URLSearchParams(location.search).get('direction')
  return {
    direction: isDirection(fromUrl) ? fromUrl : isDirection(stored.direction) ? stored.direction : 'actual',
    mode: isMode(stored.mode) ? stored.mode : 'app'
  }
}

function saveLab(lab: Lab) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lab))
  } catch {
    // sin almacenamiento, la elección dura lo que la pestaña
  }
}

// el tema de página forzado: ThemeProvider pone data-theme cuando cambia la preferencia; el laboratorio lo vuelve a poner
let forced: string | null = null
const root = document.documentElement
new MutationObserver(() => {
  if (forced && root.dataset.theme !== forced) apply()
}).observe(root, { attributes: true, attributeFilter: ['data-theme'] })

function apply() {
  if (forced) {
    root.dataset.theme = forced
    root.style.colorScheme = forced === LESEN_DARK_THEME.id ? 'dark' : 'light'
  }
}

function applyLab(lab: Lab) {
  if (lab.direction === 'actual') delete root.dataset.direction
  else root.dataset.direction = lab.direction
  forced = lab.mode === 'light' ? LESEN_THEME.id : lab.mode === 'dark' ? LESEN_DARK_THEME.id : null
  apply()
}

function DesignLab() {
  const [lab, setLab] = useState(readLab)
  const [open, setOpen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    applyLab(lab)
    saveLab(lab)
  }, [lab])

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  const current = DIRECTIONS.find((d) => d.id === lab.direction)!

  return (
    <div className="fixed bottom-24 left-4 z-50 font-sans lg:bottom-4">
      {open && (
        <section
          role="dialog"
          aria-labelledby={titleId}
          className="mb-3 w-72 rounded-[var(--radius-lg)] border border-border bg-surface-raised p-4 text-ink shadow-[var(--shadow-overlay)]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id={titleId} className="text-label">
              Laboratorio de diseño
            </h2>
            <button
              type="button"
              aria-label="Cerrar el laboratorio"
              className="grid size-11 place-items-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <fieldset>
            <legend className="mb-2 text-secondary text-ink-muted">Dirección</legend>
            {DIRECTIONS.map((direction) => (
              <label key={direction.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 hover:bg-surface-muted">
                <input
                  type="radio"
                  name="lab-direction"
                  className="size-4 accent-[var(--brand)]"
                  checked={lab.direction === direction.id}
                  onChange={() => setLab({ ...lab, direction: direction.id })}
                />
                <span>
                  <span className="block text-label">{direction.name}</span>
                  <span className="block text-[13px] text-ink-muted">{direction.note}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <fieldset className="mt-3">
            <legend className="mb-2 text-secondary text-ink-muted">Tema de la página</legend>
            <div className="flex gap-1">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={lab.mode === mode.id}
                  className={`min-h-11 flex-1 rounded-[var(--radius-chip)] border px-2 text-secondary font-semibold ${
                    lab.mode === mode.id ? 'border-brand bg-brand-soft text-brand-strong' : 'border-border text-ink hover:border-border-control'
                  }`}
                  onClick={() => setLab({ ...lab, mode: mode.id })}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="mt-3 text-[13px] text-ink-muted">El tema del lector (claro, sepia, oscuro) se elige en el lector, con «Aa».</p>
        </section>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Laboratorio de diseño: ${current.name}`}
        className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface-raised px-4 text-secondary font-semibold text-ink shadow-[var(--shadow-overlay)] hover:border-border-control"
        onClick={() => setOpen(!open)}
      >
        <Palette aria-hidden className="size-4" />
        {current.name}
      </button>
    </div>
  )
}

// fuera del árbol de la app: no toca su router, sus proveedores ni su estado. Con un navegador automatizado (las capturas
// de e2e/visual) se aplica la dirección pero no se pinta el botón, salvo con ?lab en la URL
applyLab(readLab())
if (!navigator.webdriver || new URLSearchParams(location.search).has('lab')) mount()

function mount() {
  const host = document.createElement('div')
  host.dataset.designLab = ''
  document.body.append(host)
  createRoot(host).render(
    <StrictMode>
      <DesignLab />
    </StrictMode>
  )
}
