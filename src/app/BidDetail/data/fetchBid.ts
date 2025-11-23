import { useQuery } from '@tanstack/react-query'
import { bidService } from '../../../services/api/Bid'
import { BidDto } from '../../../types'

export function useFetchBid(bidId: string) {
  const query = useQuery<BidDto>({
    queryKey: ['bid', bidId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        params.append('include', 'account.profile')
        params.append('include', 'entity.brand')
        params.append('include', 'entity.product')
        params.append('include', 'entity.entityTags.tag')
        params.append('include', 'entity.set')
        params.append('include', 'conditions')
        const result = await bidService.get(bidId, `?${params.toString()}`)
        console.log('Bid fetched:', result)
        return result
      } catch (error) {
        console.error('Error fetching bid:', error)
        throw error
      }
    },
    enabled: !!bidId,
    staleTime: 1000 * 60 * 5,
  })

  return {
    bid: query.data,
    refetchBid: query.refetch,
    isLoadingBid: query.isLoading,
    errorBid: query.error,
  }
}

