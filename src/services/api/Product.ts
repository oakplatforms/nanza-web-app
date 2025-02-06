import { fetchData } from './index';
import { ProductDto } from '../../types';
import { TempProductDto } from '../../app/forms/Product';

export const productService = {
  async get(productId: string, parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/one-piece/product/${productId}${parameters}` });
  },
  async list(parameters = '') {
    return fetchData({ url: `/tcgx-marketplace/one-piece/products${parameters}` });
  },
  async create(productPayload: Partial<TempProductDto>) {
    return fetchData({
      url: '/tcgx-marketplace/one-piece/product',
      method: 'POST',
      payload: productPayload,
    })
  },
  async update(productId: string, productPayload: Partial<TempProductDto>) {
    return fetchData({
      url: `/tcgx-marketplace/one-piece/product/${productId}`,
      method: 'PUT',
      payload: productPayload,
    })
  },
  async delete(productId: string) {
    return fetchData({
      url: `/tcgx-marketplace/one-piece/product/${productId}`,
      method: 'DELETE',
    })
  }
}
