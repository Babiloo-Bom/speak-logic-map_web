# Deploy lên server

Hướng dẫn deploy ứng dụng lên server Ubuntu (domain map.rugal.vn hoặc IP của bạn).

---

## Hai cách deploy

| Cách | Khi nào dùng |
|------|----------------|
| **Tự động (CI/CD)** | Push code lên nhánh `main` → GitHub Actions build image → push GHCR → SSH vào server chạy `deploy.sh`. |
| **Thủ công** | SSH vào server → `git pull` → chạy `./deploy.sh` (server tự pull image từ GHCR). |

---

## A. Chuẩn bị một lần (server + GitHub)

### 1. Trên server Ubuntu

- Cài Docker + Docker Compose v2, Git, Nginx (xem [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)).
- Clone repo (hoặc copy project) vào **`/opt/speak-logic-map_web`**:

```bash
sudo mkdir -p /opt
sudo git clone https://github.com/YOUR_USERNAME/speak-logic-map_web.git /opt/speak-logic-map_web
sudo chown -R $USER:$USER /opt/speak-logic-map_web
cd /opt/speak-logic-map_web
```

- Tạo file **production.env** (copy từ `production.env` mẫu hoặc từ repo, **không commit**):

```bash
cp production.env production.env.local
nano production.env.local
# Đổi tên hoặc dùng luôn production.env (đã có trong .gitignore)
```

Điền đủ biến, **bắt buộc**:

- `APP_IMAGE=ghcr.io/YOUR_GITHUB_USER/speak-logic-map_web:latest` (thay YOUR_GITHUB_USER bằng owner repo, viết thường).
- `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`).
- `NEXTAUTH_URL`, `API_URL`, `FRONTEND_URL` = `https://map.rugal.vn` (hoặc domain của bạn).
- `ALLOWED_ORIGINS`, `ALLOWED_HOSTS` theo domain.
- **Firebase FCM:** `FIREBASE_SERVICE_ACCOUNT_JSON=base64:...` hoặc copy nội dung JSON (một dòng). Nếu dùng file: copy file JSON lên server và set `GOOGLE_APPLICATION_CREDENTIALS=/opt/speak-logic-map_web/secrets/firebase-sa.json`.

```bash
chmod 600 production.env
chmod +x deploy.sh
```

- Cấu hình Nginx + SSL (Let's Encrypt) theo [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md).

### 2. Trên GitHub (để CI/CD deploy tự động)

Vào **Repo → Settings → Secrets and variables → Actions**, thêm:

| Secret | Mô tả |
|--------|--------|
| `SERVER_HOST` | IP hoặc hostname server (vd. `123.45.67.89`) |
| `SERVER_USER` | User SSH (vd. `ubuntu` hoặc `root`) |
| `SERVER_SSH_KEY` | Nội dung private key SSH (để GitHub SSH vào server) |
| `SERVER_SSH_PORT` | (Tùy chọn) Port SSH, mặc định 22 |
| `GHCR_PULL_TOKEN` | (Tùy chọn) GitHub PAT có quyền `read:packages` — chỉ cần nếu **package GHCR để private**. Nếu để public thì bỏ trống. |

---

## B. Deploy tự động (CI/CD)

1. Đẩy code lên nhánh **main** (hoặc **master**):

```bash
git push origin main
```

2. GitHub Actions sẽ:
   - Build Docker image.
   - Push lên **ghcr.io/&lt;owner&gt;/speak-logic-map_web:latest**.
   - SSH vào server, vào thư mục `/opt/speak-logic-map_web`, chạy `git fetch` + `git reset --hard origin/main` rồi **./deploy.sh**.

3. Trên server, `deploy.sh` sẽ:
   - Pull image mới từ GHCR.
   - `docker compose down` → `docker compose up -d` với **production.env**.
   - Health check `http://localhost:1040/api/hello`.

4. Kiểm tra:
   - Trên server: `curl http://localhost:1040/api/hello`
   - Từ ngoài: `https://map.rugal.vn/api/hello`

---

## C. Deploy thủ công (trên server)

Khi không dùng CI/CD hoặc muốn deploy tay:

```bash
ssh user@your-server-ip
cd /opt/speak-logic-map_web

# Lấy code mới (và dùng đúng image từ GHCR)
git fetch origin
git reset --hard origin/main   # hoặc origin/master

# Quan trọng: production.env phải có APP_IMAGE=ghcr.io/owner/repo:latest
# Nếu image private: export GHCR_PULL_TOKEN="ghp_xxx" trước khi chạy
chmod +x deploy.sh
./deploy.sh
```

Script sẽ pull image, down/up container, health check. Xem log: `docker compose -f docker-compose.prod.yml logs -f app`.

---

## D. Sau khi deploy lần đầu (DB đã có sẵn)

Nếu database đã tồn tại **trước khi** có bảng FCM/notifications, cần chạy migration một lần:

```bash
cd /opt/speak-logic-map_web
cat migrations/003_device_fcm_tokens_and_notifications.sql | \
  docker compose -f docker-compose.prod.yml --env-file production.env exec -T postgres \
  psql -U postgres -d function_provider
```

Nếu DB khởi tạo từ **database.sql** (init từ đầu) thì đã có sẵn bảng, không cần chạy migration trên.

---

## E. Thêm admin trên server

```bash
cd /opt/speak-logic-map_web
./scripts/add-admin.sh admin@example.com
```

---

## F. Lỗi thường gặp

- **Pull image failed (401):** Package GHCR đang private. Thêm secret `GHCR_PULL_TOKEN` (PAT có quyền read:packages) hoặc đổi package sang public.
- **Health check failed:** Xem log `docker compose -f docker-compose.prod.yml logs app`. Thường do thiếu env (DB, JWT, Firebase).
- **Firebase invalid credential:** Kiểm tra lại `FIREBASE_SERVICE_ACCOUNT_JSON` hoặc file tại `GOOGLE_APPLICATION_CREDENTIALS` (key mới, đúng project).

---

## Tóm tắt nhanh

1. **Một lần:** Cài Docker, clone repo vào `/opt/speak-logic-map_web`, tạo **production.env** (APP_IMAGE, DB, JWT, NEXTAUTH, Firebase), Nginx + SSL, GitHub Secrets (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY).
2. **Mỗi lần deploy:** Push `main` (CI/CD tự deploy) hoặc SSH vào server chạy `./deploy.sh`.
3. **DB cũ chưa có bảng FCM:** Chạy migration 003 một lần.
4. **Thêm admin:** `./scripts/add-admin.sh email@example.com`.
