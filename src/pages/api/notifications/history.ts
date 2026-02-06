import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';
import pool from '@/lib/database';

/**
 * GET /api/notifications/history
 * Query params: page=1, limit=20
 * Header: Authorization: Bearer <accessToken>
 * Lịch sử thông báo (cho user hoặc toàn hệ thống nếu admin).
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = req.user!;
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const offset = (page - 1) * limit;

  const client = await pool.connect();
  try {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      const list = await client.query(
        `SELECT id, user_id, title, body, data, read_at, created_at
         FROM notifications
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const count = await client.query('SELECT COUNT(*) AS total FROM notifications');
      return res.status(200).json({
        items: list.rows,
        total: parseInt(count.rows[0]?.total ?? '0', 10),
        page,
        limit,
      });
    }

    const list = await client.query(
      `SELECT id, user_id, title, body, data, read_at, created_at
       FROM notifications
       WHERE user_id = $1 OR user_id IS NULL
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );
    const count = await client.query(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = $1 OR user_id IS NULL',
      [user.id]
    );
    return res.status(200).json({
      items: list.rows,
      total: parseInt(count.rows[0]?.total ?? '0', 10),
      page,
      limit,
    });
  } finally {
    client.release();
  }
}

export default requireAuth()(handler);
