import { fetchData } from './index'
import { EntityTagDto } from '../../types'

export const entityTagService = {
  async create(entityTagPayload: Omit<EntityTagDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/tcgx-marketplace/entity-tag',
      method: 'POST',
      payload: entityTagPayload,
    })
  },
  async delete(entityTagServiceId: string) {
    return fetchData({
      url: `/tcgx-marketplace/entity-tag/${entityTagServiceId}`,
      method: 'DELETE',
    })
  }
}
