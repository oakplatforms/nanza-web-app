import { useState } from 'react'
import { Badge } from '../../Tailwind'

export function ListingCard({ listing, username, onNavigate }: { listing: any; username: string; onNavigate: (path: string) => void }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = listing.image
    ? `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${listing.image}`
    : null
  const price = parseFloat(listing.price || '0').toFixed(2)
  const isActive = listing.status === 'ACTIVE'

  return (
    <div
      onClick={() => onNavigate(`/${username}/${listing.id}`)}
      className="bg-zinc-100 overflow-hidden cursor-pointer"
    >
      {/*Image Section*/}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={listing.imageCaption || 'Listing'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      {/*Details Section*/}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">${price}</span>
          <Badge color={isActive ? 'green' : 'zinc'}>
            {listing.status}
          </Badge>
        </div>

        {listing.imageCaption && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {listing.imageCaption}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
          {listing.quantity !== null && listing.quantity !== undefined && (
            <span>Qty: {listing.quantity}</span>
          )}
          {listing.multiTransactionsEnabled && (
            <span className="text-sky-600">Multi-transaction</span>
          )}
        </div>
      </div>
    </div>
  )
}

