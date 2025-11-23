import { BidDto, ListingDto } from '../../../types'

const fallbackAvatar = 'https://ui-avatars.com/api/?name=User&background=random'

type BidsListingsTableProps = {
  bids: BidDto[]
  listings: ListingDto[]
  isLoadingBids?: boolean
  isLoadingListings?: boolean
}

export function BidsListingsTable({
  bids,
  listings,
  isLoadingBids = false,
  isLoadingListings = false,
}: BidsListingsTableProps) {
  const maxRows = Math.max(bids.length, listings.length)

  const getAvatarUrl = (avatar: string | null | undefined, username?: string | null) => {
    if (avatar) {
      return `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${avatar}`
    }
    const name = username || 'User'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  }

  const formatPrice = (price: number | string | undefined | null) => {
    if (price === undefined || price === null) return '$0.00'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) return '$0.00'
    return `$${numPrice.toFixed(2)}`
  }

  if (isLoadingBids || isLoadingListings) {
    return (
      <div className="mt-8">
        <div className="text-lg font-semibold mb-4">Bids & Listings</div>
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="border-t border-b border-gray-200 py-2">
        {/*Header*/}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="font-semibold text-gray-700">Bids</div>
          <div className="font-semibold text-gray-700 text-right">Asks</div>
        </div>

        {/*Rows*/}
        {maxRows === 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-gray-500 text-sm py-2">No bids</div>
            <div className="text-gray-500 text-sm py-2 text-right">No listings</div>
          </div>
        ) : (
          Array.from({ length: maxRows }).map((_, index) => {
            const bid = bids[index]
            const listing = listings[index]

            return (
              <div key={index} className="grid grid-cols-2 gap-4 py-2">
                {/*Bid Row*/}
                <div className="flex items-center gap-3">
                  {bid ? (
                    <>
                      <img
                        src={getAvatarUrl(bid.account?.profile?.avatar, bid.account?.profile?.username)}
                        alt={bid.account?.profile?.username || 'User'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = fallbackAvatar
                        }}
                      />
                      <span className="text-sm text-gray-900 flex-1 min-w-0">
                        {bid.account?.profile?.username || 'Unknown'}
                      </span>
                      <span className="text-sm font-semibold text-green-600 flex-shrink-0 text-right min-w-[60px]">
                        {formatPrice(bid.price)}
                      </span>
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm">No bids</div>
                  )}
                </div>

                {/*Listing Row*/}
                <div className="flex items-center gap-3 justify-end">
                  {listing ? (
                    <>
                      <span className="text-sm font-semibold text-red-600 flex-shrink-0 text-left min-w-[60px]">
                        {formatPrice(listing.price)}
                      </span>
                      <span className="text-sm text-gray-900 flex-1 min-w-0 text-right">
                        {listing.account?.profile?.username || 'Unknown'}
                      </span>
                      <img
                        src={getAvatarUrl(listing.account?.profile?.avatar, listing.account?.profile?.username)}
                        alt={listing.account?.profile?.username || 'User'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = fallbackAvatar
                        }}
                      />
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm text-right">No listings</div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

