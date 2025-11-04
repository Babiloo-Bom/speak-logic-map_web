-- Seed initial data for testing and development
-- This script runs after schema initialization

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
-- VERIFICATION QUERIES
-- ============================================

-- Display summary of inserted data
DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
  geopoint_count INTEGER;
  country_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO geopoint_count FROM geopoints;
  SELECT COUNT(*) INTO country_count FROM countries_metadata;
  
  RAISE NOTICE 'Database initialized successfully!';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Profiles: %', profile_count;
  RAISE NOTICE 'Geopoints: %', geopoint_count;
  RAISE NOTICE 'Countries metadata: %', country_count;
END $$;

