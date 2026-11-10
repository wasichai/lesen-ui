import { useCallback, useSyncExternalStore } from 'react'

// la identidad visual que cada persona elige en el perfil: un atributo en <html> (data-direction) que vuelve a pintar los
// temas de Lesen con las hojas de src/theme/directions. Papel y tinta, la de lesen.css, es no poner atributo. Va aparte
// del modo claro u oscuro (la preferencia de tema de @wasichai/core) y se guarda en este navegador (lesen.direction): las
// preferencias de la cuenta aún no tienen dónde guardarla. index.html la aplica antes del bundle, sin destello
export const DIRECTIONS = ['musgo', 'gaceta', 'pulso', 'atlas', 'papel'] as const
export type Direction = (typeof DIRECTIONS)[number]
export const DEFAULT_DIRECTION: Direction = 'musgo'
export const DIRECTION_KEY = 'lesen.direction'

// lo guardado se valida: un valor viejo o roto vuelve a la identidad por defecto
export function readDirection(raw: string | null | undefined): Direction {
  return DIRECTIONS.includes(raw as Direction) ? (raw as Direction) : DEFAULT_DIRECTION
}

export function applyDirection(direction: Direction, root: HTMLElement = document.documentElement) {
  if (direction === 'papel') delete root.dataset.direction
  else root.dataset.direction = direction
}

function stored(): Direction {
  try {
    return readDirection(localStorage.getItem(DIRECTION_KEY))
  } catch {
    return DEFAULT_DIRECTION
  }
}

const listeners = new Set<() => void>()
let current: Direction | null = null
const snapshot = () => (current ??= stored())
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useDirection(): [Direction, (direction: Direction) => void] {
  const direction = useSyncExternalStore(subscribe, snapshot, () => DEFAULT_DIRECTION)
  const choose = useCallback((next: Direction) => {
    current = next
    applyDirection(next)
    try {
      localStorage.setItem(DIRECTION_KEY, next)
    } catch {
      // sin almacenamiento, la elección dura lo que la pestaña
    }
    for (const listener of listeners) listener()
  }, [])
  return [direction, choose]
}
