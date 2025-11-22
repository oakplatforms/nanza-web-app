import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetchProfile } from './data/fetchProfile'
import { useFetchCollectionLists } from './data/fetchCollectionLists'
import { EntityCard } from '../../components/entity/EntityCard'
import { ListCard } from '../../components/list/ListCard'
import { ListingCard } from '../../components/listing/ListingCard'

const fallbackAvatar = 'https://ui-avatars.com/api/?name=User&background=random'

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
    <div className="container mx-auto px-4 pt-10 pb-14">
      <div className="max-w-4xl mx-auto">
        {/*Profile Badge Section*/}
        <div className="max-w-lg mx-auto flex items-center gap-6 mb-6">
          <img
            src={avatarUrl}
            alt={profile.username || 'User'}
            className="w-20 md:w-36 h-20 md:h-36 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = fallbackAvatar
            }}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-950">
              {profile.username || 'User'}
            </h1>

            {/*Profile Info Section*/}
            {profile.description && (
              <div className="mt-2.5 max-w-[375px]">
                <p className="text-gray-700 text-[13.5px] leading-[20px] whitespace-pre-wrap">
                  {profile.description}
                </p>
              </div>
            )}
          </div>
        </div>


        {/*Tabs Section*/}
        <div className="w-fullmt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-center space-x-8">
              <button
                onClick={() => setActiveTab('collection')}
                className={`py-4 px-1 border-b-2 font-medium text-[15px] ${
                  activeTab === 'collection'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Collection
              </button>
              <button
                onClick={() => setActiveTab('lists')}
                className={`py-4 px-1 border-b-2 font-medium text-[15px] ${
                  activeTab === 'lists'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lists
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-[15px] ${
                  activeTab === 'listings'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
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
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-[1px]" style={{ backgroundImage: 'linear-gradient(0deg, #fcfcfc 0%, #E7E7E7 50%, #fcfcfc 100%), linear-gradient(90deg, #fcfcfc 0%, #E7E7E7 50%, #fcfcfc 100%)' }}>
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

