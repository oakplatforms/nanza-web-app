import { useQuery } from '@tanstack/react-query'
import { tagService } from '../../../services/api/Tag'
import { PaginatedResponse, TagDto } from '../../../types'

function useFetchTags() {
  const query = useQuery<PaginatedResponse<TagDto>>({
    queryKey: ['productTags'],
    queryFn: () => tagService.list('?include=supportedTagValues'),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })

  return {
    tags: query.data,
    refetchTags: query.refetch,
    isLoadingTags: query.isLoading,
    errorTags: query.error,
  }
}

export const fetchTags = useFetchTags

export {}
