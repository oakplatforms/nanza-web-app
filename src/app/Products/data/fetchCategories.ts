import { useQuery } from '@tanstack/react-query'
import { categoryService } from '../../../services/api/Category'
import { CategoryDto, PaginatedResponse } from '../../../types'

function useFetchCategories() {
  const query = useQuery<PaginatedResponse<CategoryDto>>({
    queryKey: ['productCategories'],
    queryFn: () => categoryService.list(),
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
