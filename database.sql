-- ============================================
-- Database initialization script for speak-logic-map_web
-- This script creates all tables, indexes, and seed data
-- Run this script to initialize the complete database
-- ============================================
-- Version: 3.0 (Consolidated)
-- Last Updated: 2026-01-03
-- Source: Consolidated from init-database.sql and backup files
-- ============================================

-- ============================================
-- DROP EXISTING TABLES (Optional - uncomment if needed)
-- ============================================
-- DROP TABLE IF EXISTS project_identifications CASCADE;
-- DROP TABLE IF EXISTS manager_ratings CASCADE;
-- DROP TABLE IF EXISTS manager_problems CASCADE;
-- DROP TABLE IF EXISTS manager_functions CASCADE;
-- DROP TABLE IF EXISTS managers CASCADE;
-- DROP TABLE IF EXISTS provider_ratings CASCADE;
-- DROP TABLE IF EXISTS provider_problems CASCADE;
-- DROP TABLE IF EXISTS provider_functions CASCADE;
-- DROP TABLE IF EXISTS providers CASCADE;
-- DROP TABLE IF EXISTS problems CASCADE;
-- DROP TABLE IF EXISTS functions CASCADE;
-- DROP TABLE IF EXISTS cities_metadata CASCADE;
-- DROP TABLE IF EXISTS countries_metadata CASCADE;
-- DROP TABLE IF EXISTS simulation_settings CASCADE;
-- DROP TABLE IF EXISTS live_sessions CASCADE;
-- DROP TABLE IF EXISTS user_locations CASCADE;
-- DROP TABLE IF EXISTS file_assets CASCADE;
-- DROP TABLE IF EXISTS geopoints CASCADE;
-- DROP TABLE IF EXISTS refresh_tokens CASCADE;
-- DROP TABLE IF EXISTS user_tokens CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS verification_tokens CASCADE;
-- DROP TABLE IF EXISTS sessions CASCADE;
-- DROP TABLE IF EXISTS accounts CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- ============================================
-- 1. CORE USER TABLES
-- ============================================

-- Users table
-- password_hash can be NULL for OAuth-only users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- NULL for OAuth users
  role VARCHAR(20) DEFAULT 'user',  -- user, admin, manager, provider
  status VARCHAR(20) DEFAULT 'pending',  -- pending, active, suspended
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
  location VARCHAR(255),  -- User's location text
  geo_id BIGINT,
  avatar_id BIGINT,
  pen_name VARCHAR(120),
  PRIMARY KEY (user_id)
);

-- User tokens table (for email verification and password reset)
CREATE TABLE IF NOT EXISTS user_tokens (
  token VARCHAR(512) PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  token_type VARCHAR(20),  -- email_verify, password_reset, verify_password
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device FCM tokens (mobile push - đăng ký token thiết bị)
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

-- Notifications (lịch sử thông báo)
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

-- ============================================
-- 2. GEOGRAPHIC & FILE TABLES
-- ============================================

-- Geopoints table
CREATE TABLE IF NOT EXISTS geopoints (
  id BIGSERIAL PRIMARY KEY,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  city VARCHAR(120),
  country VARCHAR(120)
);

-- File assets table
-- Lưu thông tin file đã upload (images, documents, etc.)
CREATE TABLE IF NOT EXISTS file_assets (
  id BIGSERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,  -- URL đầy đủ của file (e.g., /uploads/image.jpg hoặc https://cdn.example.com/image.jpg)
  mime_type VARCHAR(80),      -- image/jpeg, image/png, application/pdf, etc.
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

-- ============================================
-- 3. METADATA TABLES
-- ============================================

-- Countries metadata table (for caching country info)
CREATE TABLE IF NOT EXISTS countries_metadata (
  id BIGSERIAL PRIMARY KEY,
  code_name VARCHAR(10) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  main_lat DECIMAL(10,7),
  main_lng DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities metadata table (for caching city info)
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
-- 4. FUNCTIONS & PROBLEMS TABLES (Core entities)
-- ============================================

-- Functions table
CREATE TABLE IF NOT EXISTS functions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. MANAGER SYSTEM TABLES
-- ============================================

-- Managers table (extends users with role='manager')
-- ============================================
-- IMPORTANT: image_url vs image_id
-- ============================================
-- Option 1: image_url (VARCHAR) - Lưu URL trực tiếp
--   Pros: Đơn giản, không cần JOIN khi query
--   Cons: Khó quản lý file (xóa, update)
--   Usage: image_url = '/uploads/managers/alice.jpg' hoặc 'https://cdn.example.com/alice.jpg'
--
-- Option 2: image_id (BIGINT FK -> file_assets)
--   Pros: Quản lý file tập trung, có metadata (size, mime_type)
--   Cons: Cần JOIN khi query để lấy URL
--   Usage:
--     INSERT INTO file_assets (url, mime_type, size_bytes) VALUES ('/uploads/alice.jpg', 'image/jpeg', 102400);
--     UPDATE managers SET image_id = (SELECT id FROM file_assets WHERE url = '/uploads/alice.jpg') WHERE name = 'Alice';
--     SELECT m.*, fa.url as image_url FROM managers m LEFT JOIN file_assets fa ON m.image_id = fa.id;
--
-- Current: Sử dụng image_url (VARCHAR) cho đơn giản
-- ============================================
CREATE TABLE IF NOT EXISTS managers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  expertise TEXT,  -- Manager's expertise/skills (comma-separated)

  -- Image: Lưu URL trực tiếp thay vì ID
  -- Ví dụ: '/uploads/managers/alice.jpg' hoặc 'https://cdn.example.com/alice.jpg'
  image_url VARCHAR(500),

  -- Location
  geo_id BIGINT REFERENCES geopoints(id),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  near_city VARCHAR(120),  -- Thành phố gần nhất (e.g., "Hà Nội", "Ho Chi Minh City")

  -- Rating
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  rating_count INTEGER DEFAULT 0,

  -- Status & Flags
  status VARCHAR(20) DEFAULT 'active',  -- active, inactive, pending, suspended

  -- Boolean flags (TRUE/FALSE only)
  is_given_set BOOLEAN DEFAULT false,  -- "Manager using the Given Set" (TRUE = Yes, FALSE = No)
  location_by BOOLEAN DEFAULT false,   -- "Location by" flag (TRUE = enabled, FALSE = disabled)

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
  -- Add image_url if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE managers ADD COLUMN image_url VARCHAR(500);
  END IF;
  
  -- Add near_city if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'near_city'
  ) THEN
    ALTER TABLE managers ADD COLUMN near_city VARCHAR(120);
  END IF;
  
  -- Add location_by if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'location_by'
  ) THEN
    ALTER TABLE managers ADD COLUMN location_by BOOLEAN DEFAULT false;
  END IF;
  
  -- Add is_given_set if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'is_given_set'
  ) THEN
    ALTER TABLE managers ADD COLUMN is_given_set BOOLEAN DEFAULT false;
  END IF;
  
  -- Add rating if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'rating'
  ) THEN
    ALTER TABLE managers ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0;
  END IF;
  
  -- Add rating_count if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'rating_count'
  ) THEN
    ALTER TABLE managers ADD COLUMN rating_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add expertise if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'expertise'
  ) THEN
    ALTER TABLE managers ADD COLUMN expertise TEXT;
  END IF;
  
  -- Add geo_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'geo_id'
  ) THEN
    ALTER TABLE managers ADD COLUMN geo_id BIGINT REFERENCES geopoints(id);
  END IF;
  
  -- Add lat if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'lat'
  ) THEN
    ALTER TABLE managers ADD COLUMN lat DECIMAL(10,7);
  END IF;
  
  -- Add lng if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'managers' AND column_name = 'lng'
  ) THEN
    ALTER TABLE managers ADD COLUMN lng DECIMAL(10,7);
  END IF;
END $$;

-- Manager ratings table (per-user ratings)
CREATE TABLE IF NOT EXISTS manager_ratings (
  id BIGSERIAL PRIMARY KEY,
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- ============================================
  -- Step 1: About User (Reviewer Info)
  -- ============================================
  reviewer_name VARCHAR(255),                    -- User Name
  reviewer_full_name VARCHAR(255),               -- Full Name
  reviewer_email VARCHAR(255),                   -- Email Address
  reviewer_phone VARCHAR(50),                    -- Phone Number
  reviewer_address TEXT,                         -- Address (Optional)
  
  -- ============================================
  -- Step 2: About Manager
  -- ============================================
  manager_name VARCHAR(255),                     -- Manager name
  manager_user_name VARCHAR(255),                -- User Name (of manager)
  manager_location VARCHAR(255),                 -- Manager Location
  job_location VARCHAR(255),                     -- Job Location
  manager_url VARCHAR(500),                      -- Manager URL
  
  -- ============================================
  -- Step 3: About Function And Problem
  -- ============================================
  function_name VARCHAR(255),                    -- Function Name
  function_manager VARCHAR(255),                 -- Function Manager
  used_function_from_manager BOOLEAN,            -- Did you use the function from the Manager?
  function_execution_date DATE,                  -- Function Execution Date
  problem_solver_manager_name VARCHAR(255),      -- Manager name who helped you solve the problem?
  problem_to_be_solved TEXT,                     -- Problem to be solved by the function executed by the Manager
  manager_helped_identify_problem BOOLEAN,       -- Did the manager help you identify the problem properly?
  function_solved_problem BOOLEAN,               -- Did the function solve the problem?
  problem_existed_before_function BOOLEAN,       -- Did the problem exist before the function executed by the Manager?
  problem_existed_after_function BOOLEAN,        -- Did the problem exist after the function executed by the Manager?
  function_provided_solved_problem BOOLEAN,      -- Is the function provided by the Manager solved the problem?
  
  -- ============================================
  -- Step 4: About Feedback
  -- ============================================
  provided_feedback_after_function BOOLEAN,      -- Did you provide feedback to the Manager after function executed?
  manager_applied_feedback BOOLEAN,              -- Did the Manager apply the feedback to help solve the problem?
  
  -- ============================================
  -- Legacy/Computed Fields
  -- ============================================
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- Overall computed rating (optional)
  comment TEXT,                                  -- Additional comments
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (manager_id, user_id)
);

-- Manager-Function junction table (many-to-many)
CREATE TABLE IF NOT EXISTS manager_functions (
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  function_id BIGINT NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (manager_id, function_id)
);

-- Manager-Problem junction table (many-to-many)
CREATE TABLE IF NOT EXISTS manager_problems (
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (manager_id, problem_id)
);

-- ============================================
-- 6. PROVIDER SYSTEM TABLES
-- ============================================

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500),          -- Internal URL identifier (e.g., www.urlofprovider.com)
  website_url VARCHAR(500),  -- External website URL (https://...)
  description TEXT,

  -- Image: Lưu URL trực tiếp
  image_url VARCHAR(500),

  -- Location
  geo_id BIGINT REFERENCES geopoints(id),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  near_city VARCHAR(120),  -- Thành phố gần nhất

  -- Rating
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),

  -- Status & Flags
  status VARCHAR(20) DEFAULT 'active',  -- active, inactive, pending, suspended

  -- Boolean flags (TRUE/FALSE only)
  is_applicable BOOLEAN DEFAULT true,  -- "The Given Set Applicable" (TRUE = Yes, FALSE = No)
  location_by BOOLEAN DEFAULT false,   -- "Location by" flag (TRUE = enabled, FALSE = disabled)

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
  -- Add image_url if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE providers ADD COLUMN image_url VARCHAR(500);
  END IF;
  
  -- Add near_city if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'near_city'
  ) THEN
    ALTER TABLE providers ADD COLUMN near_city VARCHAR(120);
  END IF;
  
  -- Add location_by if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'location_by'
  ) THEN
    ALTER TABLE providers ADD COLUMN location_by BOOLEAN DEFAULT false;
  END IF;
  
  -- Add is_applicable if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'is_applicable'
  ) THEN
    ALTER TABLE providers ADD COLUMN is_applicable BOOLEAN DEFAULT true;
  END IF;
  
  -- Add rating if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'rating'
  ) THEN
    ALTER TABLE providers ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0;
  END IF;
  
  -- Add geo_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'geo_id'
  ) THEN
    ALTER TABLE providers ADD COLUMN geo_id BIGINT REFERENCES geopoints(id);
  END IF;
  
  -- Add lat if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'lat'
  ) THEN
    ALTER TABLE providers ADD COLUMN lat DECIMAL(10,7);
  END IF;
  
  -- Add lng if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'lng'
  ) THEN
    ALTER TABLE providers ADD COLUMN lng DECIMAL(10,7);
  END IF;
  
  -- Add website_url if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'providers' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE providers ADD COLUMN website_url VARCHAR(500);
  END IF;
END $$;

-- Provider ratings table (per-user ratings)
CREATE TABLE IF NOT EXISTS provider_ratings (
  id BIGSERIAL PRIMARY KEY,
  provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider_id, user_id)
);

-- Provider-Function junction table (many-to-many)
CREATE TABLE IF NOT EXISTS provider_functions (
  provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  function_id BIGINT NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (provider_id, function_id)
);

-- Provider-Problem junction table (many-to-many)
CREATE TABLE IF NOT EXISTS provider_problems (
  provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (provider_id, problem_id)
);

-- ============================================
-- PROJECT IDENTIFICATION TABLES
-- ============================================

-- Project Identifications table (for rating tracking)
-- Each user can generate multiple project IDs to track their ratings
CREATE TABLE IF NOT EXISTS project_identifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id VARCHAR(36) UNIQUE NOT NULL,  -- UUID format: "277CA003-06I0-478F-9385-4D2732771EBE"
  used BOOLEAN DEFAULT false,              -- Has this ID been used for a rating?
  manager_id BIGINT REFERENCES managers(id) ON DELETE SET NULL,   -- If used for manager rating
  provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL, -- If used for provider rating
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP  -- When the ID was used
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- ============================================
-- 7.1 User & Auth Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_tokens_token ON user_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================
-- 7.2 OAuth/NextAuth Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);

-- ============================================
-- 7.3 Geographic Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_geopoints_country ON geopoints(country);
CREATE INDEX IF NOT EXISTS idx_geopoints_city ON geopoints(city);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_is_live ON user_locations(is_live);
CREATE INDEX IF NOT EXISTS idx_countries_metadata_code ON countries_metadata(code_name);
CREATE INDEX IF NOT EXISTS idx_cities_metadata_country_code ON cities_metadata(country_code);

-- ============================================
-- 7.4 Functions & Problems Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_functions_name ON functions(name);
CREATE INDEX IF NOT EXISTS idx_functions_category ON functions(category);
CREATE INDEX IF NOT EXISTS idx_problems_name ON problems(name);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_functions_name_fts ON functions USING gin(to_tsvector('english', COALESCE(name, '')));
CREATE INDEX IF NOT EXISTS idx_problems_name_fts ON problems USING gin(to_tsvector('english', COALESCE(name, '')));

-- ============================================
-- 7.5 Manager Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_managers_user_id ON managers(user_id);
CREATE INDEX IF NOT EXISTS idx_managers_name ON managers(name);
CREATE INDEX IF NOT EXISTS idx_managers_status ON managers(status);
CREATE INDEX IF NOT EXISTS idx_managers_rating ON managers(rating);
CREATE INDEX IF NOT EXISTS idx_managers_is_given_set ON managers(is_given_set);
CREATE INDEX IF NOT EXISTS idx_managers_location_by ON managers(location_by);
CREATE INDEX IF NOT EXISTS idx_managers_geo_id ON managers(geo_id);
CREATE INDEX IF NOT EXISTS idx_managers_near_city ON managers(near_city);
CREATE INDEX IF NOT EXISTS idx_managers_created_at ON managers(created_at);

-- Full-text search indexes for managers
CREATE INDEX IF NOT EXISTS idx_managers_name_fts ON managers USING gin(to_tsvector('english', COALESCE(name, '')));
CREATE INDEX IF NOT EXISTS idx_managers_description_fts ON managers USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_managers_expertise_fts ON managers USING gin(to_tsvector('english', COALESCE(expertise, '')));

-- Alphabet filter index (for A-Z sidebar)
CREATE INDEX IF NOT EXISTS idx_managers_name_first_letter ON managers(UPPER(LEFT(name, 1)));

-- Manager junction tables indexes
CREATE INDEX IF NOT EXISTS idx_manager_functions_manager_id ON manager_functions(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_functions_function_id ON manager_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_manager_problems_manager_id ON manager_problems(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_problems_problem_id ON manager_problems(problem_id);

-- Manager ratings indexes
CREATE INDEX IF NOT EXISTS idx_manager_ratings_manager_id ON manager_ratings(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_ratings_user_id ON manager_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_manager_ratings_rating ON manager_ratings(rating);

-- ============================================
-- 7.6 Provider Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(name);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating);
CREATE INDEX IF NOT EXISTS idx_providers_is_applicable ON providers(is_applicable);
CREATE INDEX IF NOT EXISTS idx_providers_location_by ON providers(location_by);
CREATE INDEX IF NOT EXISTS idx_providers_geo_id ON providers(geo_id);
CREATE INDEX IF NOT EXISTS idx_providers_near_city ON providers(near_city);
CREATE INDEX IF NOT EXISTS idx_providers_created_at ON providers(created_at);

-- Full-text search indexes for providers
CREATE INDEX IF NOT EXISTS idx_providers_description_fts ON providers USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_providers_name_fts ON providers USING gin(to_tsvector('english', COALESCE(name, '')));

-- Provider junction tables indexes
CREATE INDEX IF NOT EXISTS idx_provider_functions_provider_id ON provider_functions(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_functions_function_id ON provider_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_provider_problems_provider_id ON provider_problems(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_problems_problem_id ON provider_problems(problem_id);

-- Provider ratings indexes
CREATE INDEX IF NOT EXISTS idx_provider_ratings_provider_id ON provider_ratings(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_ratings_user_id ON provider_ratings(user_id);

-- Project identifications indexes
CREATE INDEX IF NOT EXISTS idx_project_identifications_user_id ON project_identifications(user_id);
CREATE INDEX IF NOT EXISTS idx_project_identifications_project_id ON project_identifications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_identifications_used ON project_identifications(used);
CREATE INDEX IF NOT EXISTS idx_project_identifications_manager_id ON project_identifications(manager_id);
CREATE INDEX IF NOT EXISTS idx_project_identifications_provider_id ON project_identifications(provider_id);
CREATE INDEX IF NOT EXISTS idx_project_identifications_created_at ON project_identifications(created_at);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================
-- INSERT SEED DATA
-- ============================================

-- ============================================
-- 8.1 INSERT TEST USERS
-- ============================================

-- Test Admin User (password: admin123)
INSERT INTO users (email, password_hash, role, status)
VALUES (
  'admin@speaklogicmap.com',
  '$2a$12$yzOpJpvS0Mm5ZhcxA1YZTOCepabpX1nuKq.EpFKO2f7Wqwe9AX9ge',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Test Regular User (password: user123)
INSERT INTO users (email, password_hash, role, status)
VALUES (
  'user@speaklogicmap.com',
  '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW',
  'user',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Test Developer User (password: dev123)
INSERT INTO users (email, password_hash, role, status)
VALUES (
  'dev@speaklogicmap.com',
  '$2a$12$SpdpzUb4DpcCG8cDjwQunubaC1/XniTa6jzBwJlW5dMic05sq.RQ.',
  'user',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 8.2 INSERT TEST PROFILES
-- ============================================

INSERT INTO profiles (user_id, first_name, last_name, title, function, pen_name)
VALUES
  (1, 'Admin', 'User', 'System Administrator', 'Admin', 'Admin')
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  title = EXCLUDED.title,
  function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
VALUES
  (2, 'Test', 'User', 'Developer', 'Software Engineer')
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  title = EXCLUDED.title,
  function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
VALUES
  (3, 'Developer', 'Test', 'Frontend Developer', 'React Developer')
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  title = EXCLUDED.title,
  function = EXCLUDED.function;

-- ============================================
-- 8.3 INSERT SAMPLE GEOPOINTS
-- ============================================

INSERT INTO geopoints (lat, lng, city, country) VALUES
  (21.0285, 105.8542, 'Hà Nội', 'Vietnam'),
  (21.0245, 105.8412, 'Hà Nội', 'Vietnam'),
  (10.7769, 106.7009, 'Ho Chi Minh City', 'Vietnam'),
  (16.0544, 108.2022, 'Da Nang', 'Vietnam'),
  (40.7128, -74.0060, 'New York', 'USA'),
  (34.0522, -118.2437, 'Los Angeles', 'USA'),
  (51.5074, -0.1278, 'London', 'UK'),
  (35.6762, 139.6503, 'Tokyo', 'Japan'),
  (1.3521, 103.8198, 'Singapore', 'Singapore')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8.4 INSERT COUNTRIES METADATA
-- ============================================

INSERT INTO countries_metadata (code_name, full_name, main_lat, main_lng) VALUES
  ('VNM', 'Vietnam', 16.0544, 108.2022),
  ('USA', 'United States of America', 37.0902, -95.7129),
  ('CHN', 'China', 35.8617, 104.1954),
  ('JPN', 'Japan', 36.2048, 138.2529),
  ('KOR', 'South Korea', 35.9078, 127.7669),
  ('SGP', 'Singapore', 1.3521, 103.8198),
  ('THA', 'Thailand', 15.8700, 100.9925),
  ('IDN', 'Indonesia', -0.7893, 113.9213),
  ('GBR', 'United Kingdom', 55.3781, -3.4360),
  ('DEU', 'Germany', 51.1657, 10.4515),
  ('FRA', 'France', 46.2276, 2.2137),
  ('CAN', 'Canada', 56.1304, -106.3468),
  ('AUS', 'Australia', -25.2744, 133.7751),
  ('IND', 'India', 20.5937, 78.9629),
  ('BRA', 'Brazil', -14.2350, -51.9253)
ON CONFLICT (code_name) DO NOTHING;

-- ============================================
-- 8.5 INSERT CITIES METADATA
-- ============================================

INSERT INTO cities_metadata (code, name, country_code, lat, lng, country_name) VALUES
  ('HAN', 'Hà Nội', 'VNM', 21.0285, 105.8542, 'Vietnam'),
  ('SGN', 'Ho Chi Minh City', 'VNM', 10.7769, 106.7009, 'Vietnam'),
  ('DAD', 'Da Nang', 'VNM', 16.0544, 108.2022, 'Vietnam'),
  ('HUE', 'Hue', 'VNM', 16.4637, 107.5909, 'Vietnam'),
  ('NHA', 'Nha Trang', 'VNM', 12.2388, 109.1967, 'Vietnam'),
  ('HPH', 'Haiphong', 'VNM', 20.8449, 106.6881, 'Vietnam'),
  ('VTE', 'Vung Tau', 'VNM', 10.3460, 107.0843, 'Vietnam'),
  ('DAL', 'Da Lat', 'VNM', 11.9404, 108.4583, 'Vietnam'),
  ('NYC', 'New York', 'USA', 40.7128, -74.0060, 'USA'),
  ('LAX', 'Los Angeles', 'USA', 34.0522, -118.2437, 'USA'),
  ('LON', 'London', 'GBR', 51.5074, -0.1278, 'United Kingdom'),
  ('TYO', 'Tokyo', 'JPN', 35.6762, 139.6503, 'Japan'),
  ('SIN', 'Singapore', 'SGP', 1.3521, 103.8198, 'Singapore')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8.6 INSERT SAMPLE SIMULATION SETTINGS
-- ============================================

INSERT INTO simulation_settings (owner_id, key, value) VALUES
  (1, 'map_default_zoom', '3'),
  (1, 'map_default_center_lat', '21.0285'),
  (1, 'map_default_center_lng', '105.8542'),
  (1, 'enable_grid', 'true'),
  (1, 'enable_distance_measurement', 'true'),
  (2, 'map_default_zoom', '4'),
  (2, 'preferred_view', 'map-world')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8.7 INSERT SAMPLE FUNCTIONS
-- ============================================

INSERT INTO functions (name, description, category) VALUES
  ('Sell Software', 'Software sales and distribution services', 'Sales'),
  ('Software Development', 'Custom software development and programming', 'Development'),
  ('Cloud Services', 'Cloud infrastructure and hosting services', 'Infrastructure'),
  ('Data Analytics', 'Data analysis and business intelligence', 'Analytics'),
  ('Digital Marketing', 'Online marketing and advertising services', 'Marketing'),
  ('Web Design', 'Website design and UI/UX services', 'Design'),
  ('IT Consulting', 'Information technology consulting', 'Consulting'),
  ('E-commerce Solutions', 'Online store and marketplace solutions', 'E-commerce'),
  ('Mobile App Development', 'Mobile application development', 'Development'),
  ('Cybersecurity', 'Security services and protection', 'Security')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8.8 INSERT SAMPLE PROBLEMS
-- ============================================

INSERT INTO problems (name, description, category) VALUES
  ('Remote Employee Management', 'Managing remote teams and distributed workforce', 'Management'),
  ('Data Security', 'Protecting sensitive data and preventing breaches', 'Security'),
  ('System Integration', 'Integrating multiple systems and platforms', 'Integration'),
  ('Performance Optimization', 'Improving system and application performance', 'Performance'),
  ('Cost Reduction', 'Reducing operational and IT costs', 'Cost'),
  ('Scalability Issues', 'Scaling systems to handle growth', 'Scalability'),
  ('Legacy System Migration', 'Migrating from old systems to modern platforms', 'Migration'),
  ('Customer Support', 'Providing efficient customer support services', 'Support'),
  ('Inventory Management', 'Managing inventory and supply chain', 'Inventory'),
  ('Payment Processing', 'Handling online payments and transactions', 'Payment')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8.9 INSERT SAMPLE PROVIDERS
-- ============================================

-- Create provider users first
INSERT INTO users (email, password_hash, role, status) VALUES
  ('provider1@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider2@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider3@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider4@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider5@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider6@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert providers with near_city, is_applicable (boolean), location_by (boolean)
INSERT INTO providers (user_id, name, url, website_url, description, image_url, lat, lng, near_city, rating, status, is_applicable, location_by) VALUES
  (
    (SELECT id FROM users WHERE email = 'provider1@example.com' LIMIT 1),
    'Tech Solutions Inc',
    'www.urlofprovider.com',
    'https://techsolutions.example.com',
    'Comprehensive technology solutions for businesses of all sizes. We provide end-to-end IT services.',
    '/uploads/providers/tech-solutions.jpg',
    21.0285, 105.8542, 'Hà Nội',
    4.5, 'active', true, true
  ),
  (
    (SELECT id FROM users WHERE email = 'provider2@example.com' LIMIT 1),
    'Cloud Services Pro',
    'wider.com',
    'https://cloudpro.example.com',
    'Leading provider of cloud infrastructure and hosting services. We help businesses migrate to the cloud.',
    '/uploads/providers/cloud-pro.jpg',
    10.7769, 106.7009, 'Ho Chi Minh City',
    4.8, 'active', true, false
  ),
  (
    (SELECT id FROM users WHERE email = 'provider3@example.com' LIMIT 1),
    'Digital Marketing Hub',
    'www.digitalmarketing.com',
    'https://digitalmarketing.example.com',
    'Expert digital marketing services including SEO, social media marketing, and content creation.',
    '/uploads/providers/digital-marketing.jpg',
    16.0544, 108.2022, 'Da Nang',
    4.2, 'active', false, true
  ),
  (
    (SELECT id FROM users WHERE email = 'provider4@example.com' LIMIT 1),
    'Software Development Co',
    'www.softdev.com',
    'https://softdev.example.com',
    'Custom software development services specializing in web applications and mobile apps.',
    '/uploads/providers/softdev.jpg',
    21.0245, 105.8412, 'Hà Nội',
    4.7, 'active', true, true
  ),
  (
    (SELECT id FROM users WHERE email = 'provider5@example.com' LIMIT 1),
    'Data Analytics Experts',
    'www.dataanalytics.com',
    'https://dataanalytics.example.com',
    'Transform your data into actionable insights with our analytics and BI solutions.',
    '/uploads/providers/data-analytics.jpg',
    10.7769, 106.7009, 'Ho Chi Minh City',
    4.6, 'active', true, false
  ),
  (
    (SELECT id FROM users WHERE email = 'provider6@example.com' LIMIT 1),
    'E-commerce Solutions',
    'www.ecommercesolutions.com',
    'https://ecommerce.example.com',
    'Complete e-commerce solutions including online store setup and payment integration.',
    '/uploads/providers/ecommerce.jpg',
    16.0544, 108.2022, 'Da Nang',
    4.3, 'active', false, false
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 8.10 LINK PROVIDERS TO FUNCTIONS
-- ============================================

INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id FROM providers p, functions f
WHERE p.name = 'Tech Solutions Inc' AND f.name IN ('Sell Software', 'Software Development', 'IT Consulting')
ON CONFLICT DO NOTHING;

INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id FROM providers p, functions f
WHERE p.name = 'Cloud Services Pro' AND f.name IN ('Cloud Services', 'IT Consulting')
ON CONFLICT DO NOTHING;

INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id FROM providers p, functions f
WHERE p.name = 'Digital Marketing Hub' AND f.name IN ('Digital Marketing', 'Web Design')
ON CONFLICT DO NOTHING;

INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id FROM providers p, functions f
WHERE p.name = 'Software Development Co' AND f.name IN ('Software Development', 'Mobile App Development')
ON CONFLICT DO NOTHING;

INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id FROM providers p, functions f
WHERE p.name = 'Data Analytics Experts' AND f.name IN ('Data Analytics', 'IT Consulting')
ON CONFLICT DO NOTHING;

INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id FROM providers p, functions f
WHERE p.name = 'E-commerce Solutions' AND f.name IN ('E-commerce Solutions', 'Web Design')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8.11 LINK PROVIDERS TO PROBLEMS
-- ============================================

INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id FROM providers p, problems pr
WHERE p.name = 'Tech Solutions Inc' AND pr.name IN ('Remote Employee Management', 'System Integration')
ON CONFLICT DO NOTHING;

INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id FROM providers p, problems pr
WHERE p.name = 'Cloud Services Pro' AND pr.name IN ('Scalability Issues', 'Cost Reduction')
ON CONFLICT DO NOTHING;

INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id FROM providers p, problems pr
WHERE p.name = 'Digital Marketing Hub' AND pr.name IN ('Customer Support', 'Performance Optimization')
ON CONFLICT DO NOTHING;

INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id FROM providers p, problems pr
WHERE p.name = 'Software Development Co' AND pr.name IN ('Legacy System Migration', 'Performance Optimization')
ON CONFLICT DO NOTHING;

INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id FROM providers p, problems pr
WHERE p.name = 'Data Analytics Experts' AND pr.name IN ('Data Security', 'Performance Optimization')
ON CONFLICT DO NOTHING;

INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id FROM providers p, problems pr
WHERE p.name = 'E-commerce Solutions' AND pr.name IN ('Payment Processing', 'Inventory Management')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8.12 INSERT SAMPLE MANAGERS
-- ============================================

-- Create manager users first
INSERT INTO users (email, password_hash, role, status) VALUES
  ('manager1@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager2@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager3@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager4@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager5@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager6@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active')
ON CONFLICT (email) DO NOTHING;

-- Create profiles for managers
INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Alice', 'Johnson', 'Senior Project Manager', 'Project Management'
FROM users WHERE email = 'manager1@example.com'
ON CONFLICT (user_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Bob', 'Smith', 'Operations Manager', 'Operations'
FROM users WHERE email = 'manager2@example.com'
ON CONFLICT (user_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Charlie', 'Brown', 'Technical Manager', 'Technical Leadership'
FROM users WHERE email = 'manager3@example.com'
ON CONFLICT (user_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Diana', 'Wilson', 'Product Manager', 'Product Development'
FROM users WHERE email = 'manager4@example.com'
ON CONFLICT (user_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Edward', 'Davis', 'Regional Manager', 'Regional Operations'
FROM users WHERE email = 'manager5@example.com'
ON CONFLICT (user_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Nguyen', 'Van Minh', 'Area Manager', 'Area Operations'
FROM users WHERE email = 'manager6@example.com'
ON CONFLICT (user_id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, title = EXCLUDED.title, function = EXCLUDED.function;

-- Insert managers with image_url, near_city, is_given_set (boolean), location_by (boolean)
INSERT INTO managers (user_id, name, description, expertise, image_url, lat, lng, near_city, rating, rating_count, status, is_given_set, location_by)
SELECT
  id,
  'Alice Johnson',
  'Experienced project manager with 10+ years in software development. Specializes in Agile methodologies.',
  'Project Management, Agile, Scrum, Team Leadership, Risk Management',
  '/uploads/managers/alice-johnson.jpg',
  21.0285, 105.8542, 'Hà Nội',
  4.8, 25, 'active', true, true
FROM users WHERE email = 'manager1@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, image_url, lat, lng, near_city, rating, rating_count, status, is_given_set, location_by)
SELECT
  id,
  'Bob Smith',
  'Operations manager focused on process optimization and efficiency.',
  'Operations, Supply Chain, Logistics, Process Optimization, Quality Control',
  '/uploads/managers/bob-smith.jpg',
  10.7769, 106.7009, 'Ho Chi Minh City',
  4.5, 18, 'active', true, false
FROM users WHERE email = 'manager2@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, image_url, lat, lng, near_city, rating, rating_count, status, is_given_set, location_by)
SELECT
  id,
  'Charlie Brown',
  'Technical manager with deep expertise in cloud architecture and DevOps.',
  'Cloud Architecture, DevOps, AWS, Kubernetes, Microservices',
  '/uploads/managers/charlie-brown.jpg',
  16.0544, 108.2022, 'Da Nang',
  4.2, 12, 'active', false, true
FROM users WHERE email = 'manager3@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, image_url, lat, lng, near_city, rating, rating_count, status, is_given_set, location_by)
SELECT
  id,
  'Diana Wilson',
  'Product manager passionate about user experience and data-driven decisions.',
  'Product Management, UX Design, Data Analytics, Market Research, A/B Testing',
  '/uploads/managers/diana-wilson.jpg',
  21.0245, 105.8412, 'Hà Nội',
  4.9, 32, 'active', true, true
FROM users WHERE email = 'manager4@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, image_url, lat, lng, near_city, rating, rating_count, status, is_given_set, location_by)
SELECT
  id,
  'Edward Davis',
  'Regional manager overseeing operations across Southeast Asia.',
  'Regional Management, Cross-cultural Leadership, Business Development',
  '/uploads/managers/edward-davis.jpg',
  10.7769, 106.7009, 'Ho Chi Minh City',
  3.8, 8, 'active', false, false
FROM users WHERE email = 'manager5@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, image_url, lat, lng, near_city, rating, rating_count, status, is_given_set, location_by)
SELECT
  id,
  'Nguyen Van Minh',
  'Area manager with extensive experience in Vietnam market.',
  'Local Market Expertise, Partnership Development, Business Expansion',
  '/uploads/managers/nguyen-van-minh.jpg',
  21.0285, 105.8542, 'Hà Nội',
  4.6, 15, 'active', true, false
FROM users WHERE email = 'manager6@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 8.13 LINK MANAGERS TO FUNCTIONS
-- ============================================

INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id FROM managers m, functions f
WHERE m.name = 'Alice Johnson' AND f.name IN ('Software Development', 'IT Consulting')
ON CONFLICT DO NOTHING;

INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id FROM managers m, functions f
WHERE m.name = 'Bob Smith' AND f.name IN ('Cloud Services', 'E-commerce Solutions')
ON CONFLICT DO NOTHING;

INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id FROM managers m, functions f
WHERE m.name = 'Charlie Brown' AND f.name IN ('Cloud Services', 'Software Development', 'Cybersecurity')
ON CONFLICT DO NOTHING;

INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id FROM managers m, functions f
WHERE m.name = 'Diana Wilson' AND f.name IN ('Digital Marketing', 'Web Design', 'Data Analytics')
ON CONFLICT DO NOTHING;

INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id FROM managers m, functions f
WHERE m.name = 'Edward Davis' AND f.name IN ('IT Consulting', 'Sell Software')
ON CONFLICT DO NOTHING;

INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id FROM managers m, functions f
WHERE m.name = 'Nguyen Van Minh' AND f.name IN ('E-commerce Solutions', 'Digital Marketing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8.14 LINK MANAGERS TO PROBLEMS
-- ============================================

INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id FROM managers m, problems pr
WHERE m.name = 'Alice Johnson' AND pr.name IN ('Remote Employee Management', 'Performance Optimization')
ON CONFLICT DO NOTHING;

INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id FROM managers m, problems pr
WHERE m.name = 'Bob Smith' AND pr.name IN ('Cost Reduction', 'Inventory Management')
ON CONFLICT DO NOTHING;

INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id FROM managers m, problems pr
WHERE m.name = 'Charlie Brown' AND pr.name IN ('Scalability Issues', 'Data Security', 'System Integration')
ON CONFLICT DO NOTHING;

INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id FROM managers m, problems pr
WHERE m.name = 'Diana Wilson' AND pr.name IN ('Customer Support', 'Performance Optimization')
ON CONFLICT DO NOTHING;

INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id FROM managers m, problems pr
WHERE m.name = 'Edward Davis' AND pr.name IN ('Legacy System Migration', 'Cost Reduction')
ON CONFLICT DO NOTHING;

INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id FROM managers m, problems pr
WHERE m.name = 'Nguyen Van Minh' AND pr.name IN ('Payment Processing', 'Customer Support')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8.15 INSERT SAMPLE RATINGS
-- ============================================

-- Manager ratings
INSERT INTO manager_ratings (manager_id, user_id, rating, comment)
SELECT m.id, u.id, 5, 'Excellent project management skills!'
FROM managers m, users u WHERE m.name = 'Alice Johnson' AND u.email = 'user@speaklogicmap.com'
ON CONFLICT (manager_id, user_id) DO NOTHING;

INSERT INTO manager_ratings (manager_id, user_id, rating, comment)
SELECT m.id, u.id, 5, 'Great leadership and communication.'
FROM managers m, users u WHERE m.name = 'Alice Johnson' AND u.email = 'dev@speaklogicmap.com'
ON CONFLICT (manager_id, user_id) DO NOTHING;

INSERT INTO manager_ratings (manager_id, user_id, rating, comment)
SELECT m.id, u.id, 4, 'Very efficient operations management.'
FROM managers m, users u WHERE m.name = 'Bob Smith' AND u.email = 'user@speaklogicmap.com'
ON CONFLICT (manager_id, user_id) DO NOTHING;

INSERT INTO manager_ratings (manager_id, user_id, rating, comment)
SELECT m.id, u.id, 5, 'Best product manager I have worked with!'
FROM managers m, users u WHERE m.name = 'Diana Wilson' AND u.email = 'user@speaklogicmap.com'
ON CONFLICT (manager_id, user_id) DO NOTHING;

INSERT INTO manager_ratings (manager_id, user_id, rating, comment)
SELECT m.id, u.id, 5, 'Amazing product vision and execution.'
FROM managers m, users u WHERE m.name = 'Diana Wilson' AND u.email = 'dev@speaklogicmap.com'
ON CONFLICT (manager_id, user_id) DO NOTHING;

INSERT INTO manager_ratings (manager_id, user_id, rating, comment)
SELECT m.id, u.id, 3, 'Good regional knowledge but could improve communication.'
FROM managers m, users u WHERE m.name = 'Edward Davis' AND u.email = 'user@speaklogicmap.com'
ON CONFLICT (manager_id, user_id) DO NOTHING;

-- Provider ratings
INSERT INTO provider_ratings (provider_id, user_id, rating, comment)
SELECT p.id, u.id, 5, 'Excellent tech solutions!'
FROM providers p, users u WHERE p.name = 'Tech Solutions Inc' AND u.email = 'user@speaklogicmap.com'
ON CONFLICT (provider_id, user_id) DO NOTHING;

INSERT INTO provider_ratings (provider_id, user_id, rating, comment)
SELECT p.id, u.id, 5, 'Best cloud services in Vietnam.'
FROM providers p, users u WHERE p.name = 'Cloud Services Pro' AND u.email = 'user@speaklogicmap.com'
ON CONFLICT (provider_id, user_id) DO NOTHING;

INSERT INTO provider_ratings (provider_id, user_id, rating, comment)
SELECT p.id, u.id, 4, 'Great marketing results.'
FROM providers p, users u WHERE p.name = 'Digital Marketing Hub' AND u.email = 'dev@speaklogicmap.com'
ON CONFLICT (provider_id, user_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  geopoint_count INTEGER;
  country_count INTEGER;
  city_count INTEGER;
  function_count INTEGER;
  problem_count INTEGER;
  provider_count INTEGER;
  provider_function_count INTEGER;
  provider_problem_count INTEGER;
  provider_rating_count INTEGER;
  manager_count INTEGER;
  manager_function_count INTEGER;
  manager_problem_count INTEGER;
  manager_rating_count INTEGER;
  table_count INTEGER;
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO geopoint_count FROM geopoints;
  SELECT COUNT(*) INTO country_count FROM countries_metadata;
  SELECT COUNT(*) INTO city_count FROM cities_metadata;
  SELECT COUNT(*) INTO function_count FROM functions;
  SELECT COUNT(*) INTO problem_count FROM problems;
  SELECT COUNT(*) INTO provider_count FROM providers;
  SELECT COUNT(*) INTO provider_function_count FROM provider_functions;
  SELECT COUNT(*) INTO provider_problem_count FROM provider_problems;
  SELECT COUNT(*) INTO provider_rating_count FROM provider_ratings;
  SELECT COUNT(*) INTO manager_count FROM managers;
  SELECT COUNT(*) INTO manager_function_count FROM manager_functions;
  SELECT COUNT(*) INTO manager_problem_count FROM manager_problems;
  SELECT COUNT(*) INTO manager_rating_count FROM manager_ratings;
  SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';

  RAISE NOTICE '============================================';
  RAISE NOTICE 'DATABASE INITIALIZED SUCCESSFULLY!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total Tables: %', table_count;
  RAISE NOTICE 'Total Indexes: %', index_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Profiles: %', profile_count;
  RAISE NOTICE 'Geopoints: %', geopoint_count;
  RAISE NOTICE 'Countries: %', country_count;
  RAISE NOTICE 'Cities: %', city_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Functions: %', function_count;
  RAISE NOTICE 'Problems: %', problem_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Providers: %', provider_count;
  RAISE NOTICE 'Provider-Function links: %', provider_function_count;
  RAISE NOTICE 'Provider-Problem links: %', provider_problem_count;
  RAISE NOTICE 'Provider ratings: %', provider_rating_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Managers: %', manager_count;
  RAISE NOTICE 'Manager-Function links: %', manager_function_count;
  RAISE NOTICE 'Manager-Problem links: %', manager_problem_count;
  RAISE NOTICE 'Manager ratings: %', manager_rating_count;
  RAISE NOTICE '============================================';
END $$;

-- ============================================
-- USAGE EXAMPLES (Comment block)
-- ============================================

/*
============================================
USAGE EXAMPLES
============================================

-- 1. Query managers with image_url (direct URL)
SELECT
  m.id,
  m.name,
  m.image_url,  -- Direct URL: '/uploads/managers/alice.jpg'
  m.near_city,
  m.is_given_set,
  m.location_by
FROM managers m
WHERE m.status = 'active';

-- 2. Query providers with filters
SELECT
  p.id,
  p.name,
  p.image_url,
  p.near_city,
  p.is_applicable,  -- Boolean: TRUE/FALSE
  p.location_by     -- Boolean: TRUE/FALSE
FROM providers p
WHERE p.is_applicable = true
  AND p.near_city = 'Hà Nội';

-- 3. Update manager image (direct URL)
UPDATE managers
SET image_url = '/uploads/managers/new-image.jpg'
WHERE name = 'Alice Johnson';

-- 4. Filter by boolean flags
-- Managers using The Given Set
SELECT * FROM managers WHERE is_given_set = true;

-- Providers with Location By enabled
SELECT * FROM providers WHERE location_by = true;

-- Providers that are applicable to The Given Set
SELECT * FROM providers WHERE is_applicable = true;

-- 5. Search by near_city
SELECT * FROM managers WHERE near_city ILIKE '%Ho Chi Minh%';
SELECT * FROM providers WHERE near_city = 'Da Nang';

-- 6. Full-text search
SELECT * FROM managers
WHERE to_tsvector('english', name || ' ' || COALESCE(description, ''))
      @@ plainto_tsquery('english', 'project management');

============================================
*/

