import { fetchData } from './index';
import { TagDto } from '../../types';

export const tagService = {
  async get(tagId: string, parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/tag/${tagId}${parameters}` });
  },
  async list(parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/tags${parameters}` });
  },
  async create(tagPayload: Omit<TagDto, 'id' | 'createdAt' | 'updatedAt'>) {
    return fetchData({
      url: '/tcgx-marketplace/tag',
      method: 'POST',
      payload: tagPayload,
    });
  },
  async update(tagId: string, tagPayload: Partial<TagDto>) {
    return fetchData({
      url: `/tcgx-marketplace/tag/${tagId}`,
      method: 'PUT',
      payload: tagPayload,
    });
  },
  async delete(tagId: string) {
    return fetchData({
      url: `/tcgx-marketplace/tag/${tagId}`,
      method: 'DELETE',
    });
  }
};
