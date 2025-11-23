import { useState, useMemo } from 'react'
import { Badge } from '../../Tailwind'
import { slugify } from '../../../helpers'
import { brandTagConfig } from '../../../constants'
import { EntityTagDto, EntityDto, ListingDto, BidDto } from '../../../types'

export type EntityListType = {
  id?: string
  quantity?: number | null
  entity?: EntityDto
}

//Helper function to get primary tags for an entity based on brand configuration,ordered by constants file
function getPrimaryTags(entityTags: EntityTagDto[] | undefined, brandSlug: string): EntityTagDto[] {
  if (!entityTags || !brandSlug) return []

  const brandConfig = brandTagConfig[brandSlug]
  if (!brandConfig) return []

  const primaryTagNames = brandConfig.primary
  const filteredTags = entityTags.filter((entityTag) => {
    const tagDisplayName = entityTag.tag?.displayName?.toLowerCase()
    return tagDisplayName && primaryTagNames.includes(tagDisplayName)
  })

  //Sort tags by the order in the constants file
  return filteredTags.sort((a, b) => {
    const aIndex = primaryTagNames.indexOf(a.tag?.displayName?.toLowerCase() || '')
    const bIndex = primaryTagNames.indexOf(b.tag?.displayName?.toLowerCase() || '')
    return aIndex - bIndex
  })
}

export function EntityCard({
  entity,
  entityList,
  listing,
  bid,
  onNavigate
}: {
  entity: EntityDto
  entityList?: EntityListType
  listing?: ListingDto
  bid?: BidDto
  onNavigate: (path: string) => void
}) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  //Default to entity image, show listing image on hover
  const entityImageUrl = entity.image
    ? `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${entity.image}`
    : null
  const listingImageUrl = listing?.image
    ? `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${listing.image}`
    : null

  //Show listing image on hover if available, otherwise entity image
  const imageUrl = isHovered && listingImageUrl ? listingImageUrl : entityImageUrl

  const displayName = entity.displayName || 'Unknown'
  const brandName = entity.brand?.displayName || entity.brand?.name || ''
  const brandSlug = brandName ? slugify(brandName) : ''

  //Quantity: use listing.quantity if listing is provided, then bid.quantity, otherwise entityList.quantity
  const quantity = listing ? listing.quantity : (bid ? bid.quantity : entityList?.quantity)

  const primaryTags = useMemo(() => getPrimaryTags(entity.entityTags, brandSlug), [entity.entityTags, brandSlug])

  //Listing-specific fields
  const price = listing?.price ? parseFloat(listing.price.toString()).toFixed(2) : (bid?.price ? parseFloat(bid.price.toString()).toFixed(2) : null)
  const condition = listing?.condition || (bid?.conditions && bid.conditions.length > 0 ? bid.conditions[0] : null)
  const multiTransactionsEnabled = listing?.multiTransactionsEnabled || bid?.multiTransactionsEnabled
  const isActive = listing?.status === 'ACTIVE' || bid?.status === 'ACTIVE'

  //Navigation: use listing/bid detail page if provided, otherwise entity navigation
  const handleClick = () => {
    if (listing && listing.id) {
      onNavigate(`/${listing.id}`)
    } else if (bid && bid.id) {
      onNavigate(`/${bid.id}`)
    } else if (entity.id && brandSlug) {
      onNavigate(`/${brandSlug}/${entity.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white overflow-hidden cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/*Image Section*/}
      <div className="aspect-square pt-14 pb-8 flex items-center justify-center">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={displayName}
            className="w-auto h-full transition-opacity duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      {/*Details Section*/}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1 mb-1">
          <h3 className="text-[15px] font-semibold text-gray-950 line-clamp-2">
            {displayName}
          </h3>
          {primaryTags.length > 0 && (
            <>
              {primaryTags.map((entityTag, idx) => (
                <Badge key={idx} variant="outline" className={idx === 0 ? 'ml-0.5' : 'ml-0.5'}>
                  {entityTag.tagValue}
                </Badge>
              ))}
            </>
          )}
        </div>
        {brandName && (
          <p className="absolute hidden -right-5 text-[9px] font-normal text-gray-400 -rotate-90 origin-center-right whitespace-nowrap">{brandName}</p>
        )}
        {price && (
          <p className="text-[15px] font-semibold text-gray-950">${price}</p>
        )}
        {entity.product?.number && (
          <p className="text-[12px] font-medium text-gray-400">#{entity.product.number}</p>
        )}
        {condition?.displayName && (
          <div className="mt-1.5 mb-2">
            <Badge variant="secondary">
              {condition.displayName}
            </Badge>
          </div>
        )}
        {entity.set?.displayName && (
          <div className="mt-1.5 mb-2">
            <Badge variant="secondary">
              {entity.set.displayName}
            </Badge>
          </div>
        )}
        {multiTransactionsEnabled && (
          <div className="mt-1.5 mb-2">
            <Badge variant="outline" className="text-sky-600 border-sky-600">
              Multi-transaction
            </Badge>
          </div>
        )}
        {(listing || bid)
          ? !isActive ? (
            <div className="absolute top-1.5 right-3 mt-2">
              <Badge variant="quantity">
                <span className="text-[12px] font-medium text-gray-400">Sold Out</span>
              </Badge>
            </div>
          ) : quantity !== null && quantity !== undefined && (
            <div className="absolute top-1.5 right-3 mt-2">
              <Badge variant="quantity">
                <span className="text-[12px] font-medium text-gray-400">x</span>{quantity}
              </Badge>
            </div>
          )
          : quantity !== null && quantity !== undefined && quantity > 1 && (
            <div className="absolute top-1.5 right-3 mt-2">
              <Badge variant="quantity">
                <span className="text-[12px] font-medium text-gray-400">x</span>{quantity}
              </Badge>
            </div>
          )}
      </div>
    </div>
  )
}

