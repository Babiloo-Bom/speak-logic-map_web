-- ============================================
-- Database initialization script for speak-logic-map_web
-- This script creates all tables, indexes, and seed data
-- Run this script to initialize the complete database
-- ============================================

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
-- PROVIDER SYSTEM TABLES
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

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500),  -- Internal URL identifier (e.g., www.urlofprovider.com)
  website_url VARCHAR(500),  -- External website URL
  description TEXT,
  geo_id BIGINT REFERENCES geopoints(id),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),  -- 0.00 to 5.00
  status VARCHAR(20) DEFAULT 'active',  -- active, inactive, pending, suspended
  is_applicable BOOLEAN DEFAULT true,  -- "The Given Set Applicable"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Provider ratings table (per-user ratings, used to compute average rating)
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

-- Provider system indexes
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(name);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating);
CREATE INDEX IF NOT EXISTS idx_providers_is_applicable ON providers(is_applicable);
CREATE INDEX IF NOT EXISTS idx_providers_geo_id ON providers(geo_id);
CREATE INDEX IF NOT EXISTS idx_providers_created_at ON providers(created_at);

-- Full-text search indexes for providers (using GIN for better search performance)
CREATE INDEX IF NOT EXISTS idx_providers_description_fts ON providers USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_providers_name_fts ON providers USING gin(to_tsvector('english', COALESCE(name, '')));

-- Functions indexes
CREATE INDEX IF NOT EXISTS idx_functions_name ON functions(name);
CREATE INDEX IF NOT EXISTS idx_functions_category ON functions(category);
CREATE INDEX IF NOT EXISTS idx_functions_name_fts ON functions USING gin(to_tsvector('english', COALESCE(name, '')));

-- Problems indexes
CREATE INDEX IF NOT EXISTS idx_problems_name ON problems(name);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_name_fts ON problems USING gin(to_tsvector('english', COALESCE(name, '')));

-- Junction tables indexes
CREATE INDEX IF NOT EXISTS idx_provider_functions_provider_id ON provider_functions(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_functions_function_id ON provider_functions(function_id);
CREATE INDEX IF NOT EXISTS idx_provider_problems_provider_id ON provider_problems(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_problems_problem_id ON provider_problems(problem_id);

-- Provider ratings indexes
CREATE INDEX IF NOT EXISTS idx_provider_ratings_provider_id ON provider_ratings(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_ratings_user_id ON provider_ratings(user_id);

-- ============================================
-- GRANT PERMISSIONS (if needed)
-- ============================================

-- PostgreSQL 15+ may need explicit grants
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================
-- INSERT SEED DATA
-- ============================================

-- ============================================
-- INSERT TEST USERS
-- ============================================

-- Test Admin User (password: admin123)
-- Password hash for "admin123" using bcrypt with 12 rounds
INSERT INTO users (email, password_hash, role, status) 
VALUES (
  'admin@speaklogicmap.com', 
  '$2a$12$yzOpJpvS0Mm5ZhcxA1YZTOCepabpX1nuKq.EpFKO2f7Wqwe9AX9ge', 
  'admin', 
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Test Regular User (password: user123)
-- Password hash for "user123" using bcrypt with 12 rounds
INSERT INTO users (email, password_hash, role, status) 
VALUES (
  'user@speaklogicmap.com', 
  '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 
  'user', 
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Test Developer User (password: dev123)
-- Password hash for "dev123" using bcrypt with 12 rounds
INSERT INTO users (email, password_hash, role, status) 
VALUES (
  'dev@speaklogicmap.com', 
  '$2a$12$SpdpzUb4DpcCG8cDjwQunubaC1/XniTa6jzBwJlW5dMic05sq.RQ.', 
  'user', 
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- INSERT TEST PROFILES
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
-- INSERT SAMPLE GEOPOINTS (Hà Nội, Việt Nam)
-- ============================================

INSERT INTO geopoints (lat, lng, city, country) VALUES
  (21.0285, 105.8542, 'Hà Nội', 'Vietnam'),
  (21.0245, 105.8412, 'Hà Nội', 'Vietnam'),
  (10.7769, 106.7009, 'Ho Chi Minh City', 'Vietnam'),
  (16.0544, 108.2022, 'Da Nang', 'Vietnam')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SOME COUNTRIES METADATA (Key countries)
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
-- INSERT SAMPLE CITIES METADATA (Vietnamese cities)
-- ============================================

INSERT INTO cities_metadata (code, name, country_code, lat, lng, country_name) VALUES
  ('HAN', 'Hà Nội', 'VNM', 21.0285, 105.8542, 'Vietnam'),
  ('SGN', 'Ho Chi Minh City', 'VNM', 10.7769, 106.7009, 'Vietnam'),
  ('DAD', 'Da Nang', 'VNM', 16.0544, 108.2022, 'Vietnam'),
  ('HUE', 'Hue', 'VNM', 16.4637, 107.5909, 'Vietnam'),
  ('NHA', 'Nha Trang', 'VNM', 12.2388, 109.1967, 'Vietnam'),
  ('HPH', 'Haiphong', 'VNM', 20.8449, 106.6881, 'Vietnam'),
  ('VTE', 'Vung Tau', 'VNM', 10.3460, 107.0843, 'Vietnam'),
  ('DAL', 'Da Lat', 'VNM', 11.9404, 108.4583, 'Vietnam')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE SIMULATION SETTINGS
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
-- INSERT SAMPLE FUNCTIONS
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
-- INSERT SAMPLE PROBLEMS
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
-- INSERT SAMPLE PROVIDERS
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

-- Insert providers
INSERT INTO providers (user_id, name, url, website_url, description, lat, lng, rating, status, is_applicable) VALUES
  (
    (SELECT id FROM users WHERE email = 'provider1@example.com' LIMIT 1),
    'Tech Solutions Inc',
    'www.urlofprovider.com',
    'https://techsolutions.example.com',
    'Trumps inspectors General has of to expressed dim views of oversight to congressional Trumps inspectors General. As we all know the aspects of providing comprehensive technology solutions for businesses of all sizes.',
    21.0285, 105.8542, 4.5, 'active', true
  ),
  (
    (SELECT id FROM users WHERE email = 'provider2@example.com' LIMIT 1),
    'Cloud Services Pro',
    'wider.com',
    'https://cloudpro.example.com',
    'Leading provider of cloud infrastructure and hosting services. We help businesses migrate to the cloud and optimize their IT infrastructure for better performance and cost efficiency.',
    10.7769, 106.7009, 4.8, 'active', true
  ),
  (
    (SELECT id FROM users WHERE email = 'provider3@example.com' LIMIT 1),
    'Digital Marketing Hub',
    'www.digitalmarketing.com',
    'https://digitalmarketing.example.com',
    'Expert digital marketing services including SEO, social media marketing, content creation, and online advertising. We help businesses grow their online presence and reach their target audience.',
    16.0544, 108.2022, 4.2, 'active', true
  ),
  (
    (SELECT id FROM users WHERE email = 'provider4@example.com' LIMIT 1),
    'Software Development Co',
    'www.softdev.com',
    'https://softdev.example.com',
    'Custom software development services specializing in web applications, mobile apps, and enterprise solutions. We deliver high-quality software tailored to your business needs.',
    21.0245, 105.8412, 4.7, 'active', true
  ),
  (
    (SELECT id FROM users WHERE email = 'provider5@example.com' LIMIT 1),
    'Data Analytics Experts',
    'www.dataanalytics.com',
    'https://dataanalytics.example.com',
    'Transform your data into actionable insights. We provide data analytics, business intelligence, and machine learning solutions to help you make informed decisions.',
    10.7769, 106.7009, 4.6, 'active', true
  ),
  (
    (SELECT id FROM users WHERE email = 'provider6@example.com' LIMIT 1),
    'E-commerce Solutions',
    'www.ecommercesolutions.com',
    'https://ecommerce.example.com',
    'Complete e-commerce solutions including online store setup, payment integration, inventory management, and customer support. We help businesses sell online successfully.',
    16.0544, 108.2022, 4.3, 'active', true
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- LINK PROVIDERS TO FUNCTIONS
-- ============================================

-- Tech Solutions Inc -> Sell Software, Software Development, IT Consulting
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Tech Solutions Inc'
  AND f.name IN ('Sell Software', 'Software Development', 'IT Consulting')
ON CONFLICT DO NOTHING;

-- Cloud Services Pro -> Cloud Services, IT Consulting
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Cloud Services Pro'
  AND f.name IN ('Cloud Services', 'IT Consulting')
ON CONFLICT DO NOTHING;

-- Digital Marketing Hub -> Digital Marketing, Web Design
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Digital Marketing Hub'
  AND f.name IN ('Digital Marketing', 'Web Design')
ON CONFLICT DO NOTHING;

-- Software Development Co -> Software Development, Mobile App Development
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Software Development Co'
  AND f.name IN ('Software Development', 'Mobile App Development')
ON CONFLICT DO NOTHING;

-- Data Analytics Experts -> Data Analytics, IT Consulting
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Data Analytics Experts'
  AND f.name IN ('Data Analytics', 'IT Consulting')
ON CONFLICT DO NOTHING;

-- E-commerce Solutions -> E-commerce Solutions, Web Design
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'E-commerce Solutions'
  AND f.name IN ('E-commerce Solutions', 'Web Design')
ON CONFLICT DO NOTHING;

-- ============================================
-- LINK PROVIDERS TO PROBLEMS
-- ============================================

-- Tech Solutions Inc -> Remote Employee Management, System Integration
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Tech Solutions Inc'
  AND pr.name IN ('Remote Employee Management', 'System Integration')
ON CONFLICT DO NOTHING;

-- Cloud Services Pro -> Scalability Issues, Cost Reduction
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Cloud Services Pro'
  AND pr.name IN ('Scalability Issues', 'Cost Reduction')
ON CONFLICT DO NOTHING;

-- Digital Marketing Hub -> Customer Support, Performance Optimization
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Digital Marketing Hub'
  AND pr.name IN ('Customer Support', 'Performance Optimization')
ON CONFLICT DO NOTHING;

-- Software Development Co -> Legacy System Migration, Performance Optimization
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Software Development Co'
  AND pr.name IN ('Legacy System Migration', 'Performance Optimization')
ON CONFLICT DO NOTHING;

-- Data Analytics Experts -> Data Security, Performance Optimization
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Data Analytics Experts'
  AND pr.name IN ('Data Security', 'Performance Optimization')
ON CONFLICT DO NOTHING;

-- E-commerce Solutions -> Payment Processing, Inventory Management
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'E-commerce Solutions'
  AND pr.name IN ('Payment Processing', 'Inventory Management')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Display summary of inserted data
DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  geopoint_count INTEGER;
  country_count INTEGER;
  function_count INTEGER;
  problem_count INTEGER;
  provider_count INTEGER;
  provider_function_count INTEGER;
  provider_problem_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO geopoint_count FROM geopoints;
  SELECT COUNT(*) INTO country_count FROM countries_metadata;
  SELECT COUNT(*) INTO function_count FROM functions;
  SELECT COUNT(*) INTO problem_count FROM problems;
  SELECT COUNT(*) INTO provider_count FROM providers;
  SELECT COUNT(*) INTO provider_function_count FROM provider_functions;
  SELECT COUNT(*) INTO provider_problem_count FROM provider_problems;
  
  RAISE NOTICE 'Database initialized successfully!';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Profiles: %', profile_count;
  RAISE NOTICE 'Geopoints: %', geopoint_count;
  RAISE NOTICE 'Countries metadata: %', country_count;
  RAISE NOTICE 'Functions: %', function_count;
  RAISE NOTICE 'Problems: %', problem_count;
  RAISE NOTICE 'Providers: %', provider_count;
  RAISE NOTICE 'Provider-Function links: %', provider_function_count;
  RAISE NOTICE 'Provider-Problem links: %', provider_problem_count;
END $$;
