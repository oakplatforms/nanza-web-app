import { useQuery } from '@tanstack/react-query'
import { listService } from '../../../services/api/List'
import { ListDto, PaginatedResponse } from '../../../types'

function useFetchHomepageLists(page: number) {
  const params = new URLSearchParams({
    usePagination: 'true',
    page: page.toString(),
    type: 'HOMEPAGE',
    include: 'entityList.entity.product',
    sortBy: 'index',
    sortOrder: 'asc',
  })

  const query = useQuery<PaginatedResponse<ListDto>>({
    queryKey: ['homepage-lists', page],
    queryFn: () => listService.list(`?${params.toString()}`),
    staleTime: 1000 * 60 * 5,
  })

  return {
    lists: query.data,
    refetchLists: query.refetch,
    isLoadingLists: query.isLoading,
    errorLists: query.error,
  }
}

export const fetchHomepageLists = useFetchHomepageLists
