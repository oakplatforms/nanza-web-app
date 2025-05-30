import { useQuery } from '@tanstack/react-query'
import { shippingMethodService } from '../../../services/api/ShippingMethod'
import { PaginatedResponse, ShippingMethodDto } from '../../../types'

function useFetchShippingMethods(page: number) {
  const params = new URLSearchParams({
    usePagination: 'true',
    page: page.toString(),
  })
  params.append('include', 'shippingOptions')
  params.append('include', 'parcels')

  const query = useQuery<PaginatedResponse<ShippingMethodDto>>({
    queryKey: ['shippingMethods'],
    queryFn: () => shippingMethodService.list(`?${params.toString()}`),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })

  return {
    shippingMethods: query.data,
    refetchShippingMethods: query.refetch,
    isLoadingShippingMethods: query.isLoading,
    errorShippingMethods: query.error,
  }
}

export const fetchShippingMethods = useFetchShippingMethods

export {}
