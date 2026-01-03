# Debugging Server Component Errors

When you see the error "An error occurred in the Server Components render" in production, follow these steps to find the root cause:

## Step 1: Check the Error Digest

The error boundary will display an **Error Digest** on the error page. This is a unique identifier for the error.

## Step 2: Check Server Logs

The error details are logged to your server console. Check your hosting platform's logs:

### Vercel
1. Go to your project dashboard
2. Click on "Deployments"
3. Click on the latest deployment
4. Click on "Functions" tab
5. Look for error logs with the digest

### Local Development
Run `npm run dev` and check the terminal output - errors will be logged there.

### Production Server
If running on your own server, check:
- Docker logs: `docker logs <container-name>`
- PM2 logs: `pm2 logs`
- System logs: `journalctl -u your-service`

## Step 3: Look for These Log Patterns

The error logging includes:
```
================================================================================
ERROR IN ADMIN [PAGE NAME] PAGE
================================================================================
Message: [error message]
Digest: [error digest]
Stack: [stack trace]
Environment: { hasDatabaseUrl: true/false, nodeEnv: 'production', ... }
Full error object: [complete error details]
================================================================================
```

## Step 4: Common Causes

### Missing DATABASE_URL
If `hasDatabaseUrl: false`, you need to set the `DATABASE_URL` environment variable.

### Database Connection Issues
- Check if your database is accessible
- Verify connection string format
- Check SSL settings for Supabase/cloud databases

### Prisma Client Issues
- Run `npx prisma generate` to regenerate Prisma client
- Run `npx prisma migrate deploy` to apply migrations

## Step 5: Enable Detailed Error Display

To see errors in the browser (for debugging only):

1. Set environment variable: `NEXT_PUBLIC_SHOW_ERRORS=true`
2. Redeploy your application
3. Errors will now show detailed information in the UI

**⚠️ Warning:** Only enable this in staging/test environments, not production!

## Step 6: Test Locally

To reproduce the error locally:

```bash
# Build production version
npm run build

# Start production server
npm start

# Visit the page that's failing
# Check terminal for detailed error logs
```

## Step 7: Check Browser Console

Open browser DevTools (F12) and check:
- Console tab for client-side errors
- Network tab for failed requests
- The error boundary will log details to console

## Getting Help

When reporting the error, include:
1. The error digest from the error page
2. Server logs showing the full error
3. Environment details (hasDatabaseUrl, nodeEnv, etc.)
4. Steps to reproduce
