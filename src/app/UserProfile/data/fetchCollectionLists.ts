import { useQueries } from '@tanstack/react-query'
import { listService } from '../../../services/api/List'
import { ListDto } from '../../../types'

export function useFetchCollectionLists(listIds: string[]) {
  const queries = useQueries({
    queries: listIds.map((listId) => ({
      queryKey: ['collectionList', listId],
      queryFn: async () => {
        try {
          const params = new URLSearchParams()
          params.append('include', 'entityList.entity.brand')
          params.append('include', 'entityList.entity.product')
          params.append('include', 'entityList.entity.entityTags.tag')
          params.append('include', 'entityList.entity.set')
          const result = await listService.get(listId, `?${params.toString()}`)
          return result
        } catch (error) {
          console.error(`Error fetching collection list ${listId}:`, error)
          throw error
        }
      },
      enabled: !!listId,
      staleTime: 1000 * 60 * 5,
    })),
  })

  return {
    lists: queries.map((q) => q.data).filter(Boolean) as ListDto[],
    isLoading: queries.some((q) => q.isLoading),
    errors: queries.map((q) => q.error).filter(Boolean),
  }
}

