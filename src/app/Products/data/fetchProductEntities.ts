import { useQuery } from '@tanstack/react-query'
import { entityService } from '../../../services/api/Entity'
import { EntityDto, PaginatedResponse } from '../../../types'

function useFetchProductEntities(page: number) {
  const params = new URLSearchParams({
    usePagination: 'true',
    page: page.toString(),
    type: 'PRODUCT',
  })

  params.append('include', 'entityTags.tag')
  params.append('include', 'product')
  params.append('include', 'brand')
  params.append('include', 'set')

  const query = useQuery<PaginatedResponse<EntityDto>>({
    queryKey: ['productEntities', page],
    queryFn: async () => {
      try {
        const result = await entityService.list(`?${params.toString()}`)
        console.log('Product entities fetched:', result)
        return result
      } catch (error) {
        console.error('Error fetching product entities:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5,
  })

  return {
    productEntities: query.data,
    refetchProductEntities: query.refetch,
    isLoadingProductEntities: query.isLoading,
    errorProductEntities: query.error,
  }
}

export const fetchProductEntities = useFetchProductEntities

