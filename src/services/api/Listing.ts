import { fetchData } from './index'

export const listingService = {
  async get(listingId: string, parameters = '') {
    return fetchData({ url: `/listing/${listingId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/listings${parameters}` })
  },
}

