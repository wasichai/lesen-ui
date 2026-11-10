import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyDirection, DEFAULT_DIRECTION, DIRECTIONS, readDirection } from './direction'
import { SWATCHES } from './directions/swatches'

describe('identidad elegida', () => {
  it('por defecto es Musgo, y un valor roto o viejo vuelve a Musgo', () => {
    expect(DEFAULT_DIRECTION).toBe('musgo')
    expect(readDirection(null)).toBe('musgo')
    expect(readDirection('lab')).toBe('musgo')
    expect(readDirection('gaceta')).toBe('gaceta')
  })

  it('Papel y tinta es la de lesen.css: sin atributo; las demás lo ponen', () => {
    const root = document.createElement('html')
    applyDirection('atlas', root)
    expect(root.dataset.direction).toBe('atlas')
    applyDirection('papel', root)
    expect(root.dataset.direction).toBeUndefined()
  })

  it('cada identidad tiene su muestra y, salvo Papel y tinta, su hoja', () => {
    for (const id of DIRECTIONS) expect(SWATCHES[id]).toBeDefined()
    const sheets = readFileSync(join(import.meta.dirname, 'directions', 'directions.css'), 'utf8')
    for (const id of DIRECTIONS.filter((d) => d !== 'papel')) expect(sheets).toContain(`@import './${id}.css';`)
  })

  it('el arranque de index.html conoce las mismas identidades y la misma por defecto', () => {
    const html = readFileSync(join(import.meta.dirname, '../../index.html'), 'utf8')
    expect(html).toContain(`'lesen.direction'`)
    const listed = /const directions = (\[[^\]]*\])/.exec(html)?.[1] ?? '[]'
    expect(JSON.parse(listed.replaceAll("'", '"'))).toEqual(DIRECTIONS.filter((d) => d !== 'papel'))
    expect(html).toContain(`: '${DEFAULT_DIRECTION}'`)
  })
})
