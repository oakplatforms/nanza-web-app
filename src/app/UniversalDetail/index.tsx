import { useParams, useNavigate } from 'react-router-dom'
import { Badge, Header } from '../../components/Tailwind'
import { useFetchListing } from '../Listing/data/fetchListing'
import { useFetchBid } from '../BidDetail/data/fetchBid'
import { useFetchProfile } from '../UserProfile/data/fetchProfile'
import { UserProfile } from '../UserProfile'

export function UniversalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { listing, isLoadingListing, errorListing } = useFetchListing(id || '')
  const { bid, isLoadingBid, errorBid } = useFetchBid(id || '')
  const { profile, isLoadingProfile, errorProfile } = useFetchProfile(id || '')

  // Determine which one we have - check in order: listing, bid, profile
  const isListing = !!listing && !isLoadingListing && !errorListing
  const isBid = !!bid && !isLoadingBid && !errorBid
  const isProfile = !!profile && !isLoadingProfile && !errorProfile
  
  // Only show loading if we don't have any match yet and at least one is still loading
  const hasMatch = isListing || isBid || isProfile
  const stillLoading = (isLoadingListing && !errorListing) || (isLoadingBid && !errorBid) || (isLoadingProfile && !errorProfile)
  const isLoading = !hasMatch && stillLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Render listing if found
  if (isListing && listing?.entity) {
    const entity = listing.entity
    const displayName = entity.displayName || 'Unknown'
    const productNumber = entity.product?.number || 'N/A'
    const description = entity.description || 'No description available'
    const price = listing.price ? parseFloat(listing.price.toString()).toFixed(2) : null
    const quantity = listing.quantity
    const condition = listing.condition
    const multiTransactionsEnabled = listing.multiTransactionsEnabled

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sky-600 hover:text-sky-700 mb-4 inline-flex items-center"
            >
              ← Back
            </button>
          </div>

          <div className="bg-white overflow-hidden">
            <div className="">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-shrink-0">
                  {entity.image ? (
                    <img
                      src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}${entity.image}`}
                      alt={displayName}
                      className="object-contain rounded-lg"
                      style={{ maxHeight: '400px', width: 'auto' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-lg" style={{ height: '400px', width: '300px' }}>
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <Header level={1} className="mb-4">
                    {displayName}
                  </Header>

                  <div className="space-y-4">
                    <div>
                      <h3 className="sr-only text-sm font-semibold text-gray-700 mb-1">Product Number</h3>
                      <p className="text-[14px] font-medium text-gray-400">#{productNumber}</p>
                    </div>

                    {price && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-1">Price</h3>
                        <p className="text-[18px] font-semibold text-gray-950">${price}</p>
                      </div>
                    )}

                    {quantity !== null && quantity !== undefined && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-1">Quantity</h3>
                        <p className="text-[14px] font-medium text-gray-700">Quantity: {quantity}</p>
                      </div>
                    )}

                    {condition && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-2">Condition</h3>
                        <Badge variant="secondary">
                          {condition.displayName}
                        </Badge>
                      </div>
                    )}

                    {multiTransactionsEnabled && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-2">Multi-transaction</h3>
                        <Badge variant="outline" className="text-sky-600 border-sky-600">
                          Multi-transaction
                        </Badge>
                      </div>
                    )}

                    <div>
                      <h3 className="sr-only text-sm font-semibold text-gray-700 mb-2">Description</h3>
                      <div
                        className="text-gray-900 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    </div>

                    {entity.entityTags && entity.entityTags.length > 0 && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {entity.entityTags.map((entityTag, idx) => (
                            <Badge
                              color="zinc"
                              className="whitespace-nowrap"
                              key={idx}
                            >
                              {entityTag.tag?.displayName} | {entityTag.tagValue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render bid if found
  if (isBid && bid?.entity) {
    const entity = bid.entity
    const displayName = entity.displayName || 'Unknown'
    const productNumber = entity.product?.number || 'N/A'
    const description = entity.description || 'No description available'
    const price = bid.price ? parseFloat(bid.price.toString()).toFixed(2) : null
    const quantity = bid.quantity
    const conditions = bid.conditions || []
    const multiTransactionsEnabled = bid.multiTransactionsEnabled

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sky-600 hover:text-sky-700 mb-4 inline-flex items-center"
            >
              ← Back
            </button>
          </div>

          <div className="bg-white overflow-hidden">
            <div className="">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-shrink-0">
                  {entity.image ? (
                    <img
                      src={`${process.env.REACT_APP_S3_IMAGE_BASE_URL}${entity.image}`}
                      alt={displayName}
                      className="object-contain rounded-lg"
                      style={{ maxHeight: '400px', width: 'auto' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-lg" style={{ height: '400px', width: '300px' }}>
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <Header level={1} className="mb-4">
                    {displayName}
                  </Header>

                  <div className="space-y-4">
                    <div>
                      <h3 className="sr-only text-sm font-semibold text-gray-700 mb-1">Product Number</h3>
                      <p className="text-[14px] font-medium text-gray-400">#{productNumber}</p>
                    </div>

                    {price && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-1">Price</h3>
                        <p className="text-[18px] font-semibold text-gray-950">${price}</p>
                      </div>
                    )}

                    {quantity !== null && quantity !== undefined && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-1">Quantity</h3>
                        <p className="text-[14px] font-medium text-gray-700">Quantity: {quantity}</p>
                      </div>
                    )}

                    {conditions.length > 0 && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-2">Conditions</h3>
                        <div className="flex flex-wrap gap-2">
                          {conditions.map((condition, idx) => (
                            <Badge key={idx} variant="secondary">
                              {condition.displayName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {multiTransactionsEnabled && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-2">Multi-transaction</h3>
                        <Badge variant="outline" className="text-sky-600 border-sky-600">
                          Multi-transaction
                        </Badge>
                      </div>
                    )}

                    <div>
                      <h3 className="sr-only text-sm font-semibold text-gray-700 mb-2">Description</h3>
                      <div
                        className="text-gray-900 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    </div>

                    {entity.entityTags && entity.entityTags.length > 0 && (
                      <div>
                        <h3 className="sr-only text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {entity.entityTags.map((entityTag, idx) => (
                            <Badge
                              color="zinc"
                              className="whitespace-nowrap"
                              key={idx}
                            >
                              {entityTag.tag?.displayName} | {entityTag.tagValue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render profile if found
  if (isProfile) {
    return <UserProfile />
  }

  // If all queries have finished (no longer loading and no errors, or have errors) and we have no match
  const allFinished = (!isLoadingListing || errorListing) && (!isLoadingBid || errorBid) && (!isLoadingProfile || errorProfile)
  
  if (allFinished && !hasMatch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Not found.</div>
      </div>
    )
  }

  // Still waiting for some queries to finish
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  )
}

