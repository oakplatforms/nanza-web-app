import { fetchData } from './index'
import { EntityPayload } from '../../types'

export const entityService = {
  async get(entityId: string, parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/one-piece/entity/${entityId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/one-piece/entities${parameters}` })
  },
  async create(entityPayload: EntityPayload) {
    return fetchData({
      url: '/tcgx-marketplace/one-piece/entity',
      method: 'POST',
      payload: entityPayload,
    })
  },
  async update(entityId: string, entityPayload: EntityPayload) {
    return fetchData({
      url: `/tcgx-marketplace/one-piece/entity/${entityId}`,
      method: 'PUT',
      payload: entityPayload,
    })
  },
  async delete(entityId: string) {
    return fetchData({
      url: `/tcgx-marketplace/one-piece/entity/${entityId}`,
      method: 'DELETE',
    })
  }
}
