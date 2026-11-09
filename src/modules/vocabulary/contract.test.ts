import { describe, expect, it } from 'vitest'
import { splitContext } from './contract'

describe('contexto de una palabra guardada', () => {
  it('marca la palabra dentro de su oración', () => {
    expect(splitContext('Der Leuchtturm steht am Meer.', 'Leuchtturm')).toEqual(['Der ', 'Leuchtturm', ' steht am Meer.'])
  })

  it('sin la palabra, no marca nada', () => {
    expect(splitContext('Der Turm.', 'Leuchtturm')).toBeNull()
  })
})
