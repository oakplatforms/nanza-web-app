import { fetchData } from './index'
import { ShippingOptionDto } from '../../types'

export const shippingOptionService = {
  async get(shippingOptionId: string, parameters = '') {
    return fetchData({ url: `/shipping-option/${shippingOptionId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/shipping-options${parameters}` })
  },
  async create(shippingOptionPayload: Omit<ShippingOptionDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/shipping-option',
      method: 'POST',
      payload: shippingOptionPayload,
    })
  },
  async update(shippingOptionId: string, shippingOptionPayload: Partial<ShippingOptionDto>) {
    return fetchData({
      url: `/shipping-option/${shippingOptionId}`,
      method: 'PUT',
      payload: shippingOptionPayload,
    })
  },
  async delete(shippingOptionId: string) {
    return fetchData({
      url: `/shipping-option/${shippingOptionId}`,
      method: 'DELETE',
    })
  }
}
