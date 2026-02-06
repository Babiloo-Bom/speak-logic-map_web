-- Migration: Device FCM tokens & Notifications (for mobile push)
-- Description: Bảng lưu FCM token thiết bị + lịch sử thông báo
-- Date: 2026-02

-- ============================================
-- 1. Device FCM Tokens (thiết bị đăng ký nhận push)
-- ============================================
CREATE TABLE IF NOT EXISTS device_fcm_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fcm_token VARCHAR(512) NOT NULL,
  device_id VARCHAR(255),
  platform VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fcm_token)
);

CREATE INDEX IF NOT EXISTS idx_device_fcm_tokens_user_id ON device_fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_fcm_tokens_device_id ON device_fcm_tokens(device_id);

-- ============================================
-- 2. Notifications (lịch sử thông báo - dùng sau)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255),
  body TEXT,
  data JSONB,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
