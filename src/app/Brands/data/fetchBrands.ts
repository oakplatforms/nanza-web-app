import { useQuery } from '@tanstack/react-query'
import { brandService } from '../../../services/api/Brand'
import { BrandDto, PaginatedResponse } from '../../../types'

function useFetchBrands(page: number) {
  const params = new URLSearchParams({
    usePagination: 'true',
    page: page.toString(),
  })

  const query = useQuery<PaginatedResponse<BrandDto>>({
    queryKey: ['brands'],
    queryFn: () => brandService.list(`?${params.toString()}`),
    staleTime: 1000 * 60 * 5,
  })

  return {
    brands: query.data,
    refetchBrands: query.refetch,
    isLoadingBrands: query.isLoading,
    errorBrands: query.error,
  }
}

export const fetchBrands = useFetchBrands
