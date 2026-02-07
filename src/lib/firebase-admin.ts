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

/** Gửi push tới nhiều token qua FCM; trả về số thành công và thất bại. */
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
  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: notification.title,
      body: notification.body ?? '',
    },
    data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  };
  const result = await admin.messaging().sendEachForMulticast(message);
  const failedTokens: string[] = [];
  const errors: { token: string; code?: string; message?: string }[] = [];
  result.responses.forEach((resp, i) => {
    if (!resp.success) {
      const token = tokens[i];
      failedTokens.push(token);
      const err = (resp as { error?: { code?: string; message?: string } }).error;
      errors.push({
        token: token.slice(0, 20) + '...',
        code: err?.code,
        message: err?.message,
      });
    }
  });
  return {
    successCount: result.successCount,
    failureCount: result.failureCount,
    failedTokens,
    errors: errors.length > 0 ? errors : undefined,
  };
}
