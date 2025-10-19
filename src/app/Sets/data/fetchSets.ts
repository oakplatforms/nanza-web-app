import { useQuery } from '@tanstack/react-query'
import { setService } from '../../../services/api/Set'
import { PaginatedResponse, SetDto } from '../../../types'

export function useFetchSets(currentPage: number, searchQuery?: string) {
  const query = useQuery<PaginatedResponse<SetDto>>({
    queryKey: ['sets', currentPage, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      return setService.list(`?${params.toString()}`)
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })

  return {
    sets: query.data,
    refetchSets: query.refetch,
    isLoadingSets: query.isLoading,
    errorSets: query.error,
  }
}
