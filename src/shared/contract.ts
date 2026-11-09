import { z } from 'zod'

// la respuesta llegó (2xx) pero no cumple el contrato: un desajuste entre versiones de API e interfaz, no un fallo de quien lee
export class ContractError extends Error {
  readonly resource: string

  constructor(resource: string, error: z.ZodError) {
    super(`la respuesta de ${resource} no cumple el contrato de la API:\n${z.prettifyError(error)}`)
    this.name = 'ContractError'
    this.resource = resource
  }
}

export function parseContract<T>(schema: z.ZodType<T>, resource: string, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) throw new ContractError(resource, result.error)
  return result.data
}

export function pageOf<T extends z.ZodType>(item: T) {
  return z.object({
    content: z.array(item),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative()
  })
}
