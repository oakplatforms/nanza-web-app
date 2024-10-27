import { NextApiRequest, NextApiResponse } from 'next';
import { productService } from '../../../services/productService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const product = await productService.get(id as string);
        res.status(200).json(product);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
      }
      break;

    case 'PUT':
      try {
        const updatedProduct = await productService.update(id as string, req.body);
        res.status(200).json(updatedProduct);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
      }
      break;

    case 'DELETE':
      try {
        const deletedProduct = await productService.delete(id as string);
        res.status(200).json(deletedProduct);
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
