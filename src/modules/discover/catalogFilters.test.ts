import { describe, expect, it } from 'vitest'
import { activeCount, parseFilters, toApiQuery, toSearchParams } from './catalogFilters'

describe('filtros del catálogo', () => {
  it('lee la URL y descarta lo que no es válido', () => {
    const filters = parseFilters(new URLSearchParams('level=A2&level=Z9&level=A2&topic=travel&duration=forever&sort=POPULAR&q=Meer'), 'de')
    expect(filters).toEqual({ language: 'de', levels: ['A2'], topic: 'travel', duration: null, format: null, q: 'Meer', sort: 'POPULAR' })
  })

  it('«todos los idiomas» se dice en la URL y el idioma por defecto no', () => {
    expect(parseFilters(new URLSearchParams('language=all'), 'de').language).toBeNull()
    const filters = parseFilters(new URLSearchParams(), 'de')
    expect(toSearchParams(filters, 'de').toString()).toBe('')
    expect(toSearchParams({ ...filters, language: null }, 'de').get('language')).toBe('all')
  })

  it('va y vuelve por la URL sin perder nada', () => {
    const filters = parseFilters(new URLSearchParams('language=en&level=B1&level=B2&topic=history%2Fmodern&duration=long&q=night&sort=LEVEL'), 'de')
    expect(parseFilters(toSearchParams(filters, 'de'), 'de')).toEqual(filters)
  })

  it('traduce la duración a minutos para la API', () => {
    const query = new URLSearchParams(toApiQuery({ ...parseFilters(new URLSearchParams(), 'de'), duration: 'medium' }, 2))
    expect(query.get('minMinutes')).toBe('4')
    expect(query.get('maxMinutes')).toBe('6')
    expect(query.get('page')).toBe('2')
    expect(query.get('language')).toBe('de')
  })

  it('cuenta los filtros activos', () => {
    expect(activeCount(parseFilters(new URLSearchParams('level=A1&topic=nature&q=x'), 'de'))).toBe(3)
  })
})
