import { fetchData } from './index'
import { SetPayload } from '../../types'

export const setService = {
  async get(setId: string, parameters = '') {
    return fetchData({ url: `/set/${setId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/sets${parameters}` })
  },
  async create(setPayload: SetPayload) {
    return fetchData({
      url: '/set',
      method: 'POST',
      payload: setPayload,
    })
  },
  async update(setId: string, setPayload: SetPayload) {
    return fetchData({
      url: `/set/${setId}`,
      method: 'PUT',
      payload: setPayload,
    })
  },
  async delete(setId: string) {
    return fetchData({
      url: `/set/${setId}`,
      method: 'DELETE',
    })
  },
  async uploadImage(setId: string, formData: FormData, imageField: 'banner' | 'logo') {
    return fetchData({
      url: `/set/upload-image/${setId}?field=${imageField}`,
      method: 'PUT',
      payload: formData,
    })
  },
  async deleteImage(setId: string, userId: string, imageField: 'banner' | 'logo') {
    return fetchData({
      url: `/set/delete-image/${setId}?field=${imageField}`,
      method: 'DELETE',
      payload: { userId },
    })
  }
}
