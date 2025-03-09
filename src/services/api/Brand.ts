import { fetchData } from './index'
import { BrandDto } from '../../types'

export const brandService = {
  async get(brandId: string, parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/brand/${brandId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/brands${parameters}` })
  },
  async create(brandPayload: Omit<BrandDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/tcgx-marketplace/brand',
      method: 'POST',
      payload: brandPayload,
    })
  },
  async update(brandId: string, brandPayload: Partial<BrandDto>) {
    return fetchData({
      url: `/tcgx-marketplace/brand/${brandId}`,
      method: 'PUT',
      payload: brandPayload,
    })
  },
  async delete(brandId: string) {
    return fetchData({
      url: `/tcgx-marketplace/brand/${brandId}`,
      method: 'DELETE',
    })
  }
}
