# API Notifications (FCM – Mobile)

Backend phục vụ push notification cho mobile: đăng ký FCM token, gửi thông báo tới tất cả thiết bị, lịch sử thông báo.

## Cấu hình

- **Firebase:** Set `FIREBASE_SERVICE_ACCOUNT_JSON` (chuỗi JSON service account) hoặc `GOOGLE_APPLICATION_CREDENTIALS` (đường dẫn file). Lấy từ Firebase Console → Project Settings → Service accounts → Generate new private key.

### Kiểm tra credential có kết nối được hay không

Chạy script (từ thư mục gốc project). Lần đầu cần cài dependency: **`npm install`** (project đã có `firebase-admin` trong package.json).

```bash
node scripts/check-firebase-credential.js
```

Hoặc chỉ định file JSON:

```bash
node scripts/check-firebase-credential.js --file=./logic-map-mobile-firebase-adminsdk-fbsvc-89e59e32fa.json
```

Hoặc dùng biến môi trường (chuỗi JSON hoặc base64):

```bash
FIREBASE_SERVICE_ACCOUNT_JSON=base64:xxx node scripts/check-firebase-credential.js
```

- Nếu in ra **"Kết nối Firebase OK. Credential hợp lệ."** → file/credential đúng, có thể dùng.
- Nếu báo **"Credential không hợp lệ"** hoặc **Invalid JWT Signature** → cần tạo lại key trong Firebase Console hoặc kiểm tra format (dùng base64 nếu paste JSON bị lỗi).

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

### 1b. Danh sách user cho admin (dropdown — tên & email)

```http
GET /api/notifications/user-options?q=&limit=80
Authorization: Bearer <adminAccessToken>
```

- Chỉ **admin**. Dùng cho UI chọn người nhận thông báo (không cần nhập ID).
- **`q`** (tùy chọn): tìm theo email, `first_name`, `last_name`, hoặc họ tên đầy đủ (ILIKE). Để trống = trả danh sách đầu (sắp xếp theo email).
- **`limit`**: tối đa 200, mặc định 80.
- Trả về: `{ "items": [{ "id": number, "email": string, "label": string }] }` — `label` dạng `"Họ tên — email"`, hoặc chỉ `email` nếu profile chưa có tên.

### 2. Gửi thông báo (chỉ admin)

**Broadcast — tất cả thiết bị đã đăng ký**

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

- Không gửi `userId` / `userIds`: lấy mọi FCM token trong `device_fcm_tokens`, gửi multicast; ghi **một** bản ghi `notifications` với `user_id = NULL` (broadcast).

**Gửi cho một hoặc nhiều user**

```json
{
  "title": "Riêng cho bạn",
  "body": "Nội dung",
  "userIds": [42, 7, 15]
}
```

- `userIds`: mảng id trong bảng `users` (tối đa **200** id, trùng sẽ bỏ). Gửi tới mọi FCM token của các user đó; ghi **một bản ghi lịch sử cho mỗi user** (cùng title/body).
- Tương thích cũ: có thể gửi **`userId`** (số) thay cho mảng một phần tử.
- Nếu có id không tồn tại: `404`, `{ "error", "missingIds": [...] }`.
- Nếu user chưa có thiết bị FCM: `200`, vẫn ghi lịch sử cho từng user (không gửi được push).

- Trả về: `{ "success", "message", "successCount", "failureCount", "totalTokens", "targetUserId" (nếu 1 user), "targetUserIds", "broadcast", "errors"? }`.

**Tại sao `successCount: 0`, `failureCount: 1`?**  
Thường do token trong DB **không phải FCM token thật**: token test (vd. `"test-device-token-123"`) hoặc token hết hạn. Firebase chỉ chấp nhận token do Firebase SDK trên app (Android/iOS/Web) cấp. Khi gửi thất bại, response có thêm `errors` với `code` (vd. `messaging/invalid-registration-token`) để kiểm tra.

### 3. Lịch sử thông báo

```http
GET /api/notifications/history?page=1&limit=20&includeBroadcast=true&onlyUnread=false
Authorization: Bearer <accessToken>
```

**Lọc theo user (mặc định, tiết kiệm băng thông):**

- **User thường:** chỉ thông báo của chính user trong JWT (và broadcast `user_id IS NULL` nếu `includeBroadcast=true`). Tham số `userId` / `scope` bị bỏ qua.
- **Admin:** mặc định giống user — chỉ inbox của **tài khoản admin đang gọi API**. Để xem inbox user khác: `?userId=<id>`.
- **Admin — toàn hệ thống (tùy chọn):** `?scope=all` trả mọi bản ghi trong bảng `notifications` (chỉ dùng khi audit; tốn băng thông). Khi có `scope=all`, không cần/không dùng `userId` để lọc inbox.

Trả về: `{ "items", "total", "unreadCount", "page", "limit", "hasMore", "scope": "user"|"all", "filteredUserId": number|null }`.

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

---

## Test local với Docker

Chạy toàn bộ stack (Postgres + app) ở máy local, dùng file Firebase SA có sẵn trong repo.

### Bước 1: Chuẩn bị

- Có file **Firebase Service Account JSON** trong thư mục gốc project:  
  `logic-map-mobile-firebase-adminsdk-fbsvc-89e59e32fa.json`  
  (trong `docker-compose.yml` đã mount file này vào container → app tự dùng qua `GOOGLE_APPLICATION_CREDENTIALS`).
- **Lần đầu** hoặc khi muốn DB sạch: xóa volume Postgres rồi up lại để init từ `database.sql` (đã gồm bảng `device_fcm_tokens`, `notifications`):

```bash
docker compose down -v
docker compose up -d --build
```

- Nếu **không** xóa volume (giữ data cũ), sau khi up cần chạy migration 003 nếu chưa có 2 bảng:

```bash
# PowerShell (Windows)
Get-Content .\migrations\003_device_fcm_tokens_and_notifications.sql | docker compose exec -T postgres psql -U postgres -d function_provider

# Linux / macOS
cat migrations/003_device_fcm_tokens_and_notifications.sql | docker compose exec -T postgres psql -U postgres -d function_provider
```

### Bước 2: Chạy Docker

```bash
docker compose up -d --build
```

Đợi app healthy (khoảng 30–60 giây). App: `http://localhost:3000`, Adminer: `http://localhost:8080`.

### Bước 3: Tạo user + admin (nếu cần)

- Đăng ký/đăng nhập 1 user qua app (Google/Email...).
- Gán role admin qua Adminer hoặc script:
  - **Windows (PowerShell):** không có `add-admin.sh`, dùng Adminer: vào bảng `users` → sửa `role` = `admin` cho user đó.
  - **Linux/macOS:**  
    `chmod +x scripts/add-admin.sh && ./scripts/add-admin.sh your@email.com`

### Bước 4: Test API

1. **Lấy access token**  
   Đăng nhập qua UI hoặc API login, copy JWT (access token).

2. **Đăng ký FCM token (user bất kỳ)**

```bash
curl -X POST http://localhost:3000/api/notifications/register-token \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"fcmToken\":\"test-token-123\",\"platform\":\"android\"}"
```

3. **Gửi thông báo (chỉ admin)**

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test local\",\"body\":\"Hello from Docker\"}"
```

4. **Lịch sử thông báo**

```bash
curl "http://localhost:3000/api/notifications/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Lưu ý local

- `docker-compose.yml` dùng **database.sql** cho init DB (đã có bảng FCM). Nếu bạn vẫn dùng `init-database.sql` riêng, cần thêm nội dung từ `migrations/003_device_fcm_tokens_and_notifications.sql` vào đó.
- Firebase: ưu tiên file mount `logic-map-mobile-firebase-adminsdk-fbsvc-89e59e32fa.json`. Muốn dùng env thì tạo `.env` với `FIREBASE_SERVICE_ACCOUNT_JSON=...` (hoặc base64); khi đó có thể bỏ mount file trong `docker-compose.yml` nếu muốn.

---

## Test bằng Postman

### Cách 1: Import collection (nhanh)

1. Mở Postman → **Import** → chọn file **`docs/postman/Notifications-API.postman_collection.json`** (và nếu có **`Notifications-API.postman_environment.json`** thì import luôn).
2. Chọn environment **Local** (hoặc tạo Environment với biến `base_url` = `http://localhost:3000`, `accessToken` để trống).
3. Request **Auth – Login**: chỉnh body `email` / `password` → Send. Token sẽ tự lưu vào biến `accessToken` (script trong request).
4. Các request còn lại (Register token, Send, History) dùng sẵn `{{accessToken}}`.

### Cách 2: Tạo tay từng request

**Biến môi trường (Environment):**

| Variable     | Initial / Current value     |
|-------------|------------------------------|
| `base_url`  | `http://localhost:3000`     |
| `accessToken` | (để trống, lấy từ Login) |

---

**1. Login – lấy access token**

- **Method:** POST  
- **URL:** `{{base_url}}/api/auth/login`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**

```json
{
  "email": "your@email.com",
  "password": "your_password"
}
```

- **Tests** (tab Tests, để lưu token cho request sau):

```js
var json = pm.response.json();
if (json.accessToken) {
  pm.environment.set("accessToken", json.accessToken);
}
```

Sau khi Send, copy giá trị `accessToken` trong response vào biến `accessToken` của environment (hoặc dùng script trên để set tự động).

---

**2. Đăng ký FCM token**

- **Method:** POST  
- **URL:** `{{base_url}}/api/notifications/register-token`  
- **Headers:**  
  - `Content-Type: application/json`  
  - `Authorization: Bearer {{accessToken}}`  
- **Body (raw JSON):**

```json
{
  "fcmToken": "test-device-token-123",
  "deviceId": "optional-device-uuid",
  "platform": "android"
}
```

---

**3. Gửi thông báo (chỉ admin)**

- **Method:** POST  
- **URL:** `{{base_url}}/api/notifications/send`  
- **Headers:**  
  - `Content-Type: application/json`  
  - `Authorization: Bearer {{accessToken}}`  
- **Body (raw JSON):**

```json
{
  "title": "Test từ Postman",
  "body": "Nội dung thông báo",
  "data": {
    "screen": "home",
    "id": "123"
  }
}
```

*(Dùng account đã set `role = admin`; token lấy từ bước 1 với user admin.)*

---

**4. Lịch sử thông báo**

- **Method:** GET  
- **URL:** `{{base_url}}/api/notifications/history?page=1&limit=20`  
- **Headers:** `Authorization: Bearer {{accessToken}}`

---

### Thứ tự test gợi ý

1. **Login** (email/password user đã có trong DB) → kiểm tra response có `accessToken`.
2. **Register FCM token** → kiểm tra `"success": true`.
3. **Send** (nếu dùng user admin) → kiểm tra `successCount` / `totalTokens`.
4. **History** → kiểm tra `items` có bản ghi vừa gửi.
