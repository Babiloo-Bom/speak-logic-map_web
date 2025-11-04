#!/bin/sh
set -e

echo "=========================================="
echo "=== Docker Entrypoint: Starting ==="
echo "Current user: $(whoami)"
echo "=========================================="

# Ensure .next directory exists
mkdir -p /app/.next
chmod 755 /app/.next

# ALWAYS FORCE CREATE routes-manifest.json (entrypoint runs as root)
echo '{"version":3,"pages404":true,"basePath":"","redirects":[],"rewrites":[],"headers":[]}' > /app/.next/routes-manifest.json
chmod 644 /app/.next/routes-manifest.json
echo "✓ FORCED routes-manifest.json creation"

# Ensure BUILD_ID exists
if [ ! -f /app/.next/BUILD_ID ]; then
  echo "$(date +%s)" > /app/.next/BUILD_ID
  chmod 644 /app/.next/BUILD_ID
  echo "✓ Created BUILD_ID"
fi

# Set ownership and permissions
chown -R nextjs:nodejs /app/.next
chmod -R u+w /app/.next

# Final verification with error if missing
echo "=== Final Verification ==="
if [ ! -f /app/.next/routes-manifest.json ]; then
  echo "✗✗✗ FATAL: routes-manifest.json MISSING AFTER CREATION! ✗✗✗"
  ls -la /app/.next/
  exit 1
fi

echo "✓ routes-manifest.json verified:"
cat /app/.next/routes-manifest.json
ls -la /app/.next/routes-manifest.json /app/.next/BUILD_ID

# Switch to nextjs user and start
echo "=== Switching to nextjs user ==="
exec su-exec nextjs npm start

