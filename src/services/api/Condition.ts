import { fetchData } from './index'
import { ConditionPayload } from '../../types'

export const conditionService = {
  async get(conditionId: string, parameters = '') {
    return fetchData({ url: `/condition/${conditionId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/conditions${parameters}` })
  },
  async create(conditionPayload: ConditionPayload) {
    return fetchData({
      url: '/condition',
      method: 'POST',
      payload: conditionPayload,
    })
  },
  async update(conditionId: string, conditionPayload: ConditionPayload) {
    return fetchData({
      url: `/condition/${conditionId}`,
      method: 'PUT',
      payload: conditionPayload,
    })
  },
  async delete(conditionId: string) {
    return fetchData({
      url: `/condition/${conditionId}`,
      method: 'DELETE',
    })
  }
}