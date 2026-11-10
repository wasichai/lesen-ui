import type { Commission, CommissionStatus } from './schemas'

// los encargos sin React: si siguen en marcha, cada cuánto preguntar y en qué paso van (para la barra de pasos)

export const isRunning = (status: CommissionStatus) => status === 'QUEUED' || status === 'WRITING' || status === 'ILLUSTRATING'

// mientras corre, se pregunta cada pocos segundos; terminado, no
export const pollInterval = (commission: Commission | undefined) => (commission && isRunning(commission.status) ? 2500 : false)

// los pasos de un encargo: un texto no se ilustra
export function commissionSteps(commission: Commission): CommissionStatus[] {
  return commission.request.format === 'PICTURE_BOOK' ? ['QUEUED', 'WRITING', 'ILLUSTRATING', 'READY'] : ['QUEUED', 'WRITING', 'READY']
}

// cuántos pasos lleva hechos (uno que falló se queda donde estaba)
export function stepsDone(commission: Commission): number {
  const steps = commissionSteps(commission)
  if (commission.status === 'FAILED') return 0
  return steps.indexOf(commission.status)
}
