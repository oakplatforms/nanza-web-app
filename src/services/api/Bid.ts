import { fetchData } from './index'

export const bidService = {
  async get(bidId: string, parameters = '') {
    return fetchData({ url: `/bid/${bidId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/bids${parameters}` })
  },
}

