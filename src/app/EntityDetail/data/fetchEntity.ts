import { useQuery } from '@tanstack/react-query'
import { entityService } from '../../../services/api/Entity'
import { EntityDto } from '../../../types'

export function useFetchEntity(entityId: string) {
  const query = useQuery<EntityDto>({
    queryKey: ['entity', entityId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        params.append('include', 'product')
        params.append('include', 'brand')
        params.append('include', 'entityTags.tag')
        params.append('include', 'set')
        const result = await entityService.get(entityId, `?${params.toString()}`)
        console.log('Entity fetched:', result)
        return result
      } catch (error) {
        console.error('Error fetching entity:', error)
        throw error
      }
    },
    enabled: !!entityId,
    staleTime: 1000 * 60 * 5,
  })

  return {
    entity: query.data,
    refetchEntity: query.refetch,
    isLoadingEntity: query.isLoading,
    errorEntity: query.error,
  }
}

