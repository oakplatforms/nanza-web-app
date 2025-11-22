import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listingService } from '../../services/api/Listing'
import { ListingDto } from '../../types'

function useFetchListing(listingId: string) {
  const query = useQuery<ListingDto>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          include: 'account.profile,entity',
        })
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
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function Listing() {
  const { username, listingId } = useParams<{ username: string; listingId: string }>()
  const { listing, isLoading, error } = useFetchListing(listingId || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading listing...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading listing. Please try again.</div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Listing not found.</div>
      </div>
    )
  }

  const usernameDisplay = listing.account?.profile?.username || username || 'Unknown'
  const entityName = listing.entity?.displayName || listing.entity?.name || 'Unknown'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {usernameDisplay}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            {entityName}
          </h2>
        </div>
      </div>
    </div>
  )
}

