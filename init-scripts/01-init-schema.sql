-- Database initialization script for speak-logic-map_web
-- This script runs automatically when PostgreSQL container starts for the first time
-- Files in /docker-entrypoint-initdb.d are executed in alphabetical order

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table
-- password_hash can be NULL for OAuth-only users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- NULL for OAuth users
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAuth accounts table (for NextAuth.js)
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_account_id)
);

-- NextAuth sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NextAuth verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(48),
  title VARCHAR(120),
  function VARCHAR(120),
  geo_id BIGINT,
  avatar_id BIGINT,
  pen_name VARCHAR(120),
  PRIMARY KEY (user_id)
);

-- User tokens table (for email verification and password reset)
CREATE TABLE IF NOT EXISTS user_tokens (
  token VARCHAR(64) PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  token_type VARCHAR(20),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(128),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Geopoints table
CREATE TABLE IF NOT EXISTS geopoints (
  id BIGSERIAL PRIMARY KEY,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  city VARCHAR(120),
  country VARCHAR(120)
);

-- File assets table
CREATE TABLE IF NOT EXISTS file_assets (
  id BIGSERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(80),
  size_bytes INTEGER,
  uploader_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User locations table
CREATE TABLE IF NOT EXISTS user_locations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  captured_at TIMESTAMP,
  is_live BOOLEAN DEFAULT false
);

-- Live sessions table
CREATE TABLE IF NOT EXISTS live_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  stream_key VARCHAR(120),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- Simulation settings table
CREATE TABLE IF NOT EXISTS simulation_settings (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(80),
  value VARCHAR(200)
);

-- Countries metadata table (optional - for caching country info)
CREATE TABLE IF NOT EXISTS countries_metadata (
  id BIGSERIAL PRIMARY KEY,
  code_name VARCHAR(10) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  main_lat DECIMAL(10,7),
  main_lng DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities metadata table (optional - for caching city info)
CREATE TABLE IF NOT EXISTS cities_metadata (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  country_code VARCHAR(10),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  country_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_tokens_token ON user_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_geopoints_country ON geopoints(country);
CREATE INDEX IF NOT EXISTS idx_geopoints_city ON geopoints(city);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_is_live ON user_locations(is_live);
CREATE INDEX IF NOT EXISTS idx_countries_metadata_code ON countries_metadata(code_name);
CREATE INDEX IF NOT EXISTS idx_cities_metadata_country_code ON cities_metadata(country_code);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);

-- ============================================
-- GRANT PERMISSIONS (if needed)
-- ============================================

-- PostgreSQL 15+ may need explicit grants
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

