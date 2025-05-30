import { useQuery } from '@tanstack/react-query'
import { tagService } from '../../../services/api/Tag'
import { PaginatedResponse, TagDto } from '../../../types'

function useFetchTags(page: number) {
  const params = new URLSearchParams({
    usePagination: 'true',
    page: page.toString(),
  })

  params.append('include', 'supportedTagValues')

  const query = useQuery<PaginatedResponse<TagDto>>({
    queryKey: ['tags', page],
    queryFn: () => tagService.list(`?${params.toString()}`),
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
