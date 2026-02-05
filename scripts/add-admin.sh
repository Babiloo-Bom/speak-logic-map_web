#!/bin/bash
# Thêm hoặc gán 1 email làm admin trên server
# Cách chạy (trên server):
#   cd /opt/speak-logic-map_web
#   chmod +x scripts/add-admin.sh
#   ./scripts/add-admin.sh admin@example.com
#
# Hoặc set biến môi trường:
#   ADMIN_EMAIL=admin@example.com ./scripts/add-admin.sh

set -e
EMAIL="${1:-$ADMIN_EMAIL}"
if [ -z "$EMAIL" ]; then
  echo "Usage: $0 <email>"
  echo "Example: $0 admin@yourcompany.com"
  exit 1
fi

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-production.env}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-function_provider}"

echo "Setting user to admin: $EMAIL"
# Escape single quote trong email cho SQL
EMAIL_SQL="${EMAIL//\'/\'\'}"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" << EOF
-- Nếu đã có user thì nâng lên admin
UPDATE users SET role = 'admin', status = 'active' WHERE email = '$EMAIL_SQL';

-- Nếu chưa có thì thêm mới (đăng nhập bằng OAuth hoặc Forgot password để đặt mật khẩu)
INSERT INTO users (email, password_hash, role, status)
VALUES ('$EMAIL_SQL', NULL, 'admin', 'active')
ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'active';
EOF

echo "Done. $EMAIL is now admin."
