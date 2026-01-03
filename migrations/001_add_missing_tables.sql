-- ============================================
-- Migration Script: Add Missing Tables and Columns
-- This script adds tables/columns that exist in init-database.sql
-- but are missing from the current database schema
-- ============================================
-- Run this script to migrate existing database to the full schema
-- ============================================

-- ============================================
-- 1. ALTER EXISTING TABLES
-- ============================================

-- 1.1 Users table: Allow NULL password_hash for OAuth users
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- 1.2 User tokens table: Change token column size (512 -> 64)
-- Note: This may fail if existing tokens are longer than 64 chars
-- In that case, you may need to truncate or delete existing tokens first
-- ALTER TABLE user_tokens ALTER COLUMN token TYPE VARCHAR(64);

-- 1.3 Refresh tokens table: Change token column size (512 -> 128)
-- ALTER TABLE refresh_tokens ALTER COLUMN token TYPE VARCHAR(128);

-- 1.4 Profiles table: Add location column if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- ============================================
-- 2. CREATE NEW TABLES FOR OAUTH (NextAuth.js)
-- ============================================

-- 2.1 OAuth accounts table (for NextAuth.js)
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

-- 2.2 NextAuth sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 NextAuth verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================
-- 3. CREATE METADATA TABLES
-- ============================================

-- 3.1 Countries metadata table
CREATE TABLE IF NOT EXISTS countries_metadata (
  id BIGSERIAL PRIMARY KEY,
  code_name VARCHAR(10) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  main_lat DECIMAL(10,7),
  main_lng DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Cities metadata table
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
-- 4. CREATE FUNCTIONS TABLE (Core entity)
-- ============================================

CREATE TABLE IF NOT EXISTS functions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. CREATE PROBLEMS TABLE (Core entity)
-- ============================================

CREATE TABLE IF NOT EXISTS problems (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. CREATE MANAGER SYSTEM TABLES
-- ============================================

-- 6.1 Managers table
CREATE TABLE IF NOT EXISTS managers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  expertise TEXT,
  image_id BIGINT REFERENCES file_assets(id),
  geo_id BIGINT REFERENCES geopoints(id),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  rating_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  is_given_set BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- 6.2 Manager ratings table
CREATE TABLE IF NOT EXISTS manager_ratings (
  id BIGSERIAL PRIMARY KEY,
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (manager_id, user_id)
);

-- 6.3 Manager-Function junction table
CREATE TABLE IF NOT EXISTS manager_functions (
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  function_id BIGINT NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (manager_id, function_id)
);

-- 6.4 Manager-Problem junction table
CREATE TABLE IF NOT EXISTS manager_problems (
  manager_id BIGINT NOT NULL REFERENCES managers(id) ON DELETE CASCADE,
  problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (manager_id, problem_id)
);

-- ============================================
-- 7. CREATE PROVIDER SYSTEM TABLES
-- ============================================

-- 7.1 Providers table
CREATE TABLE IF NOT EXISTS providers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  website_url VARCHAR(500),
  description TEXT,
  geo_id BIGINT REFERENCES geopoints(id),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  status VARCHAR(20) DEFAULT 'active',
  is_applicable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7.2 Provider ratings table
CREATE TABLE IF NOT EXISTS provider_ratings (
  id BIGSERIAL PRIMARY KEY,
  provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider_id, user_id)
);

-- 7.3 Provider-Function junction table
CREATE TABLE IF NOT EXISTS provider_functions (
  provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  function_id BIGINT NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (provider_id, function_id)
);

-- 7.4 Provider-Problem junction table
CREATE TABLE IF NOT EXISTS provider_problems (
  provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  problem_id BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (provider_id, problem_id)
);

-- ============================================
-- 8. CREATE MISSING INDEXES
-- ============================================

-- 8.1 Users indexes
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 8.2 Refresh tokens indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 8.3 Geopoints indexes
CREATE INDEX IF NOT EXISTS idx_geopoints_country ON geopoints(country);
CREATE INDEX IF NOT EXISTS idx_geopoints_city ON geopoints(city);

-- 8.4 User locations indexes
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_is_live ON user_locations(is_live);

-- 8.5 Countries/Cities metadata indexes
CREATE INDEX IF NOT EXISTS idx_countries_metadata_code ON countries_metadata(code_name);
CREATE INDEX IF NOT EXISTS idx_cities_metadata_country_code ON cities_metadata(country_code);

-- 8.6 OAuth/NextAuth indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);

-- 8.7 Provider system indexes
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(name);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating);
CREATE INDEX IF NOT EXISTS idx_providers_is_applicable ON providers(is_applicable);
CREATE INDEX IF NOT EXISTS idx_providers_geo_id ON providers(geo_id);
CREATE INDEX IF NOT EXISTS idx_providers_created_at ON providers(created_at);

-- 8.8 Functions indexes
CREATE INDEX IF NOT EXISTS idx_functions_name ON functions(name);
CREATE INDEX IF NOT EXISTS idx_functions_category ON functions(category);

-- 8.9 Problems indexes
CREATE INDEX IF NOT EXISTS idx_problems_name ON problems(name);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);

-- 8.10 Provider junction tables indexes
CREATE INDEX IF NOT EXISTS idx_provider_functions_provider_id ON provider_functions(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_functions_function_id ON provider_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_provider_problems_provider_id ON provider_problems(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_problems_problem_id ON provider_problems(problem_id);

-- 8.11 Provider ratings indexes
CREATE INDEX IF NOT EXISTS idx_provider_ratings_provider_id ON provider_ratings(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_ratings_user_id ON provider_ratings(user_id);

-- 8.12 Manager table indexes
CREATE INDEX IF NOT EXISTS idx_managers_user_id ON managers(user_id);
CREATE INDEX IF NOT EXISTS idx_managers_name ON managers(name);
CREATE INDEX IF NOT EXISTS idx_managers_status ON managers(status);
CREATE INDEX IF NOT EXISTS idx_managers_rating ON managers(rating);
CREATE INDEX IF NOT EXISTS idx_managers_is_given_set ON managers(is_given_set);
CREATE INDEX IF NOT EXISTS idx_managers_geo_id ON managers(geo_id);
CREATE INDEX IF NOT EXISTS idx_managers_image_id ON managers(image_id);
CREATE INDEX IF NOT EXISTS idx_managers_created_at ON managers(created_at);

-- 8.13 Manager junction tables indexes
CREATE INDEX IF NOT EXISTS idx_manager_functions_manager_id ON manager_functions(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_functions_function_id ON manager_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_manager_problems_manager_id ON manager_problems(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_problems_problem_id ON manager_problems(problem_id);

-- 8.14 Manager ratings indexes
CREATE INDEX IF NOT EXISTS idx_manager_ratings_manager_id ON manager_ratings(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_ratings_user_id ON manager_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_manager_ratings_rating ON manager_ratings(rating);

-- ============================================
-- 9. CREATE FULL-TEXT SEARCH INDEXES (GIN)
-- ============================================

-- 9.1 Providers FTS indexes
CREATE INDEX IF NOT EXISTS idx_providers_description_fts ON providers USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_providers_name_fts ON providers USING gin(to_tsvector('english', COALESCE(name, '')));

-- 9.2 Functions FTS indexes
CREATE INDEX IF NOT EXISTS idx_functions_name_fts ON functions USING gin(to_tsvector('english', COALESCE(name, '')));

-- 9.3 Problems FTS indexes
CREATE INDEX IF NOT EXISTS idx_problems_name_fts ON problems USING gin(to_tsvector('english', COALESCE(name, '')));

-- 9.4 Managers FTS indexes
CREATE INDEX IF NOT EXISTS idx_managers_name_fts ON managers USING gin(to_tsvector('english', COALESCE(name, '')));
CREATE INDEX IF NOT EXISTS idx_managers_description_fts ON managers USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_managers_expertise_fts ON managers USING gin(to_tsvector('english', COALESCE(expertise, '')));

-- 9.5 Alphabet filter index for managers (A-Z sidebar)
CREATE INDEX IF NOT EXISTS idx_managers_name_first_letter ON managers(UPPER(LEFT(name, 1)));

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================
-- 11. VERIFICATION
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total tables in database: %', table_count;
  RAISE NOTICE 'Total indexes in database: %', index_count;
  RAISE NOTICE '============================================';
END $$;

