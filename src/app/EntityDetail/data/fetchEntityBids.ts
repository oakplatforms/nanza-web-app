import { useQuery } from '@tanstack/react-query'
import { bidService } from '../../../services/api/Bid'
import { BidDto, PaginatedResponse } from '../../../types'

export function useFetchEntityBids(entityId: string) {
  const query = useQuery<PaginatedResponse<BidDto>>({
    queryKey: ['entityBids', entityId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        params.append('entityId', entityId)
        params.append('status', 'ACTIVE')
        params.append('include', 'account.profile')
        const result = await bidService.list(`?${params.toString()}`)
        return result
      } catch (error) {
        console.error('Error fetching entity bids:', error)
        throw error
      }
    },
    enabled: !!entityId,
    staleTime: 1000 * 60 * 5,
  })

  return {
    bids: query.data?.data || [],
    refetchBids: query.refetch,
    isLoadingBids: query.isLoading,
    errorBids: query.error,
  }
}

