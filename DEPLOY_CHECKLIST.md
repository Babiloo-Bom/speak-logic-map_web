# Deployment Checklist - map.rugal.vn

## Pre-Deployment

### Server Setup
- [ ] Server đã cài đặt Ubuntu 20.04+ / Debian 11+
- [ ] Đã cài đặt Docker và Docker Compose v2
- [ ] Đã cài đặt Nginx
- [ ] Đã cài đặt Certbot
- [ ] User đã được thêm vào docker group

### DNS Configuration
- [ ] DNS A record cho `map.rugal.vn` → Server IP
- [ ] DNS A record cho `www.map.rugal.vn` → Server IP
- [ ] Đã kiểm tra DNS propagation (`dig map.rugal.vn`)

### Repository Setup
- [ ] Đã clone repository về `/var/www/speak-logic-map_web`
- [ ] Đã tạo file `production.env` với đầy đủ giá trị
- [ ] Đã set permissions: `chmod 600 production.env`

## Configuration

### production.env
- [ ] `DOCKER_REGISTRY` = docker.io
- [ ] `DOCKER_IMAGE_PREFIX` = your-dockerhub-username
- [ ] `IMAGE_TAG` = latest
- [ ] `DB_PASSWORD` = strong password
- [ ] `JWT_SECRET` = generated (openssl rand -base64 32)
- [ ] `JWT_REFRESH_SECRET` = generated
- [ ] `NEXTAUTH_SECRET` = generated
- [ ] `NEXTAUTH_URL` = https://map.rugal.vn
- [ ] `API_URL` = https://map.rugal.vn
- [ ] `FRONTEND_URL` = https://map.rugal.vn
- [ ] `ALLOWED_ORIGINS` = https://map.rugal.vn,https://www.map.rugal.vn
- [ ] `ALLOWED_HOSTS` = map.rugal.vn,www.map.rugal.vn
- [ ] SMTP credentials đã điền
- [ ] Google OAuth credentials đã điền
- [ ] Facebook OAuth credentials đã điền
- [ ] Apple OAuth credentials (nếu cần)

### Nginx
- [ ] Đã copy `nginx.prod.conf` → `/etc/nginx/sites-available/map.rugal.vn.conf`
- [ ] Đã tạo symbolic link trong `sites-enabled`
- [ ] Đã test config: `sudo nginx -t`
- [ ] Đã reload nginx: `sudo systemctl reload nginx`

### SSL Certificate
- [ ] Đã chạy certbot: `sudo certbot --nginx -d map.rugal.vn -d www.map.rugal.vn`
- [ ] Đã test auto-renewal: `sudo certbot renew --dry-run`
- [ ] SSL certificate hiển thị đúng trong browser

## Deployment

### Docker
- [ ] Đã login Docker Hub: `docker login`
- [ ] Đã pull image: `docker pull ...`
- [ ] Đã start containers: `docker compose -f docker-compose.prod.yml --env-file production.env up -d`
- [ ] Tất cả containers đang chạy: `docker compose ps`
- [ ] Không có lỗi trong logs: `docker compose logs`

### Health Checks
- [ ] App health check: `curl http://localhost:1040/api/hello` → 200 OK
- [ ] Nginx health check: `curl http://localhost/health` → 200 OK
- [ ] Domain health check: `curl https://map.rugal.vn/api/hello` → 200 OK
- [ ] SSL certificate valid trong browser
- [ ] Website load được từ browser

## OAuth Configuration

### Google OAuth
- [ ] Đã tạo OAuth 2.0 Client ID trong Google Cloud Console
- [ ] Redirect URI: `https://map.rugal.vn/api/auth/google/callback`
- [ ] Client ID và Secret đã điền vào `production.env`
- [ ] Test login với Google → Success

### Facebook OAuth
- [ ] Đã tạo App trong Facebook Developers
- [ ] Redirect URI: `https://map.rugal.vn/api/auth/facebook/callback`
- [ ] App ID và Secret đã điền vào `production.env`
- [ ] Test login với Facebook → Success

### Apple OAuth (nếu cần)
- [ ] Đã tạo Service ID trong Apple Developer
- [ ] Return URL: `https://map.rugal.vn/api/auth/apple/callback`
- [ ] Đã tạo Key và download .p8 file
- [ ] Team ID, Key ID, Private Key đã điền vào `production.env`
- [ ] Test login với Apple → Success

## Security

### Firewall
- [ ] UFW đã được enable
- [ ] Port 22 (SSH) đã mở
- [ ] Port 80 (HTTP) đã mở
- [ ] Port 443 (HTTPS) đã mở
- [ ] Ports 1040, 1041 KHÔNG mở (chỉ dùng nội bộ)

### File Permissions
- [ ] `production.env` = 600
- [ ] `deploy.sh` = 755
- [ ] Repository files = proper ownership

### Secrets
- [ ] Tất cả default passwords đã thay đổi
- [ ] Tất cả secrets đã được generate (không dùng default)
- [ ] `production.env` KHÔNG commit lên git

## Testing

### Functional Tests
- [ ] Đăng ký tài khoản mới → Success
- [ ] Đăng nhập với email/password → Success
- [ ] Đăng nhập với Google → Success
- [ ] Đăng nhập với Facebook → Success
- [ ] Đăng nhập với Apple (nếu có) → Success
- [ ] Reset password → Success
- [ ] Verify email → Success
- [ ] Upload file/image → Success
- [ ] Các chức năng chính của app hoạt động

### Performance Tests
- [ ] Page load time < 3s
- [ ] API response time < 1s
- [ ] Database queries optimized
- [ ] No memory leaks

## Monitoring & Maintenance

### Logs
- [ ] Đã setup log rotation
- [ ] Logs có thể truy cập được
- [ ] Error logs được monitor

### Backups
- [ ] Đã setup backup script cho database
- [ ] Đã setup cron job cho auto backup
- [ ] Đã test restore từ backup

### Monitoring (Optional)
- [ ] Đã setup monitoring tools
- [ ] Đã setup alerting
- [ ] Health checks đang chạy

## Post-Deployment

### Documentation
- [ ] Đã ghi lại các thay đổi
- [ ] Đã update deployment guide nếu cần
- [ ] Team đã biết cách deploy updates

### CI/CD (Optional)
- [ ] GitHub Actions workflow đã setup
- [ ] Secrets đã được thêm vào GitHub
- [ ] Test deploy qua CI/CD → Success

## Rollback Plan

- [ ] Đã biết cách rollback về version cũ
- [ ] Đã có backup của database
- [ ] Đã test rollback procedure

---

## Quick Commands Reference

```bash
# Deploy
cd /var/www/speak-logic-map_web
./deploy.sh

# Check status
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app

# Restart
docker compose -f docker-compose.prod.yml restart app

# Stop
docker compose -f docker-compose.prod.yml down

# Backup DB
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres function_provider > backup.sql
```

---

**Sau khi hoàn thành tất cả checklist items, deployment đã sẵn sàng! ✅**

