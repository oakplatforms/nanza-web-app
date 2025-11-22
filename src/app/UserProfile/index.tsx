import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetchProfile } from './data/fetchProfile'
import { Badge } from '../../components/Tailwind'
import { slugify } from '../../helpers'

const fallbackAvatar = 'https://ui-avatars.com/api/?name=User&background=random'

function EntityCard({ entity, entityList, onNavigate }: { entity: any; entityList?: any; onNavigate: (path: string) => void }) {
  const [imageError, setImageError] = useState(false)
  const imageUrl = entity.image
    ? `${process.env.REACT_APP_S3_IMAGE_BASE_URL}${entity.image}`
    : null
  const displayName = entity.displayName || 'Unknown'
  const brandName = entity.brand?.displayName || entity.brand?.name || ''
  const brandSlug = brandName ? slugify(brandName) : ''
  const quantity = entityList?.quantity

  return (
    <div
      onClick={() => {
        if (entity.id && brandSlug) {
          onNavigate(`/${brandSlug}/${entity.id}`)
        }
      }}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/*Image Section*/}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
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
        {brandName && (
          <p className="text-sm text-gray-600 mb-2">{brandName}</p>
        )}
        {entity.product?.number && (
          <p className="text-xs text-gray-500">#{entity.product.number}</p>
        )}
        {quantity !== null && quantity !== undefined && (
          <p className="text-sm text-gray-700 mt-2 font-medium">Qty: {quantity}</p>
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
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
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
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
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
            <h1 className="text-3xl font-bold text-gray-900">
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
              {(() => {
                const allLists = profile.account?.lists || []
                const collections = allLists.filter(
                  (list) => list.type === 'COLLECTION'
                )
                const allEntityListItems = collections.flatMap(
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allEntityListItems.map((item) => (
                      <EntityCard
                        key={item.id}
                        entity={item.entity}
                        entityList={item}
                        onNavigate={navigate}
                      />
                    ))}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

