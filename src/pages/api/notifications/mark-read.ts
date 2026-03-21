import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';
import pool from '@/lib/database';

/**
 * POST /api/notifications/mark-read
 * Body:
 * - { notificationId: number }
 * - { notificationIds: number[] }
 * - { markAll: true, includeBroadcast?: boolean }
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = req.user!;
  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const isAdmin = user.role === 'admin';

  const client = await pool.connect();
  try {
    // Mark all unread for current user scope
    if (body.markAll === true) {
      const includeBroadcast = body.includeBroadcast !== false;
      const whereClause = includeBroadcast
        ? '(user_id = $1 OR user_id IS NULL) AND read_at IS NULL'
        : 'user_id = $1 AND read_at IS NULL';
      const update = await client.query(
        `UPDATE notifications
         SET read_at = CURRENT_TIMESTAMP
         WHERE ${whereClause}`,
        [user.id]
      );
      return res.status(200).json({ success: true, updatedCount: update.rowCount ?? 0 });
    }

    const singleId = Number.isInteger(Number(body.notificationId)) ? Number(body.notificationId) : null;
    const manyIds = Array.isArray(body.notificationIds)
      ? body.notificationIds.map((v: any) => Number(v)).filter((v: number) => Number.isInteger(v))
      : [];

    const ids = singleId != null ? [singleId] : manyIds;
    if (ids.length === 0) {
      return res.status(400).json({ error: 'notificationId or notificationIds is required' });
    }

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const params: any[] = [...ids];

    // Non-admin can only mark their own or broadcast notifications
    if (isAdmin) {
      const update = await client.query(
        `UPDATE notifications
         SET read_at = CURRENT_TIMESTAMP
         WHERE id IN (${placeholders})`,
        params
      );
      return res.status(200).json({ success: true, updatedCount: update.rowCount ?? 0 });
    }

    params.push(user.id);
    const update = await client.query(
      `UPDATE notifications
       SET read_at = CURRENT_TIMESTAMP
       WHERE id IN (${placeholders})
         AND (user_id = $${params.length} OR user_id IS NULL)`,
      params
    );
    return res.status(200).json({ success: true, updatedCount: update.rowCount ?? 0 });
  } catch (e) {
    console.error('Mark notification read error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

export default requireAuth()(handler);

