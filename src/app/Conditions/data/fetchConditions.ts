import { useQuery } from '@tanstack/react-query'
import { conditionService } from '../../../services/api/Condition'
import { ConditionDto, PaginatedResponse } from '../../../types'

function useFetchConditions(page: number) {
  const params = new URLSearchParams({
    usePagination: 'true',
    page: page.toString(),
  })

  const query = useQuery<PaginatedResponse<ConditionDto>>({
    queryKey: ['conditions'],
    queryFn: () => conditionService.list(`?${params.toString()}`),
    staleTime: 1000 * 60 * 5,
  })

  return {
    conditions: query.data,
    refetchConditions: query.refetch,
    isLoadingConditions: query.isLoading,
    errorConditions: query.error,
  }
}

export const fetchConditions = useFetchConditions
