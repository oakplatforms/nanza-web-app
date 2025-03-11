import { fetchData } from './index'
import { CategoryDto } from '../../types'

export const categoryService = {
  async get(categoryId: string, parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/category/${categoryId}${parameters}` })
  },
  async list(parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/categories${parameters}` })
  },
  async create(categoryPayload: Omit<CategoryDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/tcgx-marketplace/category',
      method: 'POST',
      payload: categoryPayload,
    })
  },
  async update(categoryId: string, categoryPayload: Partial<CategoryDto>) {
    return fetchData({
      url: `/tcgx-marketplace/category/${categoryId}`,
      method: 'PUT',
      payload: categoryPayload,
    })
  },
  async delete(categoryId: string) {
    return fetchData({
      url: `/tcgx-marketplace/category/${categoryId}`,
      method: 'DELETE',
    })
  }
}
