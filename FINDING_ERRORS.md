# How to Find Error Details

## Error Digest: 3608923710

You're seeing this error on `/admin/batches` and `/admin/students` pages. Here's how to find the actual error message:

## Method 1: Vercel Dashboard (If deployed on Vercel)

### Updated Steps (2024):
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project name
3. Click on the **"Deployments"** tab at the top
4. Click on the **latest deployment** (the most recent one)
5. You'll see several tabs:
   - **"Runtime Logs"** - Shows real-time logs
   - **"Function Logs"** - Shows serverless function logs
   - **"Build Logs"** - Shows build-time logs
6. Click on **"Runtime Logs"** or **"Function Logs"**
7. Look for errors that contain:
   - `ERROR IN ADMIN BATCHES PAGE` or `ERROR IN ADMIN STUDENTS PAGE`
   - The digest `3608923710`
   - Lines with `=` characters (these mark the start/end of error logs)

### Alternative Vercel Method:
1. Go to your project dashboard
2. Click **"Settings"** → **"Functions"**
3. Check the logs there

## Method 2: Local Development

If running locally:
1. Check the terminal where you ran `npm run dev` or `npm start`
2. Look for output that starts with:
   ```
   ================================================================================
   ERROR IN ADMIN BATCHES PAGE
   ================================================================================
   ```
3. The full error details will be between these lines

## Method 3: Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors logged by the error boundary
4. You should see: `Admin route error:` with error details

## Method 4: Use the Diagnostics Page

1. Visit `/admin/test-db` in your browser
2. This will test your database connection and show what's wrong
3. It will tell you if `DATABASE_URL` is missing or if there are connection issues

## Method 5: Enable Detailed Errors (Temporary)

To see full error details in the browser:

1. Add this environment variable in Vercel:
   - Go to Project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SHOW_ERRORS` = `true`
   - Redeploy

2. Or if running locally, create `.env.local`:
   ```
   NEXT_PUBLIC_SHOW_ERRORS=true
   ```

**⚠️ Warning:** Only enable this in staging/test environments!

## What to Look For

The error logs will show:
- **Message**: The actual error message
- **Digest**: `3608923710` (the error identifier)
- **Stack**: Full stack trace
- **Environment**: Whether DATABASE_URL is set, etc.

## Common Issues

Based on the error pattern, likely causes:

1. **Missing DATABASE_URL**
   - Check: `hasDatabaseUrl: false` in logs
   - Fix: Set `DATABASE_URL` in environment variables

2. **Database Connection Failed**
   - Check: Connection error in logs
   - Fix: Verify database is running and connection string is correct

3. **Prisma Client Not Generated**
   - Fix: Run `npx prisma generate`

4. **Database Migrations Not Applied**
   - Fix: Run `npx prisma migrate deploy`

## Quick Test

Visit `/admin/test-db` - this page will tell you exactly what's wrong with your database setup.
