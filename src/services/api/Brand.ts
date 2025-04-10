import { fetchData } from './index'
import { BrandPayload } from '../../types'

export const brandService = {
  async get(brandId: string, parameters = '') {
    return fetchData({ url: `/brand/${brandId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/brands${parameters}` })
  },
  async create(brandPayload: BrandPayload) {
    return fetchData({
      url: '/brand',
      method: 'POST',
      payload: brandPayload,
    })
  },
  async update(brandId: string, brandPayload: BrandPayload) {
    return fetchData({
      url: `/brand/${brandId}`,
      method: 'PUT',
      payload: brandPayload,
    })
  },
  async delete(brandId: string) {
    return fetchData({
      url: `/brand/${brandId}`,
      method: 'DELETE',
    })
  }
}
