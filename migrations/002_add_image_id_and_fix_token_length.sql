-- ============================================
-- Migration: Latest database changes
-- Description: Updates for managers table and token column
-- Date: 2025-01-03
-- ============================================

-- ============================================
-- 1. ALTER refresh_tokens table - increase token VARCHAR length
-- ============================================
-- This fixes the "value too long for type character varying(128)" error
-- when storing longer JWT refresh tokens (now up to 500 chars)
ALTER TABLE refresh_tokens
  ALTER COLUMN token TYPE VARCHAR(500);

-- ============================================
-- 2. Verify image_id column exists in managers table
-- ============================================
-- The managers table should already have image_id column defined
-- This is a verification/idempotent statement
ALTER TABLE managers
ADD COLUMN IF NOT EXISTS image_id BIGINT REFERENCES file_assets(id);

-- Create index for image_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_managers_image_id ON managers(image_id);

-- ============================================
-- 3. Ensure all required columns exist in managers table
-- ============================================
-- Verify the managers table has all necessary columns for recent UI changes
ALTER TABLE managers
ADD COLUMN IF NOT EXISTS lat DECIMAL(10,7),
ADD COLUMN IF NOT EXISTS lng DECIMAL(10,7);

-- ============================================
-- 4. Update audit timestamp
-- ============================================
-- Optional: Add comment for tracking when this migration was run
COMMENT ON TABLE managers IS 'Managers table - Updated 2025-01-03 with image_id support and location columns';

-- ============================================
-- 5. Verify necessary indexes for recent features
-- ============================================
CREATE INDEX IF NOT EXISTS idx_managers_name ON managers(name);
CREATE INDEX IF NOT EXISTS idx_managers_status ON managers(status);
CREATE INDEX IF NOT EXISTS idx_managers_rating ON managers(rating);
CREATE INDEX IF NOT EXISTS idx_managers_lat_lng ON managers(lat, lng);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries to verify the migration was successful

-- Check refresh_tokens column type
-- SELECT column_name, data_type, character_maximum_length
-- FROM information_schema.columns
-- WHERE table_name = 'refresh_tokens' AND column_name = 'token';

-- Check managers table structure
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'managers'
-- ORDER BY ordinal_position;

-- Check if image_id index exists
-- SELECT * FROM pg_indexes WHERE tablename = 'managers' AND indexname LIKE '%image%';
