import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profileService } from '../../services/api/Profile'
import { ProfileDto } from '../../types'

const fallbackAvatar = 'https://ui-avatars.com/api/?name=User&background=random'

function useFetchProfile(id: string) {
  const query = useQuery<ProfileDto>({
    queryKey: ['profile', id],
    queryFn: async () => {
      try {
        const result = await profileService.get(id)
        console.log('Profile fetched:', result)
        return result
      } catch (error) {
        console.error('Error fetching profile:', error)
        throw error
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function UserProfile() {
  const { username } = useParams<{ username: string }>()
  const { profile, isLoading, error } = useFetchProfile(username || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading profile. Please try again.</div>
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
        {/* Profile Badge Section */}
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

        {/* Profile Info Section */}
        {profile.description && (
          <div className="mt-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {profile.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

