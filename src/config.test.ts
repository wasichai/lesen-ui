import { describe, expect, it } from 'vitest'
import { homeRoute } from './config'
import { ROUTES } from './shared/routes'

// a dónde entra cada persona: quien lee, a Descubrir; quien solo trabaja en el estudio, al estudio
describe('la ruta de inicio', () => {
  const permissions = (objects: Record<string, string[]>, admin = false) => ({ admin, objects })
  const ok = { permissionsFailed: false } as Parameters<typeof homeRoute>[1]

  it('lleva a cada cual a lo suyo', () => {
    expect(homeRoute(permissions({ lectura: ['READ'], cuaderno: ['READ', 'UPDATE'] }), ok)).toBe(ROUTES.discover)
    expect(homeRoute(permissions({ lectura: ['READ'], estudio: ['READ', 'UPDATE', 'PUBLICAR'] }), ok)).toBe(ROUTES.studio)
    expect(homeRoute(permissions({ cuaderno: ['READ'], estudio: ['READ'] }), ok)).toBe(ROUTES.discover)
    expect(homeRoute(permissions({}, true), ok)).toBe(ROUTES.discover)
  })

  it('sin permisos leídos, el panel de core lo explica', () => {
    expect(homeRoute(permissions({}), { permissionsFailed: true } as Parameters<typeof homeRoute>[1])).toBeNull()
  })
})
