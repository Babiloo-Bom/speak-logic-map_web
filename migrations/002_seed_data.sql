-- ============================================
-- Migration Script: Seed Data
-- This script inserts sample/test data into the database
-- Run this AFTER 001_add_missing_tables.sql
-- ============================================

-- ============================================
-- 1. INSERT SAMPLE FUNCTIONS
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
-- 2. INSERT SAMPLE PROBLEMS
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
-- 3. INSERT SAMPLE GEOPOINTS
-- ============================================

INSERT INTO geopoints (lat, lng, city, country) VALUES
  (21.0285, 105.8542, 'Hà Nội', 'Vietnam'),
  (21.0245, 105.8412, 'Hà Nội', 'Vietnam'),
  (10.7769, 106.7009, 'Ho Chi Minh City', 'Vietnam'),
  (16.0544, 108.2022, 'Da Nang', 'Vietnam')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. INSERT COUNTRIES METADATA
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
-- 5. INSERT CITIES METADATA
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
-- 6. CREATE PROVIDER USERS
-- ============================================

-- Password hash for "user123" using bcrypt with 12 rounds
INSERT INTO users (email, password_hash, role, status) VALUES
  ('provider1@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider2@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider3@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider4@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider5@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active'),
  ('provider6@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'provider', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 7. INSERT SAMPLE PROVIDERS
-- ============================================

INSERT INTO providers (user_id, name, url, website_url, description, lat, lng, rating, status, is_applicable)
SELECT 
  u.id,
  'Tech Solutions Inc',
  'www.urlofprovider.com',
  'https://techsolutions.example.com',
  'Comprehensive technology solutions for businesses of all sizes.',
  21.0285, 105.8542, 4.5, 'active', true
FROM users u WHERE u.email = 'provider1@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO providers (user_id, name, url, website_url, description, lat, lng, rating, status, is_applicable)
SELECT 
  u.id,
  'Cloud Services Pro',
  'wider.com',
  'https://cloudpro.example.com',
  'Leading provider of cloud infrastructure and hosting services.',
  10.7769, 106.7009, 4.8, 'active', true
FROM users u WHERE u.email = 'provider2@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO providers (user_id, name, url, website_url, description, lat, lng, rating, status, is_applicable)
SELECT 
  u.id,
  'Digital Marketing Hub',
  'www.digitalmarketing.com',
  'https://digitalmarketing.example.com',
  'Expert digital marketing services including SEO and social media.',
  16.0544, 108.2022, 4.2, 'active', true
FROM users u WHERE u.email = 'provider3@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO providers (user_id, name, url, website_url, description, lat, lng, rating, status, is_applicable)
SELECT 
  u.id,
  'Software Development Co',
  'www.softdev.com',
  'https://softdev.example.com',
  'Custom software development services for web and mobile.',
  21.0245, 105.8412, 4.7, 'active', true
FROM users u WHERE u.email = 'provider4@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO providers (user_id, name, url, website_url, description, lat, lng, rating, status, is_applicable)
SELECT 
  u.id,
  'Data Analytics Experts',
  'www.dataanalytics.com',
  'https://dataanalytics.example.com',
  'Transform your data into actionable insights.',
  10.7769, 106.7009, 4.6, 'active', true
FROM users u WHERE u.email = 'provider5@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO providers (user_id, name, url, website_url, description, lat, lng, rating, status, is_applicable)
SELECT 
  u.id,
  'E-commerce Solutions',
  'www.ecommercesolutions.com',
  'https://ecommerce.example.com',
  'Complete e-commerce solutions for online businesses.',
  16.0544, 108.2022, 4.3, 'active', true
FROM users u WHERE u.email = 'provider6@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. LINK PROVIDERS TO FUNCTIONS
-- ============================================

-- Tech Solutions Inc
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Tech Solutions Inc'
  AND f.name IN ('Sell Software', 'Software Development', 'IT Consulting')
ON CONFLICT DO NOTHING;

-- Cloud Services Pro
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Cloud Services Pro'
  AND f.name IN ('Cloud Services', 'IT Consulting')
ON CONFLICT DO NOTHING;

-- Digital Marketing Hub
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Digital Marketing Hub'
  AND f.name IN ('Digital Marketing', 'Web Design')
ON CONFLICT DO NOTHING;

-- Software Development Co
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Software Development Co'
  AND f.name IN ('Software Development', 'Mobile App Development')
ON CONFLICT DO NOTHING;

-- Data Analytics Experts
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'Data Analytics Experts'
  AND f.name IN ('Data Analytics', 'IT Consulting')
ON CONFLICT DO NOTHING;

-- E-commerce Solutions
INSERT INTO provider_functions (provider_id, function_id)
SELECT p.id, f.id
FROM providers p, functions f
WHERE p.name = 'E-commerce Solutions'
  AND f.name IN ('E-commerce Solutions', 'Web Design')
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. LINK PROVIDERS TO PROBLEMS
-- ============================================

-- Tech Solutions Inc
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Tech Solutions Inc'
  AND pr.name IN ('Remote Employee Management', 'System Integration')
ON CONFLICT DO NOTHING;

-- Cloud Services Pro
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Cloud Services Pro'
  AND pr.name IN ('Scalability Issues', 'Cost Reduction')
ON CONFLICT DO NOTHING;

-- Digital Marketing Hub
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Digital Marketing Hub'
  AND pr.name IN ('Customer Support', 'Performance Optimization')
ON CONFLICT DO NOTHING;

-- Software Development Co
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Software Development Co'
  AND pr.name IN ('Legacy System Migration', 'Performance Optimization')
ON CONFLICT DO NOTHING;

-- Data Analytics Experts
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'Data Analytics Experts'
  AND pr.name IN ('Data Security', 'Performance Optimization')
ON CONFLICT DO NOTHING;

-- E-commerce Solutions
INSERT INTO provider_problems (provider_id, problem_id)
SELECT p.id, pr.id
FROM providers p, problems pr
WHERE p.name = 'E-commerce Solutions'
  AND pr.name IN ('Payment Processing', 'Inventory Management')
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. CREATE MANAGER USERS
-- ============================================

INSERT INTO users (email, password_hash, role, status) VALUES
  ('manager1@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager2@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager3@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager4@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager5@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active'),
  ('manager6@example.com', '$2a$12$1XQSRRgMWzsL88VKI3uSgeuh7/.Xer.PdxH/gaVSs7ncCW3rF4wJW', 'manager', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 11. CREATE PROFILES FOR MANAGERS
-- ============================================

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Alice', 'Johnson', 'Senior Project Manager', 'Project Management'
FROM users WHERE email = 'manager1@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
  title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Bob', 'Smith', 'Operations Manager', 'Operations'
FROM users WHERE email = 'manager2@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
  title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Charlie', 'Brown', 'Technical Manager', 'Technical Leadership'
FROM users WHERE email = 'manager3@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
  title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Diana', 'Wilson', 'Product Manager', 'Product Development'
FROM users WHERE email = 'manager4@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
  title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Edward', 'Davis', 'Regional Manager', 'Regional Operations'
FROM users WHERE email = 'manager5@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
  title = EXCLUDED.title, function = EXCLUDED.function;

INSERT INTO profiles (user_id, first_name, last_name, title, function)
SELECT id, 'Nguyen', 'Van Minh', 'Area Manager', 'Area Operations'
FROM users WHERE email = 'manager6@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
  title = EXCLUDED.title, function = EXCLUDED.function;

-- ============================================
-- 12. INSERT SAMPLE MANAGERS
-- ============================================

INSERT INTO managers (user_id, name, description, expertise, lat, lng, rating, rating_count, status, is_given_set)
SELECT 
  id,
  'Alice Johnson',
  'Experienced project manager with 10+ years in software development.',
  'Project Management, Agile, Scrum, Team Leadership',
  21.0285, 105.8542, 4.8, 25, 'active', true
FROM users WHERE email = 'manager1@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, lat, lng, rating, rating_count, status, is_given_set)
SELECT 
  id,
  'Bob Smith',
  'Operations manager focused on process optimization.',
  'Operations, Supply Chain, Logistics, Process Optimization',
  10.7769, 106.7009, 4.5, 18, 'active', true
FROM users WHERE email = 'manager2@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, lat, lng, rating, rating_count, status, is_given_set)
SELECT 
  id,
  'Charlie Brown',
  'Technical manager with deep expertise in cloud architecture.',
  'Cloud Architecture, DevOps, AWS, Kubernetes',
  16.0544, 108.2022, 4.2, 12, 'active', false
FROM users WHERE email = 'manager3@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, lat, lng, rating, rating_count, status, is_given_set)
SELECT 
  id,
  'Diana Wilson',
  'Product manager passionate about user experience.',
  'Product Management, UX Design, Data Analytics',
  21.0245, 105.8412, 4.9, 32, 'active', true
FROM users WHERE email = 'manager4@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, lat, lng, rating, rating_count, status, is_given_set)
SELECT 
  id,
  'Edward Davis',
  'Regional manager overseeing operations across Southeast Asia.',
  'Regional Management, Cross-cultural Leadership',
  10.7769, 106.7009, 3.8, 8, 'active', false
FROM users WHERE email = 'manager5@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO managers (user_id, name, description, expertise, lat, lng, rating, rating_count, status, is_given_set)
SELECT 
  id,
  'Nguyen Van Minh',
  'Area manager with extensive experience in Vietnam market.',
  'Local Market Expertise, Partnership Development',
  21.0285, 105.8542, 4.6, 15, 'active', true
FROM users WHERE email = 'manager6@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 13. LINK MANAGERS TO FUNCTIONS
-- ============================================

-- Alice Johnson
INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id
FROM managers m, functions f
WHERE m.name = 'Alice Johnson'
  AND f.name IN ('Software Development', 'IT Consulting')
ON CONFLICT DO NOTHING;

-- Bob Smith
INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id
FROM managers m, functions f
WHERE m.name = 'Bob Smith'
  AND f.name IN ('Cloud Services', 'E-commerce Solutions')
ON CONFLICT DO NOTHING;

-- Charlie Brown
INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id
FROM managers m, functions f
WHERE m.name = 'Charlie Brown'
  AND f.name IN ('Cloud Services', 'Software Development', 'Cybersecurity')
ON CONFLICT DO NOTHING;

-- Diana Wilson
INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id
FROM managers m, functions f
WHERE m.name = 'Diana Wilson'
  AND f.name IN ('Digital Marketing', 'Web Design', 'Data Analytics')
ON CONFLICT DO NOTHING;

-- Edward Davis
INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id
FROM managers m, functions f
WHERE m.name = 'Edward Davis'
  AND f.name IN ('IT Consulting', 'Sell Software')
ON CONFLICT DO NOTHING;

-- Nguyen Van Minh
INSERT INTO manager_functions (manager_id, function_id)
SELECT m.id, f.id
FROM managers m, functions f
WHERE m.name = 'Nguyen Van Minh'
  AND f.name IN ('E-commerce Solutions', 'Digital Marketing')
ON CONFLICT DO NOTHING;

-- ============================================
-- 14. LINK MANAGERS TO PROBLEMS
-- ============================================

-- Alice Johnson
INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id
FROM managers m, problems pr
WHERE m.name = 'Alice Johnson'
  AND pr.name IN ('Remote Employee Management', 'Performance Optimization')
ON CONFLICT DO NOTHING;

-- Bob Smith
INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id
FROM managers m, problems pr
WHERE m.name = 'Bob Smith'
  AND pr.name IN ('Cost Reduction', 'Inventory Management')
ON CONFLICT DO NOTHING;

-- Charlie Brown
INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id
FROM managers m, problems pr
WHERE m.name = 'Charlie Brown'
  AND pr.name IN ('Scalability Issues', 'Data Security', 'System Integration')
ON CONFLICT DO NOTHING;

-- Diana Wilson
INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id
FROM managers m, problems pr
WHERE m.name = 'Diana Wilson'
  AND pr.name IN ('Customer Support', 'Performance Optimization')
ON CONFLICT DO NOTHING;

-- Edward Davis
INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id
FROM managers m, problems pr
WHERE m.name = 'Edward Davis'
  AND pr.name IN ('Legacy System Migration', 'Cost Reduction')
ON CONFLICT DO NOTHING;

-- Nguyen Van Minh
INSERT INTO manager_problems (manager_id, problem_id)
SELECT m.id, pr.id
FROM managers m, problems pr
WHERE m.name = 'Nguyen Van Minh'
  AND pr.name IN ('Payment Processing', 'Customer Support')
ON CONFLICT DO NOTHING;

-- ============================================
-- 15. VERIFICATION
-- ============================================

DO $$
DECLARE
  function_count INTEGER;
  problem_count INTEGER;
  provider_count INTEGER;
  manager_count INTEGER;
  geopoint_count INTEGER;
  country_count INTEGER;
  city_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count FROM functions;
  SELECT COUNT(*) INTO problem_count FROM problems;
  SELECT COUNT(*) INTO provider_count FROM providers;
  SELECT COUNT(*) INTO manager_count FROM managers;
  SELECT COUNT(*) INTO geopoint_count FROM geopoints;
  SELECT COUNT(*) INTO country_count FROM countries_metadata;
  SELECT COUNT(*) INTO city_count FROM cities_metadata;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Functions: %', function_count;
  RAISE NOTICE 'Problems: %', problem_count;
  RAISE NOTICE 'Providers: %', provider_count;
  RAISE NOTICE 'Managers: %', manager_count;
  RAISE NOTICE 'Geopoints: %', geopoint_count;
  RAISE NOTICE 'Countries metadata: %', country_count;
  RAISE NOTICE 'Cities metadata: %', city_count;
  RAISE NOTICE '============================================';
END $$;

