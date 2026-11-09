import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLesenApi } from './api'

// guardar una lectura para después: lo usan la ficha y el lector. Al terminar, todo lo de la persona se vuelve a pedir
export function useBookmark(slug: string) {
  const { send } = useLesenApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (on: boolean) => send(on ? 'PUT' : 'DELETE', `/lesen/readings/${encodeURIComponent(slug)}/bookmark`, undefined),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['me'] })
  })
}
