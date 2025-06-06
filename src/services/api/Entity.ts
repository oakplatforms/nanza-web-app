import { fetchData } from './index'
import { EntityPayload } from '../../types'

export const entityService = {
  async get(entityId: string, parameters = '') {
    return fetchData({ url: `/entity/${entityId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/entities${parameters}` })
  },
  async create(entityPayload: EntityPayload) {
    return fetchData({
      url: '/entity',
      method: 'POST',
      payload: entityPayload,
    })
  },
  async update(entityId: string, entityPayload: EntityPayload) {
    return fetchData({
      url: `/entity/${entityId}`,
      method: 'PUT',
      payload: entityPayload,
    })
  },
  async delete(entityId: string) {
    return fetchData({
      url: `/entity/${entityId}`,
      method: 'DELETE',
    })
  },
  async uploadImage(entityId: string, formData: FormData) {
    return fetchData({
      url: `/entity/upload-image/${entityId}`,
      method: 'PUT',
      payload: formData,
    })
  }
}
