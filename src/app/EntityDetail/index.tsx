import { useParams, useNavigate } from 'react-router-dom'
import { Badge, Header } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { useFetchEntity } from './data/fetchEntity'
import { useFetchEntityBids } from './data/fetchEntityBids'
import { useFetchEntityListings } from './data/fetchEntityListings'
import { BidsListingsTable } from '../../components/entity/BidsListingsTable'

export function EntityDetail() {
  const { brandSlug, entityId } = useParams<{ brandSlug: string; entityId: string }>()
  const navigate = useNavigate()
  const { entity, isLoadingEntity, errorEntity } = useFetchEntity(entityId || '')
  const { bids, isLoadingBids } = useFetchEntityBids(entityId || '')
  const { listings, isLoadingListings } = useFetchEntityListings(entityId || '')

  if (isLoadingEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading entity...</div>
      </div>
    )
  }

  if (errorEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading entity. Please try again.</div>
      </div>
    )
  }

  if (!entity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Entity not found.</div>
      </div>
    )
  }

  //Verify brand matches the URL slug
  const brandName = entity.brand?.displayName || entity.brand?.name || ''
  if (!brandName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Entity does not have a brand associated.</div>
      </div>
    )
  }

  const expectedBrandSlug = slugify(brandName)

  if (brandSlug !== expectedBrandSlug) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Entity not found for this brand.</div>
      </div>
    )
  }

  const displayName = entity.displayName || 'Unknown'
  const productNumber = entity.product?.number || 'N/A'
  const description = entity.description || 'No description available'

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

        {/*Bids and Listings Table*/}
        <BidsListingsTable
          bids={bids}
          listings={listings}
          isLoadingBids={isLoadingBids}
          isLoadingListings={isLoadingListings}
        />
      </div>
    </div>
  )
}

