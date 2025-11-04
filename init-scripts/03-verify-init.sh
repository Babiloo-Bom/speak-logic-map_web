#!/bin/bash
# Verification script to check if database initialization was successful
# This script runs after SQL scripts

set -e

echo "==========================================="
echo "Verifying database initialization..."
echo "==========================================="

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Check if all tables exist
    SELECT 
        'Tables check:' as check_type,
        COUNT(*) as table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    -- Check users
    SELECT 
        'Users check:' as check_type,
        COUNT(*) as user_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
    FROM users;
    
    -- Check profiles
    SELECT 
        'Profiles check:' as check_type,
        COUNT(*) as profile_count
    FROM profiles;
    
    -- Check geopoints
    SELECT 
        'Geopoints check:' as check_type,
        COUNT(*) as geopoint_count
    FROM geopoints;
    
    -- Check countries metadata
    SELECT 
        'Countries metadata check:' as check_type,
        COUNT(*) as country_count
    FROM countries_metadata;
    
    -- Display summary
    SELECT 
        '=== INITIALIZATION SUMMARY ===' as summary;
EOSQL

echo "==========================================="
echo "Database verification completed!"
echo "==========================================="

