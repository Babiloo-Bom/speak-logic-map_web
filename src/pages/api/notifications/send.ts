import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';
import pool from '@/lib/database';
import { getAllFcmTokens, isFirebaseConfigured, sendMulticast } from '@/lib/firebase-admin';

/**
 * POST /api/notifications/send
 * Body: { title: string, body?: string, data?: Record<string, string> }
 * Header: Authorization: Bearer <accessToken>
 * Chỉ admin. Query tất cả FCM token, gửi push qua Firebase tới mọi thiết bị.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, data } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (!isFirebaseConfigured()) {
    return res.status(503).json({
      error: 'Firebase chưa cấu hình',
      hint: 'Set FIREBASE_SERVICE_ACCOUNT_JSON hoặc GOOGLE_APPLICATION_CREDENTIALS',
    });
  }

  const tokens = await getAllFcmTokens();
  if (tokens.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'Không có thiết bị nào đăng ký nhận thông báo',
      successCount: 0,
      failureCount: 0,
    });
  }

  try {
    const result = await sendMulticast(
      tokens,
      { title: title.trim(), body: (body && typeof body === 'string' ? body : '') || '' },
      data && typeof data === 'object' ? data : undefined
    );

    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO notifications (user_id, title, body, data)
         VALUES (NULL, $1, $2, $3)`,
        [title.trim(), (body && typeof body === 'string' ? body : null) || null, data ? JSON.stringify(data) : null]
      );
    } finally {
      client.release();
    }

    return res.status(200).json({
      success: true,
      message: 'Đã gửi thông báo',
      successCount: result.successCount,
      failureCount: result.failureCount,
      totalTokens: tokens.length,
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
