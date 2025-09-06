import type { NextApiRequest, NextApiResponse } from 'next';
import { initDatabase } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple security check - only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Database initialization not allowed in production' });
  }

  try {
    await initDatabase();
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
}


