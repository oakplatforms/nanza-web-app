import { useQuery } from '@tanstack/react-query'
import { setService } from '../../../services/api/Set'
import { PaginatedResponse, SetDto } from '../../../types'

function useFetchSets() {
  const query = useQuery<PaginatedResponse<SetDto>>({
    queryKey: ['productSets'],
    queryFn: () => setService.list('?usePagination=false'),
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

export const fetchSets = useFetchSets

export {}
