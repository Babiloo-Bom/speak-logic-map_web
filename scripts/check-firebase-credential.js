#!/usr/bin/env node
/**
 * Kiểm tra file JSON Firebase Service Account có kết nối được hay không.
 *
 * Cách chạy:
 *   node scripts/check-firebase-credential.js
 *   node scripts/check-firebase-credential.js --file=./path/to/firebase-sa.json
 *   FIREBASE_SERVICE_ACCOUNT_JSON=base64:xxx node scripts/check-firebase-credential.js
 *
 * Script sẽ: init Firebase Admin với credential → gửi 1 message test tới token giả.
 * - Nếu credential đúng: FCM trả lỗi "invalid-registration-token" (nghĩa là đã kết nối được tới Google).
 * - Nếu credential sai: lỗi "invalid-credential" / "invalid_grant" / "Invalid JWT Signature".
 */

const path = require('path');
const fs = require('fs');

// Đảm bảo require firebase-admin từ node_modules của project (thư mục gốc repo)
const projectRoot = path.resolve(__dirname, '..');
const firebaseAdminPath = path.join(projectRoot, 'node_modules', 'firebase-admin');
if (!fs.existsSync(path.join(firebaseAdminPath, 'package.json'))) {
  console.error('Chưa cài firebase-admin. Chạy: npm install');
  process.exit(1);
}

function getCredential() {
  const env = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (env) {
    const raw = env.startsWith('base64:')
      ? Buffer.from(env.slice(7), 'base64').toString('utf8')
      : env;
    return JSON.parse(raw);
  }
  const fileArg = process.argv.find((a) => a.startsWith('--file='));
  const filePath = fileArg
    ? fileArg.slice('--file='.length)
    : path.join(__dirname, '..', 'speak-logic-map-7402c-firebase-adminsdk-fbsvc-0727e14dbc.json');
  if (!fs.existsSync(filePath)) {
    console.error('Không tìm thấy file JSON. Dùng --file=/path/to/file.json hoặc set FIREBASE_SERVICE_ACCOUNT_JSON');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  let credential;
  try {
    credential = getCredential();
  } catch (e) {
    console.error('Đọc credential thất bại:', e.message);
    process.exit(1);
  }

  const admin = require(firebaseAdminPath);
  try {
    admin.initializeApp({ credential: admin.credential.cert(credential) });
  } catch (e) {
    console.error('Khởi tạo Firebase Admin thất bại:', e.message);
    process.exit(1);
  }

  // Gửi thử tới 1 token giả để “kéo” credential lên Google. FCM sẽ trả lỗi token, không phải lỗi credential.
  const fakeToken = 'test-connection-check-token';
  try {
    await admin.messaging().send({
      token: fakeToken,
      notification: { title: 'Test', body: 'Check connection' },
    });
    console.log('OK (không mong đợi thành công với token giả)');
  } catch (e) {
    const code = String(e.code || '');
    const message = String(e.message || '');
    const lower = message.toLowerCase();
    const isTokenOrArgError =
      code.includes('invalid-registration-token') ||
      code.includes('registration-token-not-registered') ||
      code.includes('invalid-argument') ||
      lower.includes('invalid-registration-token') ||
      lower.includes('registration-token-not-registered') ||
      lower.includes('invalid-argument');
    if (isTokenOrArgError) {
      console.log('Kết nối Firebase OK. Credential hợp lệ.');
      console.log('(Lỗi token/argument là do dùng token giả để test – bình thường.)');
      process.exit(0);
    }
    if (
      code.includes('invalid-credential') ||
      lower.includes('invalid_grant') ||
      lower.includes('invalid jwt signature') ||
      lower.includes('invalid-credential') ||
      lower.includes('credential implementation')
    ) {
      console.error('Credential không hợp lệ (sai key, key bị thu hồi, hoặc sai format).');
      console.error('Chi tiết:', message);
      process.exit(1);
    }
    console.error('Lỗi khác:', code || message);
    process.exit(1);
  }
}

main();
