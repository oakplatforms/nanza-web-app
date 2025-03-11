import { fetchData } from './index'
import { ShippingCategoryPayload } from '../../types'

export const shippingCategoryService = {
  async get(categoryId: string, parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/shipping-category/${categoryId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/shipping-categories${parameters}` })
  },
  async create(categoryPayload: ShippingCategoryPayload) {
    return fetchData({
      url: '/tcgx-marketplace/shipping-category',
      method: 'POST',
      payload: categoryPayload,
    })
  },
  async update(categoryId: string, categoryPayload: ShippingCategoryPayload) {
    return fetchData({
      url: `/tcgx-marketplace/shipping-category/${categoryId}`,
      method: 'PUT',
      payload: categoryPayload,
    })
  },
  async delete(categoryId: string) {
    return fetchData({
      url: `/tcgx-marketplace/shipping-category/${categoryId}`,
      method: 'DELETE',
    })
  }
}
