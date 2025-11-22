import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetchProfile } from './data/fetchProfile'
import { useFetchCollectionLists } from './data/fetchCollectionLists'
import { Badge } from '../../components/Tailwind'
import { slugify } from '../../helpers'
import { brandTagConfig } from '../../constants'
import { EntityTagDto, EntityDto } from '../../types'

const fallbackAvatar = 'https://ui-avatars.com/api/?name=User&background=random'

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

type EntityListType = {
  id?: string
  quantity?: number | null
  entity?: EntityDto
}

function EntityCard({ entity, entityList, onNavigate }: { entity: EntityDto; entityList?: EntityListType; onNavigate: (path: string) => void }) {
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
      <div className="aspect-square py-8 flex items-center justify-center">
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
          <h3 className="text-[13.5px] font-semibold text-gray-950 line-clamp-2">
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
          <p className="text-[10.5px] font-medium text-gray-400">#{entity.product.number}</p>
        )}
        {entity.set?.displayName && (
          <div className="mt-1 mb-2">
            <Badge variant="secondary">
              {entity.set.displayName}
            </Badge>
          </div>
        )}
        {quantity !== null && quantity !== undefined && (
          <p className="absolute top-0 right-3 text-sm text-gray-700 mt-2 font-medium">Qty: {quantity}</p>
        )}
      </div>
    </div>
  )
}

function ListCard({ list, username, onNavigate }: { list: any; username: string; onNavigate: (path: string) => void }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = list.banner || list.logo
    ? `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${list.banner || list.logo}`
    : null
  const displayName = list.displayName || list.name || 'Untitled List'

  return (
    <div
      onClick={() => {
        if (list.id) {
          onNavigate(`/${username}/list/${list.id}`)
        }
      }}
      className="bg-zinc-100 overflow-hidden cursor-pointer"
    >
      {/*Image Section*/}
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      {/*Details Section*/}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {displayName}
        </h3>
        {list.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {list.description}
          </p>
        )}
        {list.entityList && (
          <p className="text-xs text-gray-500 mt-2">
            {list.entityList.length} {list.entityList.length === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
    </div>
  )
}

function ListingCard({ listing, username, onNavigate }: { listing: any; username: string; onNavigate: (path: string) => void }) {
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

export function UserProfile() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { profile, isLoadingProfile, errorProfile } = useFetchProfile(username || '')
  const [activeTab, setActiveTab] = useState<'collection' | 'lists' | 'listings'>('collection')

  //Get collection list IDs
  const collectionListIds = useMemo(() => {
    return profile?.account?.lists?.filter((list) => list.type === 'COLLECTION').map((list) => list.id!).filter(Boolean) || []
  }, [profile?.account?.lists])

  //Fetch detailed collection lists with entityList data
  const { lists: collectionLists, isLoading: isLoadingCollections } = useFetchCollectionLists(collectionListIds)

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  if (errorProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Error loading profile. Please try again.
          {errorProfile instanceof Error && (
            <div className="text-sm mt-2 text-gray-600">{errorProfile.message}</div>
          )}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Profile not found.</div>
      </div>
    )
  }

  const avatarUrl = profile.avatar
    ? `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${profile.avatar}`
    : fallbackAvatar

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/*Profile Badge Section*/}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={avatarUrl}
            alt={profile.username || 'User'}
            className="w-20 h-20 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = fallbackAvatar
            }}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-950">
              {profile.username || 'User'}
            </h1>
          </div>
        </div>

        {/*Profile Info Section*/}
        {profile.description && (
          <div className="mt-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {profile.description}
            </p>
          </div>
        )}

        {/*Tabs Section*/}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('collection')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'collection'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Collection
              </button>
              <button
                onClick={() => setActiveTab('lists')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'lists'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Lists
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'listings'
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Listings
              </button>
            </nav>
          </div>

          {/*Collection Tab Content*/}
          {activeTab === 'collection' && (
            <div className="mt-6">
              {isLoadingCollections ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Loading collection...</p>
                </div>
              ) : (() => {
                const allEntityListItems = collectionLists.flatMap(
                  (collection) => {
                    const items = collection.entityList?.filter((el) => el.entity != null) || []
                    return items
                  }
                )

                if (allEntityListItems.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      <p>No items in collection yet.</p>
                    </div>
                  )
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]" style={{ backgroundImage: 'linear-gradient(0deg, #fcfcfc 0%, #E7E7E7 50%, #fcfcfc 100%), linear-gradient(90deg, #fcfcfc 0%, #E7E7E7 50%, #fcfcfc 100%)' }}>
                    {allEntityListItems.map((item) => {
                      if (!item.entity) return null
                      return (
                        <EntityCard
                          key={item.id}
                          entity={item.entity}
                          entityList={item}
                          onNavigate={navigate}
                        />
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          {/*Lists Tab Content*/}
          {activeTab === 'lists' && (
            <div className="mt-6">
              {(() => {
                const allLists = profile.account?.lists || []
                const favoriteAndCustomLists = allLists.filter(
                  (list) => list.type === 'FAVORITE' || list.type === 'CUSTOM'
                )

                if (favoriteAndCustomLists.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      <p>No lists yet.</p>
                    </div>
                  )
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]" style={{ backgroundImage: 'linear-gradient(0deg, #fcfcfc 0%, #E7E7E7 50%, #fcfcfc 100%), linear-gradient(90deg, #fcfcfc 0%, #E7E7E7 50%, #fcfcfc 100%)' }}>
                    {favoriteAndCustomLists.map((list) => (
                      <ListCard
                        key={list.id}
                        list={list}
                        username={username || ''}
                        onNavigate={navigate}
                      />
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {/*Listings Tab Content*/}
          {activeTab === 'listings' && (
            <div className="mt-6">
              {profile.account?.listings && profile.account.listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]" style={{ backgroundImage: 'linear-gradient(0deg, #fcfcfc 0%, #E7E7E7 50%, #fcfcfc 100%), linear-gradient(90deg, #fcfcfc 0%, #E7E7E7 50%, #fcfcfc 100%)' }}>
                  {profile.account.listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      username={username || ''}
                      onNavigate={navigate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No listings yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

