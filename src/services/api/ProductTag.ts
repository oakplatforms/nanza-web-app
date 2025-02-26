import { fetchData } from './index'
import { ProductTagDto } from '../../types'

export const productTagService = {
  async create(productTagPayload: Omit<ProductTagDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/tcgx-marketplace/product-tag',
      method: 'POST',
      payload: productTagPayload,
    })
  },
  async delete(productTagServiceId: string) {
    return fetchData({
      url: `/tcgx-marketplace/product-tag/${productTagServiceId}`,
      method: 'DELETE',
    })
  }
}
