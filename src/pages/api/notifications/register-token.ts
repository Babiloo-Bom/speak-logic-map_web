import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';
import pool from '@/lib/database';

/**
 * POST /api/notifications/register-token
 * Body: { fcmToken: string, deviceId?: string, platform?: string }
 * Header: Authorization: Bearer <accessToken>
 * Đăng ký FCM token của thiết bị cho user đang đăng nhập.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = req.user!;
  const { fcmToken, deviceId, platform } = req.body || {};

  if (!fcmToken || typeof fcmToken !== 'string' || !fcmToken.trim()) {
    return res.status(400).json({ error: 'fcmToken is required' });
  }

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO device_fcm_tokens (user_id, fcm_token, device_id, platform, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (fcm_token) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         device_id = COALESCE(EXCLUDED.device_id, device_fcm_tokens.device_id),
         platform = COALESCE(EXCLUDED.platform, device_fcm_tokens.platform),
         updated_at = CURRENT_TIMESTAMP`,
      [user.id, fcmToken.trim(), deviceId?.trim() || null, platform?.trim() || null]
    );
    return res.status(200).json({ success: true, message: 'Token registered' });
  } catch (e) {
    console.error('Register FCM token error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

export default requireAuth()(handler);
