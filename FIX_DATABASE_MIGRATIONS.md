# Fix: Database Schema Mismatch Error

## The Problem

You're getting this error:
```
The column `(not available)` does not exist in the current database.
```

This means your **Prisma schema** doesn't match your **production database**. The migrations haven't been applied.

## The Solution

You need to run database migrations to sync your database schema with your Prisma schema.

## Step-by-Step Fix

### Option 1: Using Vercel (Recommended)

1. **Get your production DATABASE_URL:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Copy the `DATABASE_URL` value

2. **Run migrations locally with production DATABASE_URL:**
   ```bash
   # Set the production DATABASE_URL temporarily
   export DATABASE_URL="your-production-database-url-here"
   
   # Run migrations
   npx prisma migrate deploy
   ```

3. **Or use Vercel CLI:**
   ```bash
   # Install Vercel CLI if you haven't
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link your project
   vercel link
   
   # Pull environment variables
   vercel env pull .env.local
   
   # Run migrations
   npx prisma migrate deploy
   ```

### Option 2: Using Vercel Build Command

Add this to your `package.json` scripts:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:migrate:deploy": "prisma migrate deploy"
  }
}
```

Then in Vercel:
1. Go to Project Settings → Build & Development Settings
2. Add a build command that runs migrations:
   ```
   pnpm install && pnpm db:migrate:deploy && pnpm build
   ```

### Option 3: Manual SQL Execution

If you have direct database access:

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Apply all pending migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Or apply migrations manually:**
   - Go to `prisma/migrations/` folder
   - Run each migration SQL file in order on your database

## Verify the Fix

After running migrations:

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```
   Should show: "All migrations have been applied"

2. **Test the connection:**
   - Visit `/admin/test-db` in your app
   - Should show all checks passing

3. **Try accessing the pages again:**
   - `/admin/students` should work
   - `/admin/batches` should work

## Important Notes

⚠️ **Backup First!** If you have important data, backup your database before running migrations.

⚠️ **Production Database:** Make sure you're running migrations against the correct database (production, not local).

⚠️ **Migration Order:** Migrations must be run in order. Don't skip any.

## Quick Command Reference

```bash
# Check what migrations need to be applied
npx prisma migrate status

# Apply all pending migrations
npx prisma migrate deploy

# Generate Prisma client (if needed)
npx prisma generate

# Reset database (⚠️ DESTRUCTIVE - only for development)
npx prisma migrate reset
```

## After Fixing

Once migrations are applied:
1. Your app should work normally
2. The error should disappear
3. All database tables and columns will be in sync
