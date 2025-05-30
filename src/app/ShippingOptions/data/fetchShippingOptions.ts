import { useQuery } from '@tanstack/react-query'
import { shippingOptionService } from '../../../services/api/ShippingOption'
import { PaginatedResponse, ShippingOptionDto } from '../../../types'

function useFetchShippingOptions(page: number) {
  const params = new URLSearchParams({
    isStandalone: 'true',
    usePagination: 'true',
    page: page.toString(),
  })

  const query = useQuery<PaginatedResponse<ShippingOptionDto>>({
    queryKey: ['shippingOptions'],
    queryFn: () => shippingOptionService.list(`?${params.toString()}`),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })

  return {
    shippingOptions: query.data,
    refetchShippingOptions: query.refetch,
    isLoadingShippingOptions: query.isLoading,
    errorShippingOptions: query.error,
  }
}

export const fetchShippingOptions = useFetchShippingOptions

export {}
