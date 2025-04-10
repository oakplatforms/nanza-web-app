import { fetchData } from './index'
import { SupportedTagValuesDto } from '../../types'

export const supportedTagValueService = {
  async create(supportedTagValuePayload: Omit<SupportedTagValuesDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/supported-tag-value',
      method: 'POST',
      payload: supportedTagValuePayload,
    })
  },
  async delete(supportedTagValueId: string) {
    return fetchData({
      url: `/supported-tag-value/${supportedTagValueId}`,
      method: 'DELETE',
    })
  }
}
