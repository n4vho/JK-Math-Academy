#!/bin/bash

# Database Migration Script
# This script runs Prisma migrations against your production database

# Set your production DATABASE_URL here
export DATABASE_URL="postgresql://postgres.xsskarimpydinfqlwaej:Ann@beth11235Ch4s3@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require"

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
