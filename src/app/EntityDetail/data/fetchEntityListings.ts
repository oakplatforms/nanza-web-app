import { useQuery } from '@tanstack/react-query'
import { listingService } from '../../../services/api/Listing'
import { ListingDto, PaginatedResponse } from '../../../types'

export function useFetchEntityListings(entityId: string) {
  const query = useQuery<PaginatedResponse<ListingDto>>({
    queryKey: ['entityListings', entityId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        params.append('entityId', entityId)
        params.append('status', 'ACTIVE')
        params.append('include', 'account.profile')
        const result = await listingService.list(`?${params.toString()}`)
        return result
      } catch (error) {
        console.error('Error fetching entity listings:', error)
        throw error
      }
    },
    enabled: !!entityId,
    staleTime: 1000 * 60 * 5,
  })

  return {
    listings: query.data?.data || [],
    refetchListings: query.refetch,
    isLoadingListings: query.isLoading,
    errorListings: query.error,
  }
}

