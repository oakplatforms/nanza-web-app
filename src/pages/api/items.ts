// src/pages/api/items.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { rows } = await pool.query('SELECT * FROM items');
    res.status(200).json(rows);
  } catch (error: unknown) {  // Type the error as unknown
    if (error instanceof Error) {  // Type guard to check if it is an Error
      res.status(500).json({ error: error.message });
    } else {
      // Handle cases where the error might not be an instance of Error
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
}
