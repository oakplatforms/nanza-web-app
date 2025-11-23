import { useParams, useNavigate } from 'react-router-dom'
import { Badge, Header } from '../../components/Tailwind'
import { useFetchBid } from './data/fetchBid'

export function BidDetail() {
  // Support both :bidId and :id params for flexibility
  const { bidId, id } = useParams<{ bidId?: string; id?: string }>()
  const actualBidId = bidId || id || ''
  const navigate = useNavigate()
  const { bid, isLoadingBid, errorBid } = useFetchBid(actualBidId)

  if (isLoadingBid) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading bid...</div>
      </div>
    )
  }

  if (errorBid) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading bid. Please try again.</div>
      </div>
    )
  }

  if (!bid) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Bid not found.</div>
      </div>
    )
  }

  const entity = bid.entity
  if (!entity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Bid does not have an entity associated.</div>
      </div>
    )
  }

  const displayName = entity.displayName || 'Unknown'
  const productNumber = entity.product?.number || 'N/A'
  const description = entity.description || 'No description available'

  // Bid-specific fields
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
              {/*Image Section*/}
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

              {/*Details Section*/}
              <div className="flex-1">
                <Header level={1} className="mb-4">
                  {displayName}
                </Header>

                <div className="space-y-4">
                  <div>
                    <h3 className="sr-only text-sm font-semibold text-gray-700 mb-1">Product Number</h3>
                    <p className="text-[14px] font-medium text-gray-400">#{productNumber}</p>
                  </div>

                  {/*Bid-specific fields*/}
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

