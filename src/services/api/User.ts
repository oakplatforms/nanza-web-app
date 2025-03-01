import { fetchData } from './index'
import { UserDto } from '../../types'

export const userService = {
  async get(userId: string, parameters = '') {
    return fetchData({ url: `/user/${userId}${parameters}` })
  },
  async create(userPayload: Omit<UserDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/user',
      method: 'POST',
      payload: userPayload,
    })
  },
  async update(userId: string, userPayload: Partial<UserDto>) {
    return fetchData({
      url: `/user/${userId}`,
      method: 'PUT',
      payload: userPayload,
    })
  },
  async delete(userId: string) {
    return fetchData({
      url: `/user/${userId}`,
      method: 'DELETE',
    })
  }
}
