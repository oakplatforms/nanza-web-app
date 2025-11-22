import { fetchData } from './index'

export const listingService = {
  async get(listingId: string, parameters = '') {
    return fetchData({ url: `/listing/${listingId}${parameters}` })
  },
}

