import { fetchData } from './index'
import { TagPayload } from '../../types'

export const tagService = {
  async get(tagId: string, parameters = '') {
    return fetchData({ url: `/tag/${tagId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/tags${parameters}` })
  },
  async create(tagPayload: TagPayload) {
    return fetchData({
      url: '/tag',
      method: 'POST',
      payload: tagPayload,
    })
  },
  async update(tagId: string, tagPayload: TagPayload) {
    return fetchData({
      url: `/tag/${tagId}`,
      method: 'PUT',
      payload: tagPayload,
    })
  },
  async delete(tagId: string) {
    return fetchData({
      url: `/tag/${tagId}`,
      method: 'DELETE',
    })
  }
}
