# Hướng dẫn Deploy Server - map.rugal.vn

## Tổng quan

Hướng dẫn này sẽ giúp bạn deploy ứng dụng **Speak Logic Map Web** lên production server với domain `map.rugal.vn`.

## Yêu cầu hệ thống

- **OS**: Ubuntu 20.04+ hoặc Debian 11+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **Disk**: Tối thiểu 20GB
- **Network**: Public IP với ports 80, 443 mở
- **Domain**: `map.rugal.vn` đã được cấu hình DNS

## Bước 1: Chuẩn bị Server

### 1.1. Cập nhật hệ thống

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2. Cài đặt Docker và Docker Compose

```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user vào docker group
sudo usermod -aG docker $USER

# Cài đặt Docker Compose v2
sudo apt install docker-compose-plugin -y

# Khởi động lại để áp dụng thay đổi
newgrp docker

# Kiểm tra cài đặt
docker --version
docker compose version
```

### 1.3. Cài đặt các công cụ cần thiết

```bash
sudo apt install -y git curl wget nginx certbot python3-certbot-nginx
```

## Bước 2: Cấu hình DNS

Thêm các records sau vào DNS provider:

```
Type    Name    Value           TTL
A       @       YOUR_SERVER_IP  3600
A       www     YOUR_SERVER_IP  3600
```

Kiểm tra DNS:
```bash
dig map.rugal.vn +short
nslookup map.rugal.vn
```

## Bước 3: Clone Repository và Setup

### 3.1. Clone repository

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone git@github.com:YOUR_USERNAME/speak-logic-map_web.git
sudo chown -R $USER:$USER /var/www/speak-logic-map_web
cd /var/www/speak-logic-map_web
```

### 3.2. Tạo file production.env

```bash
# File mẫu đã có trong repo; copy ra và chỉnh
cp env.example production.env
nano production.env
```

Điền các giá trị quan trọng:
- `NEXTAUTH_URL=https://map.rugal.vn`
- `API_URL=https://map.rugal.vn`
- `FRONTEND_URL=https://map.rugal.vn`
- `ALLOWED_ORIGINS=https://map.rugal.vn,https://www.map.rugal.vn`
- `ALLOWED_HOSTS=map.rugal.vn,www.map.rugal.vn`
- Generate secrets: `openssl rand -base64 32`

Set permissions:
```bash
chmod 600 production.env
```

## Bước 4: Cấu hình Nginx

### 4.1. Copy nginx config

```bash
sudo cp nginx.prod.conf /etc/nginx/sites-available/map.rugal.vn.conf
sudo ln -s /etc/nginx/sites-available/map.rugal.vn.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### 4.2. Test và reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Bước 5: Setup SSL với Let's Encrypt

```bash
sudo certbot --nginx -d map.rugal.vn -d www.map.rugal.vn
sudo certbot renew --dry-run
```

## Bước 6: Deploy Docker Containers

### 6.1. Image từ GHCR (khuyến nghị)

Trong `production.env` set `APP_IMAGE=ghcr.io/<owner>/speak-logic-map_web:latest`. Deploy dùng script:

```bash
cd /opt/speak-logic-map_web   # hoặc /var/www/speak-logic-map_web
./deploy.sh
```

Script sẽ pull image từ GHCR (login nếu có `GHCR_PULL_TOKEN`), rồi `docker compose up -d`.

### 6.2. Start containers

```bash
docker compose -f docker-compose.prod.yml --env-file production.env up -d
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

### 6.3. Kiểm tra health

```bash
curl http://localhost:1040/api/hello
curl https://map.rugal.vn/api/hello
```

## Bước 7: Cấu hình Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## Bước 8: Cấu hình OAuth Providers

### Google OAuth
- Google Cloud Console → OAuth 2.0 Client ID
- Redirect URI: `https://map.rugal.vn/api/auth/google/callback`

### Facebook OAuth
- Facebook Developers → App Settings
- Redirect URI: `https://map.rugal.vn/api/auth/facebook/callback`

### Apple OAuth
- Apple Developer → Service ID
- Return URL: `https://map.rugal.vn/api/auth/apple/callback`

## Bước 9: Kiểm tra và Testing

```bash
# Kiểm tra containers
docker compose -f docker-compose.prod.yml ps

# Xem logs
docker compose -f docker-compose.prod.yml logs app --tail=50

# Test từ browser
# Mở https://map.rugal.vn và kiểm tra:
# - SSL certificate (lock icon)
# - Đăng nhập/đăng ký
# - OAuth login
# - Các chức năng chính
```

## Bước 10: Deploy Updates

### Sử dụng deploy.sh (khuyến nghị)

```bash
cd /opt/speak-logic-map_web   # hoặc /var/www/speak-logic-map_web
# Nếu image GHCR private: export GHCR_PULL_TOKEN="ghp_xxx"
./deploy.sh
```

Script: git pull → pull image từ GHCR (theo APP_IMAGE trong production.env) → down/up containers → health check.

### Manual deploy

```bash
cd /opt/speak-logic-map_web
git fetch origin && git reset --hard origin/main
docker pull ghcr.io/<owner>/speak-logic-map_web:latest
export APP_IMAGE=ghcr.io/<owner>/speak-logic-map_web:latest
docker compose -f docker-compose.prod.yml --env-file production.env up -d --force-recreate
docker image prune -f
```

Chi tiết đầy đủ: xem [docs/DEPLOY_SERVER.md](docs/DEPLOY_SERVER.md).

## Troubleshooting

### Container không start
```bash
docker compose -f docker-compose.prod.yml logs app
docker stats
docker compose -f docker-compose.prod.yml restart app
```

### Database errors
```bash
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d function_provider
```

### Nginx issues
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
curl http://localhost:1040/api/hello
```

### SSL issues
```bash
sudo certbot renew
sudo certbot certificates
sudo certbot renew --dry-run
```

## Useful Commands

```bash
# Xem logs
docker compose -f docker-compose.prod.yml logs -f app

# Restart service
docker compose -f docker-compose.prod.yml restart app

# Stop tất cả
docker compose -f docker-compose.prod.yml down

# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres function_provider > backup.sql

# Restore database
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres function_provider < backup.sql
```

## Security Checklist

- [ ] Đã thay đổi tất cả default passwords
- [ ] Đã generate strong secrets
- [ ] Đã setup firewall
- [ ] Đã cấu hình SSL
- [ ] Đã set permissions cho production.env (600)
- [ ] Đã cấu hình OAuth redirect URIs đúng
- [ ] Đã test tất cả chức năng

---

**Chúc bạn deploy thành công! 🚀**

