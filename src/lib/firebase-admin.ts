/**
 * Firebase Admin SDK - khởi tạo và gửi FCM (push notification).
 * Cần set FIREBASE_SERVICE_ACCOUNT_JSON (chuỗi JSON) hoặc GOOGLE_APPLICATION_CREDENTIALS (đường dẫn file).
 */
import * as admin from 'firebase-admin';
import pool from './database';

let firebaseApp: admin.app.App | null = null;

function getFirebaseApp(): admin.app.App | null {
  if (firebaseApp) return firebaseApp;
  try {
    const cred = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (cred) {
      const serviceAccount = JSON.parse(
        cred.startsWith('base64:') ? Buffer.from(cred.slice(7), 'base64').toString('utf8') : cred
      );
      firebaseApp = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      return firebaseApp;
    }
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseApp = admin.initializeApp({ credential: admin.credential.applicationDefault() });
      return firebaseApp;
    }
  } catch (e) {
    console.error('Firebase Admin init error:', e);
  }
  return null;
}

export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

/** Lấy tất cả FCM token từ DB (không trùng, token hợp lệ). */
export async function getAllFcmTokens(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const r = await client.query<{ fcm_token: string }>(
      'SELECT DISTINCT fcm_token FROM device_fcm_tokens WHERE fcm_token IS NOT NULL AND fcm_token != \'\''
    );
    return r.rows.map((row) => row.fcm_token);
  } finally {
    client.release();
  }
}

/** FCM token của một user (nhiều thiết bị). */
export async function getFcmTokensByUserId(userId: number): Promise<string[]> {
  const client = await pool.connect();
  try {
    const r = await client.query<{ fcm_token: string }>(
      `SELECT DISTINCT fcm_token FROM device_fcm_tokens
       WHERE user_id = $1 AND fcm_token IS NOT NULL AND fcm_token != ''`,
      [userId]
    );
    return r.rows.map((row) => row.fcm_token);
  } finally {
    client.release();
  }
}

/** FCM token của nhiều user (gộp tất cả thiết bị, token trùng lặp loại). */
export async function getFcmTokensByUserIds(userIds: number[]): Promise<string[]> {
  if (userIds.length === 0) return [];
  const client = await pool.connect();
  try {
    const r = await client.query<{ fcm_token: string }>(
      `SELECT DISTINCT fcm_token FROM device_fcm_tokens
       WHERE user_id = ANY($1::bigint[]) AND fcm_token IS NOT NULL AND fcm_token != ''`,
      [userIds]
    );
    return r.rows.map((row) => row.fcm_token);
  } finally {
    client.release();
  }
}

/** FCM giới hạn 500 token / lần gửi multicast. */
const FCM_MULTICAST_MAX = 500;

/** Gửi push tới nhiều token qua FCM; trả về số thành công và thất bại. Tự chia chunk. */
export async function sendMulticast(
  tokens: string[],
  notification: { title: string; body?: string },
  data?: Record<string, string>
): Promise<{
  successCount: number;
  failureCount: number;
  failedTokens: string[];
  errors?: { token: string; code?: string; message?: string }[];
}> {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error('Firebase Admin chưa cấu hình (FIREBASE_SERVICE_ACCOUNT_JSON hoặc GOOGLE_APPLICATION_CREDENTIALS)');
  }
  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0, failedTokens: [] };
  }

  let successCount = 0;
  let failureCount = 0;
  const failedTokens: string[] = [];
  const errors: { token: string; code?: string; message?: string }[] = [];

  for (let offset = 0; offset < tokens.length; offset += FCM_MULTICAST_MAX) {
    const chunk = tokens.slice(offset, offset + FCM_MULTICAST_MAX);
    const message: admin.messaging.MulticastMessage = {
      tokens: chunk,
      notification: {
        title: notification.title,
        body: notification.body ?? '',
      },
      data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };
    const result = await admin.messaging().sendEachForMulticast(message);
    successCount += result.successCount;
    failureCount += result.failureCount;
    result.responses.forEach((resp, i) => {
      if (!resp.success) {
        const token = chunk[i];
        failedTokens.push(token);
        const err = (resp as { error?: { code?: string; message?: string } }).error;
        errors.push({
          token: token.slice(0, 20) + '...',
          code: err?.code,
          message: err?.message,
        });
      }
    });
  }

  return {
    successCount,
    failureCount,
    failedTokens,
    errors: errors.length > 0 ? errors : undefined,
  };
}
