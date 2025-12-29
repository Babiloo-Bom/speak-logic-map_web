-- Migration: Fix refresh token column length
-- Description: Increase VARCHAR(128) to VARCHAR(500) to accommodate JWT tokens
-- Date: 2025-12-28

-- Alter the refresh_tokens table token column to accommodate longer JWT tokens
ALTER TABLE refresh_tokens ALTER COLUMN token TYPE VARCHAR(500);

-- Note: This migration is required to fix the "value too long for type character varying(128)" error
-- during login when storing refresh tokens
