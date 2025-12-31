# Supabase Storage Setup - Step by Step Guide

This guide walks you through setting up Supabase Storage for student photo uploads with a **private bucket** (recommended for security).

## Prerequisites

- A Supabase account (sign up at https://supabase.com if you don't have one)
- Your Next.js project ready

---

## Step 1: Install the Supabase Package

Open your terminal in the project directory and run:

```bash
pnpm add @supabase/supabase-js
```

This installs the Supabase JavaScript client library.

---

## Step 2: Create a Supabase Project

1. Go to https://supabase.com and sign in (or create an account)
2. Click **"New Project"** (or **"New Organization"** if this is your first project)
3. Fill in:
   - **Organization**: Select or create one
   - **Name**: Give your project a name (e.g., "Tutoring MVP")
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be created

---

## Step 3: Create a Storage Bucket

1. In your Supabase project dashboard, click **"Storage"** in the left sidebar
2. Click **"New bucket"** button
3. Fill in:
   - **Name**: `student-photos` (or your preferred name)
   - **Public bucket**: **Leave this UNCHECKED** (we want a private bucket for security)
4. Click **"Create bucket"**

✅ Your bucket is now created and private!

---

## Step 4: Get Your Supabase Credentials

You need two values from your Supabase project:

### A. Get Your Project URL

1. In Supabase dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the settings menu
3. Find **"Project URL"** - it looks like: `https://abcdefghijklmnop.supabase.co`
4. Copy this URL

### B. Get Your Service Role Key

1. Still in **Settings → API**
2. Find the **"service_role"** key (NOT the `anon` key!)
   - It's a long string starting with `eyJ...`
   - ⚠️ **IMPORTANT**: This key has admin access - keep it secret!
3. Click the eye icon to reveal it, then copy it

---

## Step 5: Add Environment Variables

1. In your project root, open or create `.env.local` file
2. Add these lines (replace with YOUR actual values):

```env
# Storage Provider - set to "supabase" to use Supabase Storage
STORAGE_PROVIDER=supabase

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=student-photos

# Set to false for private bucket (recommended for security)
SUPABASE_BUCKET_PUBLIC=false
```

**Example with real values:**
```env
STORAGE_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
SUPABASE_STORAGE_BUCKET=student-photos
SUPABASE_BUCKET_PUBLIC=false
```

**Important Notes:**
- Replace `https://your-project-id.supabase.co` with your actual Project URL
- Replace `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual service_role key
- Make sure `SUPABASE_BUCKET_PUBLIC=false` for a private bucket
- The bucket name (`student-photos`) should match what you created in Step 3

---

## Step 6: Restart Your Development Server

Environment variables are only loaded when the server starts, so:

1. Stop your current dev server (press `Ctrl+C` in the terminal)
2. Start it again:

```bash
pnpm dev
```

---

## Step 7: Test the Setup

1. Go to your admin panel: `http://localhost:3000/admin/students`
2. Click on any student to view their details
3. In the sidebar, you should see the **"Student Photo"** card
4. Click **"Upload Photo"**
5. Select an image file (JPEG, PNG, or WebP, max 5MB)
6. Click **"Save Photo"**
7. The photo should upload and display!

If you see an error, check:
- Are all environment variables set correctly?
- Did you restart the dev server after adding env variables?
- Is the bucket name correct?
- Is the service_role key correct?

---

## How It Works

### With Private Bucket (`SUPABASE_BUCKET_PUBLIC=false`):

1. **Upload**: When you upload a photo, Supabase generates a **signed URL** that expires in 1 year
2. **Storage**: The signed URL is saved in your database
3. **Display**: Photos are displayed using the signed URL
4. **Security**: Only people with the signed URL can access the photo (more secure!)

### With Public Bucket (`SUPABASE_BUCKET_PUBLIC=true`):

1. **Upload**: Photo gets a permanent public URL
2. **Storage**: The public URL is saved in your database
3. **Display**: Anyone with the URL can access the photo
4. **Security**: Less secure, but simpler

---

## Switching Between Storage Providers

You can easily switch between local filesystem (for development) and Supabase (for production):

### Use Local Storage (Development):
```env
STORAGE_PROVIDER=local
```

### Use Supabase Storage (Production):
```env
STORAGE_PROVIDER=supabase
```

**Remember**: After changing environment variables, restart your dev server!

---

## Troubleshooting

### Error: "Supabase client not initialized"
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Make sure there are no extra spaces or quotes in your `.env.local` file
- Restart your dev server

### Error: "Failed to upload file to Supabase"
- Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct (service_role key, not anon key)
- Check that the bucket name matches `SUPABASE_STORAGE_BUCKET`
- Ensure the bucket exists in your Supabase dashboard

### Error: "Bucket not found"
- Go to Supabase dashboard → Storage
- Verify the bucket name matches what's in your `.env.local`
- Make sure the bucket was created successfully

### Photos not displaying
- Check browser console for errors
- Verify the photo URL was saved in the database
- For private buckets, check that signed URLs are being generated correctly

### Environment variables not working
- Make sure the file is named `.env.local` (not `.env` or `.env.local.txt`)
- Restart your dev server after adding/changing variables
- Check that variables don't have quotes around them (unless the value itself needs quotes)

---

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Keep service_role key secret** - Never expose it in client-side code
3. **Use private buckets** - Set `SUPABASE_BUCKET_PUBLIC=false` for better security
4. **Rotate keys periodically** - If a key is compromised, regenerate it in Supabase dashboard

---

## What's Next?

Once setup is complete:
- Photos will be stored securely in Supabase Storage
- Uploads work from the admin panel
- Photos display in student profiles and admin views
- Old photos are automatically deleted when replaced

Need help? Check the main documentation in `docs/SUPABASE_SETUP.md` or review the error messages in your terminal/browser console.
