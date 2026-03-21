import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';
import pool from '@/lib/database';
import {
  getAllFcmTokens,
  getFcmTokensByUserIds,
  isFirebaseConfigured,
  sendMulticast,
} from '@/lib/firebase-admin';

const MAX_TARGET_USERS = 200;

type ParsedTarget =
  | { mode: 'broadcast' }
  | { mode: 'users'; userIds: number[] }
  | { error: string };

function parseTargetUserIds(body: unknown): ParsedTarget {
  const b = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const arr = b.userIds;
  if (Array.isArray(arr) && arr.length > 0) {
    const ids = Array.from(
      new Set(
        arr
          .map((x) => parseInt(String(x).trim(), 10))
          .filter((n) => !Number.isNaN(n) && n >= 1)
      )
    );
    if (ids.length === 0) return { error: 'userIds must contain positive integers' };
    if (ids.length > MAX_TARGET_USERS) {
      return { error: `Maximum ${MAX_TARGET_USERS} users per request` };
    }
    return { mode: 'users', userIds: ids };
  }
  const single = b.userId;
  if (single !== undefined && single !== null && single !== '') {
    const n = parseInt(String(single), 10);
    if (Number.isNaN(n) || n < 1) return { error: 'userId must be a positive integer' };
    return { mode: 'users', userIds: [n] };
  }
  return { mode: 'broadcast' };
}

async function insertNotificationRows(params: {
  userIds: number[] | null;
  title: string;
  body: string | null;
  dataJson: string | null;
}): Promise<void> {
  const client = await pool.connect();
  try {
    if (params.userIds === null) {
      await client.query(
        `INSERT INTO notifications (user_id, title, body, data)
         VALUES (NULL, $1, $2, $3::jsonb)`,
        [params.title, params.body, params.dataJson]
      );
    } else {
      await client.query(
        `INSERT INTO notifications (user_id, title, body, data)
         SELECT x.id, $1, $2, $3::jsonb
         FROM unnest($4::bigint[]) AS x(id)`,
        [params.title, params.body, params.dataJson, params.userIds]
      );
    }
  } finally {
    client.release();
  }
}

/**
 * POST /api/notifications/send
 * Body:
 * - title: string (bắt buộc)
 * - body?: string
 * - data?: Record<string, string>
 * - userId?: number — một user (tương thích cũ)
 * - userIds?: number[] — nhiều user (ưu tiên hơn userId nếu cả hai có)
 * Không có userId/userIds: broadcast (notifications.user_id = NULL)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, data } = (req.body || {}) as Record<string, unknown>;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  const parsed = parseTargetUserIds(req.body);
  if ('error' in parsed) {
    return res.status(400).json({ error: parsed.error });
  }

  const titleTrim = title.trim();
  const bodyVal = body && typeof body === 'string' ? body : null;
  const dataJson =
    data && typeof data === 'object' && !Array.isArray(data)
      ? JSON.stringify(data)
      : null;

  if (!isFirebaseConfigured()) {
    return res.status(503).json({
      error: 'Firebase chưa cấu hình',
      hint: 'Set FIREBASE_SERVICE_ACCOUNT_JSON hoặc GOOGLE_APPLICATION_CREDENTIALS',
    });
  }

  if (parsed.mode === 'broadcast') {
    const tokens = await getAllFcmTokens();
    if (tokens.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Không có thiết bị nào đăng ký nhận thông báo',
        successCount: 0,
        failureCount: 0,
        totalTokens: 0,
        targetUserId: null,
        targetUserIds: null,
        broadcast: true,
      });
    }
    try {
      const result = await sendMulticast(
        tokens,
        { title: titleTrim, body: bodyVal || '' },
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, string>)
          : undefined
      );
      await insertNotificationRows({ userIds: null, title: titleTrim, body: bodyVal, dataJson });
      return res.status(200).json({
        success: true,
        message: 'Đã gửi thông báo (broadcast)',
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalTokens: tokens.length,
        targetUserId: null,
        targetUserIds: null,
        broadcast: true,
        errors: result.errors,
      });
    } catch (e) {
      console.error('Send notifications error:', e);
      return res.status(500).json({
        error: 'Gửi thông báo thất bại',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  const userIds = parsed.userIds;
  const client = await pool.connect();
  try {
    const found = await client.query<{ id: string }>(
      'SELECT id FROM users WHERE id = ANY($1::bigint[])',
      [userIds]
    );
    const foundSet = new Set(found.rows.map((r) => Number(r.id)));
    const missing = userIds.filter((id) => !foundSet.has(id));
    if (missing.length > 0) {
      return res.status(404).json({
        error: 'Some users not found',
        missingIds: missing,
      });
    }
  } finally {
    client.release();
  }

  const tokens = await getFcmTokensByUserIds(userIds);

  if (tokens.length === 0) {
    await insertNotificationRows({
      userIds,
      title: titleTrim,
      body: bodyVal,
      dataJson,
    });
    return res.status(200).json({
      success: true,
      message:
        userIds.length === 1
          ? 'User chưa đăng ký thiết bị FCM. Đã lưu vào lịch sử.'
          : 'Các user được chọn chưa có thiết bị FCM. Đã lưu vào lịch sử từng user.',
      successCount: 0,
      failureCount: 0,
      totalTokens: 0,
      targetUserId: userIds.length === 1 ? userIds[0] : null,
      targetUserIds: userIds,
      broadcast: false,
    });
  }

  try {
    const result = await sendMulticast(
      tokens,
      { title: titleTrim, body: bodyVal || '' },
      data && typeof data === 'object' && !Array.isArray(data)
        ? (data as Record<string, string>)
        : undefined
    );
    await insertNotificationRows({
      userIds,
      title: titleTrim,
      body: bodyVal,
      dataJson,
    });
    return res.status(200).json({
      success: true,
      message:
        userIds.length === 1
          ? 'Đã gửi thông báo tới user'
          : `Đã gửi thông báo tới ${userIds.length} user`,
      successCount: result.successCount,
      failureCount: result.failureCount,
      totalTokens: tokens.length,
      targetUserId: userIds.length === 1 ? userIds[0] : null,
      targetUserIds: userIds,
      broadcast: false,
      errors: result.errors,
    });
  } catch (e) {
    console.error('Send notifications error:', e);
    return res.status(500).json({
      error: 'Gửi thông báo thất bại',
      detail: e instanceof Error ? e.message : 'Unknown error',
    });
  }
}

export default requireAuth(['admin'])(handler);
