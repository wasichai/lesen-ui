import { describe, expect, it } from 'vitest'
import { commissionSteps, isRunning, pollInterval, stepsDone } from './commission'
import type { Commission } from './schemas'

const commission = (status: Commission['status'], format: Commission['request']['format'] = 'PICTURE_BOOK'): Commission => ({
  id: 'c1',
  target: 'STUDIO',
  status,
  request: { language: 'de', level: 'A1', minutes: 2, kind: 'STORY', format, topics: [], prompt: null },
  draftId: null,
  readingSlug: null,
  reason: null,
  findings: [],
  directedBy: null,
  illustrations: null,
  createdAt: '2026-11-10T10:00:00Z',
  updatedAt: '2026-11-10T10:00:00Z'
})

describe('encargos', () => {
  it('se pregunta mientras corren y se deja de preguntar al terminar', () => {
    expect(isRunning('ILLUSTRATING')).toBe(true)
    expect(pollInterval(commission('WRITING'))).toBe(2500)
    expect(pollInterval(commission('READY'))).toBe(false)
    expect(pollInterval(undefined)).toBe(false)
  })

  it('un libro tiene el paso de ilustrar; un texto no', () => {
    expect(commissionSteps(commission('QUEUED'))).toContain('ILLUSTRATING')
    expect(commissionSteps(commission('QUEUED', 'TEXT'))).not.toContain('ILLUSTRATING')
    expect(stepsDone(commission('ILLUSTRATING'))).toBe(2)
    expect(stepsDone(commission('READY', 'TEXT'))).toBe(2)
    expect(stepsDone(commission('FAILED'))).toBe(0)
  })
})
