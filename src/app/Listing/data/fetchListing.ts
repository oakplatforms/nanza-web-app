import { useQuery } from '@tanstack/react-query'
import { listingService } from '../../../services/api/Listing'
import { ListingDto } from '../../../types'

export function useFetchListing(listingId: string) {
  const query = useQuery<ListingDto>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        params.append('include', 'account.profile')
        params.append('include', 'entity')
        const result = await listingService.get(listingId, `?${params.toString()}`)
        console.log('Listing fetched:', result)
        return result
      } catch (error) {
        console.error('Error fetching listing:', error)
        throw error
      }
    },
    enabled: !!listingId,
    staleTime: 1000 * 60 * 5,
  })

  return {
    listing: query.data,
    refetchListing: query.refetch,
    isLoadingListing: query.isLoading,
    errorListing: query.error,
  }
}

