import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';
import pool from '@/lib/database';

/**
 * GET /api/notifications/history
 *
 * Luôn lọc theo user để tránh trả full DB (tốn băng thông), trừ khi admin chủ động xin toàn hệ thống.
 *
 * Query params:
 * - page=1, limit=20
 * - userId (admin only): xem thông báo của user cụ thể (thay vì user đang đăng nhập)
 * - scope=all (admin only): toàn bộ thông báo mọi user — chỉ dùng khi thật sự cần audit
 * - includeBroadcast=true|false: gồm broadcast (user_id IS NULL), mặc định true
 * - onlyUnread=true|false: chỉ bản ghi chưa đọc
 *
 * Hành vi:
 * - User thường: chỉ thông báo của chính họ (+ broadcast nếu includeBroadcast). Bỏ qua userId/scope trong query.
 * - Admin: mặc định giống user (chỉ inbox admin). userId= → xem user đó. scope=all → toàn hệ thống.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = req.user!;
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const offset = (page - 1) * limit;
  const includeBroadcast = String(req.query.includeBroadcast ?? 'true') !== 'false';
  const onlyUnread = String(req.query.onlyUnread ?? 'false') === 'true';

  const isAdmin = user.role === 'admin';
  const scopeAll = isAdmin && String(req.query.scope) === 'all';

  const parsedUserId = parseInt(String(req.query.userId), 10);
  const hasExplicitUserId = !Number.isNaN(parsedUserId);

  /** User được lấy thông báo: luôn gắn với một user cụ thể (không bao giờ "mọi user" trừ scope=all) */
  let targetUserId: number;
  if (!isAdmin) {
    targetUserId = user.id;
  } else if (hasExplicitUserId) {
    targetUserId = parsedUserId;
  } else {
    targetUserId = user.id;
  }

  const client = await pool.connect();
  try {
    const listParams: unknown[] = [];
    const scopeParts: string[] = [];

    if (scopeAll) {
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      if (onlyUnread) scopeParts.push('read_at IS NULL');
    } else {
      listParams.push(targetUserId);
      const uidParam = `$${listParams.length}`;
      if (includeBroadcast) {
        scopeParts.push(`(user_id = ${uidParam} OR user_id IS NULL)`);
      } else {
        scopeParts.push(`user_id = ${uidParam}`);
      }
      if (onlyUnread) scopeParts.push('read_at IS NULL');
    }

    const whereClause = scopeParts.length ? `WHERE ${scopeParts.join(' AND ')}` : '';

    const list = await client.query(
      `SELECT id, user_id, title, body, data, read_at, created_at,
              (read_at IS NOT NULL) AS is_read
       FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${listParams.length + 1} OFFSET $${listParams.length + 2}`,
      [...listParams, limit, offset]
    );

    const count = await client.query(
      `SELECT COUNT(*) AS total
       FROM notifications
       ${whereClause}`,
      listParams
    );

    /** Số thông báo chưa đọc trong cùng phạm vi (không phụ thuộc onlyUnread của list) */
    let unreadWhereClause: string;
    let unreadParams: unknown[];
    if (scopeAll) {
      unreadWhereClause = 'WHERE read_at IS NULL';
      unreadParams = [];
    } else {
      unreadParams = [targetUserId];
      if (includeBroadcast) {
        unreadWhereClause =
          'WHERE (user_id = $1 OR user_id IS NULL) AND read_at IS NULL';
      } else {
        unreadWhereClause = 'WHERE user_id = $1 AND read_at IS NULL';
      }
    }

    const unreadCount = await client.query(
      `SELECT COUNT(*) AS unread_total FROM notifications ${unreadWhereClause}`,
      unreadParams
    );

    const total = parseInt(count.rows[0]?.total ?? '0', 10);

    return res.status(200).json({
      items: list.rows,
      total,
      unreadCount: parseInt(unreadCount.rows[0]?.unread_total ?? '0', 10),
      page,
      limit,
      hasMore: offset + list.rows.length < total,
      /** Gợi ý client: phạm vi đang lấy (mobile không cần truyền userId — backend dùng JWT) */
      scope: scopeAll ? 'all' : 'user',
      filteredUserId: scopeAll ? null : targetUserId,
    });
  } finally {
    client.release();
  }
}

export default requireAuth()(handler);
