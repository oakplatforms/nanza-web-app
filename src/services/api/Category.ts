import { fetchData } from './index'
import { CategoryDto } from '../../types'

export const categoryService = {
  async get(categoryId: string, parameters = '') {
    return fetchData({ url: `/category/${categoryId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/categories${parameters}` })
  },
  async create(categoryPayload: Omit<CategoryDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/category',
      method: 'POST',
      payload: categoryPayload,
    })
  },
  async update(categoryId: string, categoryPayload: Partial<CategoryDto>) {
    return fetchData({
      url: `/category/${categoryId}`,
      method: 'PUT',
      payload: categoryPayload,
    })
  },
  async delete(categoryId: string) {
    return fetchData({
      url: `/category/${categoryId}`,
      method: 'DELETE',
    })
  }
}
