import { NextApiRequest, NextApiResponse } from 'next';
import { productService } from '../../../services/productService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      try {
        const products = await productService.list();
        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
      }
      break;

    case 'POST':
      try {
        const newProduct = await productService.create(req.body);
        res.status(201).json(newProduct);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};


// move this into the components and use api services directly