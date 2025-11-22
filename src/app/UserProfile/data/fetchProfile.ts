import { useQuery } from '@tanstack/react-query'
import { profileService } from '../../../services/api/Profile'
import { ProfileDto } from '../../../types'

export function useFetchProfile(id: string) {
  const query = useQuery<ProfileDto>({
    queryKey: ['profile', id],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        params.append('include', 'account.listings')
        params.append('include', 'account.lists')
        const result = await profileService.get(id, `?${params.toString()}`)
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
    refetchProfile: query.refetch,
    isLoadingProfile: query.isLoading,
    errorProfile: query.error,
  }
}

