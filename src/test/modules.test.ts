import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { modules } from '../modules'
import { appMessages } from '../shared/appMessages'
import { foreignModuleImports, handWrittenText, literalLinks, MODULES_ROOT, offenders } from './boundaries'

// las fronteras de cada módulo de src/modules (src/test/boundaries.ts) y la paridad de sus textos en es y en

const MODULE_DIRS = readdirSync(MODULES_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

function keys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key))
}

describe('fronteras de los módulos', () => {
  it('encuentra los módulos', () => {
    expect(MODULE_DIRS).toEqual(expect.arrayContaining(['onboarding', 'discover', 'reader', 'library', 'vocabulary', 'dictionary', 'profile']))
  })

  describe.each(MODULE_DIRS)('%s', (name) => {
    const dir = join(MODULES_ROOT, name)

    it('no escribe URLs de pantalla a mano', () => {
      expect(offenders(dir, (_file, source) => literalLinks(source))).toEqual([])
    })

    it('no importa de otro módulo', () => {
      expect(offenders(dir, (file, source) => foreignModuleImports(file, source, dir))).toEqual([])
    })

    it('no escribe texto visible en los componentes', () => {
      expect(offenders(dir, (_file, source) => handWrittenText(source), /\.tsx$/)).toEqual([])
    })
  })

  it('las comprobaciones muerden', () => {
    expect(literalLinks(`<Link to="/discover">`)).toHaveLength(1)
    expect(literalLinks('navigate(`/read/${slug}`)')).toHaveLength(1)
    expect(literalLinks('<Link to={`${links.to(ROUTES.explore)}?topic=x`}>')).toHaveLength(0)
    expect(handWrittenText('<p>Hola</p>')).toHaveLength(1)
    expect(foreignModuleImports(join(MODULES_ROOT, 'reader/x.ts'), `import { a } from '../discover/api'`, join(MODULES_ROOT, 'reader'))).toHaveLength(1)
  })
})

describe('textos en español e inglés', () => {
  const all = [{ id: 'app', i18n: appMessages }, ...modules.filter((m) => m.i18n).map((m) => ({ id: m.id, i18n: m.i18n! }))]

  it.each(all.map((m) => [m.id, m.i18n] as const))('%s tiene las mismas claves en es y en', (_id, i18n) => {
    expect(keys(i18n.en).sort()).toEqual(keys(i18n.es).sort())
  })

  it('cada módulo con rutas trae sus textos', () => {
    expect(modules.filter((m) => m.routes?.length && !m.i18n)).toEqual([])
  })
})
