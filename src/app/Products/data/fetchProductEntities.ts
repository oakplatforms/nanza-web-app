import { useQuery } from '@tanstack/react-query'
import { entityService } from '../../../services/api/Entity'
import { EntityDto, PaginatedResponse } from '../../../types'

function useFetchProductEntities(page: number) {
  const params = new URLSearchParams({
    usePagination: 'true',
    page: page.toString(),
  })

  params.append('include', 'entityTags.tag')
  params.append('include', 'product')
  params.append('include', 'set')

  const query = useQuery<PaginatedResponse<EntityDto>>({
    queryKey: ['productEntities', page],
    queryFn: () => entityService.list(`?${params.toString()}`),
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

