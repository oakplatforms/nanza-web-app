import { query } from '../db';
import { ProductDto } from '../../types'; // Ensure you import the correct types

export const productService = {
  async get(productId: string, parameters = '') {
    const result = await query('SELECT * FROM products WHERE id = $1', [productId]);
    return result.rows[0];
  },
  async list(parameters = '') {
    const result = await query('SELECT * FROM products');
    return result.rows;
  },
  async create(productPayload: Omit<ProductDto, 'id' | 'createdAt' | 'updatedAt'>) {
    const { name, price, description } = productPayload;
    const result = await query(
      'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
      [name, price, description]
    );
    return result.rows[0];
  },
  async update(productId: string, productPayload: Partial<ProductDto>) {
    const { name, price, description } = productPayload;
    const result = await query(
      'UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, price, description, productId]
    );
    return result.rows[0];
  },
  async delete(productId: string) {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);
    return result.rows[0];
  }
};


// instead of await query USE await fetchData