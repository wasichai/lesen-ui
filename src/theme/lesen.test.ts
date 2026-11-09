import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LESEN_STYLED_THEMES, LESEN_SYSTEM_THEMES, LESEN_THEMES, READER_THEMES } from './themes'

// el tema Lesen cumple el contrato de @wasichai/ui (todos sus tokens) y WCAG 2.2 AA en los temas de página y en los
// tres del lector. el método es el de colofon.test.ts de elearning-frontend

const lesen = readFileSync(join(import.meta.dirname, 'lesen.css'), 'utf8')
const wasichai = readFileSync(createRequire(import.meta.url).resolve('@wasichai/ui/theme.css'), 'utf8')

function tokens(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`)
  if (start < 0) throw new Error(`sin bloque ${selector}`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  return new Map([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [match[1]!, match[2]!.trim()]))
}

const resolve = (block: Map<string, string>, name: string): string => {
  const value = block.get(name)
  if (value === undefined) throw new Error(`falta --${name}`)
  const alias = /^var\(--([\w-]+)\)$/.exec(value)
  return alias ? resolve(block, alias[1]!) : value
}

const channels = (hex: string) => [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255)

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light! + 0.05) / (dark! + 0.05)
}

// texto sobre sus fondos (4,5:1) y marcas que no son texto (3:1, WCAG 1.4.11)
const TEXT: [string, string[]][] = [
  ['ink', ['surface', 'surface-muted', 'surface-raised', 'table-head', 'brand-soft', 'mark-sentence']],
  ['ink-muted', ['surface', 'surface-muted', 'surface-raised']],
  ['brand', ['surface', 'surface-raised']],
  ['brand-strong', ['surface', 'surface-muted', 'brand-soft']],
  ['link', ['surface', 'surface-muted']],
  ['on-brand', ['brand', 'brand-strong']],
  ['on-danger', ['danger']],
  ['danger', ['surface', 'danger-soft']],
  ['success', ['surface', 'success-soft']],
  ['warning', ['surface', 'warning-soft']],
  ['notice', ['surface', 'notice-soft']],
  ['shell-ink', ['shell']],
  ['shell-muted', ['shell']],
  ['mark-saved-ink', ['mark-saved']],
  ['sage', ['surface', 'surface-raised']],
  ['ochre', ['surface', 'surface-raised']],
  ['sea', ['surface', 'surface-raised']],
  ['plum', ['surface', 'surface-raised']]
]
const MARKS: [string, string[]][] = [
  ['border-control', ['surface', 'surface-muted']],
  ['focus', ['surface', 'surface-muted', 'surface-raised']],
  ['mark-new', ['surface', 'mark-sentence']]
]

function failing(block: Map<string, string>, pairs: [string, string[]][], min: number): string[] {
  return pairs.flatMap(([front, backs]) =>
    backs.flatMap((back) => {
      const ratio = contrast(resolve(block, front), resolve(block, back))
      return ratio >= min ? [] : [`${front} sobre ${back}: ${ratio.toFixed(2)}`]
    })
  )
}

const contract = [...wasichai.matchAll(/^\s+--([a-z-]+):/gm)].map((m) => m[1]!).filter((name) => !name.startsWith('color-'))

describe('tema Lesen', () => {
  it('cada tema que pinta la hoja tiene su bloque', () => {
    for (const id of LESEN_STYLED_THEMES) expect(() => tokens(lesen, `[data-theme='${id}']`)).not.toThrow()
  })

  it.each(LESEN_STYLED_THEMES)('%s pone todos los tokens del contrato de @wasichai/ui', (id) => {
    const block = tokens(lesen, `[data-theme='${id}']`)
    expect(contract.filter((name) => !block.has(name))).toEqual([])
  })

  it.each(LESEN_STYLED_THEMES)('%s: texto a 4,5:1 y marcas a 3:1 (WCAG 2.2 AA)', (id) => {
    const block = tokens(lesen, `[data-theme='${id}']`)
    expect(failing(block, TEXT, 4.5)).toEqual([])
    expect(failing(block, MARKS, 3)).toEqual([])
  })

  it('el sistema abre Lesen claro u oscuro, y los del lector no se ofrecen en el selector de la página', () => {
    expect(LESEN_SYSTEM_THEMES).toEqual({ light: 'lesen', dark: 'lesen-dark' })
    const offered = LESEN_THEMES.map((theme) => theme.id)
    for (const reader of Object.values(READER_THEMES)) expect(offered).not.toContain(reader.id)
  })
})
