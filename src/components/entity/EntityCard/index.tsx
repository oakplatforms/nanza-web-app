import { useState, useMemo } from 'react'
import { Badge } from '../../Tailwind'
import { slugify } from '../../../helpers'
import { brandTagConfig } from '../../../constants'
import { EntityTagDto, EntityDto } from '../../../types'

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

export function EntityCard({ entity, entityList, onNavigate }: { entity: EntityDto; entityList?: EntityListType; onNavigate: (path: string) => void }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = entity.image
    ? `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${entity.image}`
    : null
  const displayName = entity.displayName || 'Unknown'
  const brandName = entity.brand?.displayName || entity.brand?.name || ''
  const brandSlug = brandName ? slugify(brandName) : ''
  const quantity = entityList?.quantity
  const primaryTags = useMemo(() => getPrimaryTags(entity.entityTags, brandSlug), [entity.entityTags, brandSlug])

  return (
    <div
      onClick={() => {
        if (entity.id && brandSlug) {
          onNavigate(`/${brandSlug}/${entity.id}`)
        }
      }}
      className="bg-white overflow-hidden cursor-pointer relative"
    >
      {/*Image Section*/}
      <div className="aspect-square pt-14 pb-8 flex items-center justify-center">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={displayName}
            className="w-auto h-full"
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
        {entity.product?.number && (
          <p className="text-[12px] font-medium text-gray-400">#{entity.product.number}</p>
        )}
        {entity.set?.displayName && (
          <div className="mt-1.5 mb-2">
            <Badge variant="secondary">
              {entity.set.displayName}
            </Badge>
          </div>
        )}
        {quantity !== null && quantity !== undefined && quantity > 1 && (
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

