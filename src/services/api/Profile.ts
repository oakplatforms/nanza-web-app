import { fetchData } from './index'

export const profileService = {
  async get(id: string, parameters = '') {
    return fetchData({ url: `/profile/${id}${parameters}` })
  },
}

