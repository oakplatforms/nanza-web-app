import { useQuery } from '@tanstack/react-query'
import { categoryService } from '../../../services/api/Category'
import { CategoryDto, PaginatedResponse } from '../../../types'

function useFetchCategories(page: number) {
  const params = new URLSearchParams({
    usePagination: 'true',
    page: page.toString(),
  })

  const query = useQuery<PaginatedResponse<CategoryDto>>({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(`?${params.toString()}`),
    staleTime: 1000 * 60 * 5,
  })

  return {
    categories: query.data,
    refetchCategories: query.refetch,
    isLoadingCategories: query.isLoading,
    errorCategories: query.error,
  }
}

export const fetchCategories = useFetchCategories
