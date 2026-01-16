#!/bin/bash

# Database Migration Script
# This script runs Prisma migrations against your production database

# Requires DATABASE_URL to be set in your environment.
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set. Export it before running this script."
  echo "Example:"
  echo "  export DATABASE_URL=\"postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require\""
  exit 1
fi

echo "🔍 Checking migration status..."
npx prisma migrate status

echo ""
echo "🚀 Deploying migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migration complete! Checking status again..."
npx prisma migrate status

echo ""
echo "✨ Done! Your database should now be in sync."
