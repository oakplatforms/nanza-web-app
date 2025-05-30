import { fetchData } from './index'
import { ShippingMethodPayload } from '../../types'

export const shippingMethodService = {
  async get(categoryId: string, parameters = '') {
    return fetchData({ url: `/shipping-method/${categoryId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/shipping-methods${parameters}` })
  },
  async create(shipmentMethodPayload: ShippingMethodPayload) {
    return fetchData({
      url: '/shipping-method',
      method: 'POST',
      payload: shipmentMethodPayload,
    })
  },
  async update(categoryId: string, shipmentMethodPayload: ShippingMethodPayload) {
    return fetchData({
      url: `/shipping-method/${categoryId}`,
      method: 'PUT',
      payload: shipmentMethodPayload,
    })
  },
  async delete(categoryId: string) {
    return fetchData({
      url: `/shipping-method/${categoryId}`,
      method: 'DELETE',
    })
  }
}
