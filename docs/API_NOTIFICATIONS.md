# API Notifications (FCM – Mobile)

Backend phục vụ push notification cho mobile: đăng ký FCM token, gửi thông báo tới tất cả thiết bị, lịch sử thông báo.

## Cấu hình

- **Firebase:** Set `FIREBASE_SERVICE_ACCOUNT_JSON` (chuỗi JSON service account) hoặc `GOOGLE_APPLICATION_CREDENTIALS` (đường dẫn file). Lấy từ Firebase Console → Project Settings → Service accounts → Generate new private key.

### Docker (production)

- Trong `docker-compose.prod.yml`, app container đã được truyền `FIREBASE_SERVICE_ACCOUNT_JSON` và `GOOGLE_APPLICATION_CREDENTIALS` từ file `production.env`.
- Nếu JSON dài hoặc có ký tự đặc biệt khiến env bị lỗi, dùng **base64** trong `production.env`:
  - Trên server: `base64 -w0 logic-map-mobile-firebase-adminsdk-....json` → copy chuỗi ra.
  - Trong `production.env`: `FIREBASE_SERVICE_ACCOUNT_JSON=base64:<chuỗi_base64>`.
- Sau khi sửa env, cần **restart app**: `docker compose -f docker-compose.prod.yml --env-file production.env up -d app`.

## Bảng DB

- **device_fcm_tokens:** `user_id`, `fcm_token`, `device_id`, `platform`, `created_at`, `updated_at`. Một token chỉ lưu một lần (UNIQUE), cập nhật `user_id` khi đăng ký lại.
- **notifications:** `id`, `user_id`, `title`, `body`, `data` (JSONB), `read_at`, `created_at`. Dùng cho lịch sử thông báo.

## API

### 1. Đăng ký FCM token (mobile gọi sau khi login)

```http
POST /api/notifications/register-token
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fcmToken": "dG9rZW4...",
  "deviceId": "optional-device-uuid",
  "platform": "android" | "ios" | "web"
}
```

- **fcmToken** (bắt buộc): FCM token từ Firebase Messaging trên thiết bị.
- **deviceId**, **platform**: tùy chọn.
- Trả về: `{ "success": true, "message": "Token registered" }`.

### 2. Gửi thông báo tới tất cả thiết bị (chỉ admin)

```http
POST /api/notifications/send
Authorization: Bearer <adminAccessToken>
Content-Type: application/json

{
  "title": "Tiêu đề",
  "body": "Nội dung (tùy chọn)",
  "data": { "screen": "home", "id": "123" }
}
```

- Backend query tất cả FCM token trong `device_fcm_tokens`, gọi Firebase FCM gửi tới từng token, ghi một bản ghi vào `notifications`.
- Trả về: `{ "success": true, "successCount", "failureCount", "totalTokens" }`.

### 3. Lịch sử thông báo

```http
GET /api/notifications/history?page=1&limit=20
Authorization: Bearer <accessToken>
```

- User thường: chỉ thông báo của user đó (và thông báo broadcast `user_id IS NULL`).
- Admin: toàn bộ thông báo.
- Trả về: `{ "items": [...], "total", "page", "limit" }`.

## Chạy migration (DB đã tồn tại)

Trên server hoặc local, chạy migration thêm bảng:

```bash
psql -U postgres -d function_provider -f migrations/003_device_fcm_tokens_and_notifications.sql
```

Hoặc dùng Docker:

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres -d function_provider -f - < migrations/003_device_fcm_tokens_and_notifications.sql
```

(Nếu dùng `database.sql` init đầy đủ thì đã có sẵn hai bảng, không cần chạy migration 003.)
