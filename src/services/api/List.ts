import { fetchData } from './index'
import { ListPayload, ListUpdatePayload } from '../../types'

export interface EntityListUpdatePayload {
  entityList?: {
    create?: Array<{ entityId: string; quantity?: number }>
    update?: Array<{ id: string; quantity?: number }>
    delete?: string[]
  }
}

export const listService = {
  async get(listId: string, parameters = '') {
    return fetchData({ url: `/list/${listId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/lists${parameters}` })
  },
  async create(listPayload: ListPayload) {
    return fetchData({
      url: '/list',
      method: 'POST',
      payload: listPayload,
    })
  },
  async update(listId: string, listPayload: ListPayload) {
    return fetchData({
      url: `/list/${listId}`,
      method: 'PUT',
      payload: listPayload,
    })
  },
  async updateWithEntityList(listId: string, listPayload: ListUpdatePayload) {
    return fetchData({
      url: `/list/${listId}`,
      method: 'PUT',
      payload: listPayload,
    })
  },
  async delete(listId: string, createdById: string) {
    return fetchData({
      url: `/list/${listId}`,
      method: 'DELETE',
      payload: { createdById },
    })
  },
  async uploadImage(listId: string, formData: FormData, field?: 'banner' | 'logo') {
    const queryParams = field ? `?field=${field}` : ''
    return fetchData({
      url: `/list/upload-image/${listId}${queryParams}`,
      method: 'PUT',
      payload: formData,
    })
  },
  async deleteImage(listId: string, createdById: string, field?: 'banner' | 'logo') {
    const queryParams = field ? `?field=${field}` : ''
    return fetchData({
      url: `/list/delete-image/${listId}${queryParams}`,
      method: 'DELETE',
      payload: { createdById },
    })
  }
}
