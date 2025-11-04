# Database Initialization Scripts

Các scripts trong thư mục này sẽ được tự động chạy khi PostgreSQL container khởi động lần đầu tiên.

PostgreSQL sẽ tự động execute các file `.sql` và `.sh` trong thư mục `/docker-entrypoint-initdb.d` theo thứ tự alphabetical.

## Cấu trúc

- `01-init-schema.sql` - Tạo tất cả các tables và indexes
- `02-seed-data.sql` - Seed dữ liệu mẫu cho testing

## Test Users

Sau khi khởi động, bạn có thể đăng nhập với:

### Admin User
- Email: `admin@speaklogicmap.com`
- Password: `admin123`
- Role: `admin`

### Regular User
- Email: `user@speaklogicmap.com`
- Password: `user123`
- Role: `user`

### Developer User
- Email: `dev@speaklogicmap.com`
- Password: `dev123`
- Role: `user`

## Lưu ý

- Các scripts chỉ chạy khi database được tạo lần đầu (volume mới)
- Nếu muốn chạy lại, cần xóa volume: `docker volume rm speak-logic-map_web_postgres_data`
- Password hashes sử dụng bcrypt với 12 rounds

