import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';
import pool from '@/lib/database';

/**
 * GET /api/notifications/user-options?q=&limit=
 * Chỉ admin. Dùng cho dropdown chọn người nhận thông báo (hiển thị tên + email).
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = String(req.query.q ?? '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit), 10) || 80));

  const client = await pool.connect();
  try {
    if (!q) {
      const r = await client.query<{
        id: string;
        email: string;
        full_name: string | null;
      }>(
        `SELECT u.id, u.email,
                NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), '') AS full_name
         FROM users u
         LEFT JOIN profiles p ON p.user_id = u.id
         ORDER BY u.email ASC
         LIMIT $1`,
        [limit]
      );
      return res.status(200).json({ items: mapRows(r.rows) });
    }

    const pattern = `%${q}%`;
    const r = await client.query<{
      id: string;
      email: string;
      full_name: string | null;
    }>(
      `SELECT u.id, u.email,
              NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), '') AS full_name
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.email ILIKE $1
          OR COALESCE(p.first_name, '') ILIKE $1
          OR COALESCE(p.last_name, '') ILIKE $1
          OR TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))) ILIKE $1
       ORDER BY u.email ASC
       LIMIT $2`,
      [pattern, limit]
    );
    return res.status(200).json({ items: mapRows(r.rows) });
  } catch (e) {
    console.error('user-options error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

function mapRows(
  rows: { id: string; email: string; full_name: string | null }[]
): { id: number; email: string; label: string }[] {
  return rows.map((row) => {
    const id = Number(row.id);
    const name = row.full_name?.trim();
    const label = name ? `${name} — ${row.email}` : row.email;
    return { id, email: row.email, label };
  });
}

export default requireAuth(['admin'])(handler);
