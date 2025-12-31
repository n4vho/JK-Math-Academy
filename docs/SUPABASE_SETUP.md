# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage for student photo uploads.

**📖 For a detailed step-by-step walkthrough, see [SUPABASE_SETUP_STEP_BY_STEP.md](./SUPABASE_SETUP_STEP_BY_STEP.md)**

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Installation

Install the Supabase JavaScript client:

```bash
pnpm add @supabase/supabase-js
```

## Supabase Project Setup

### 1. Create a Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New bucket**
4. Name it: `student-photos` (or your preferred name)
5. Choose bucket visibility:
   - **Public**: Anyone with the URL can access photos (simpler, less secure)
   - **Private**: Photos require signed URLs (more secure, recommended)
6. Click **Create bucket**

**Security Recommendation**: Use a **Private** bucket for better security. The implementation supports both public and private buckets.

### 2. Set Up Bucket Policies (Optional but Recommended)

For security, you can set up RLS policies. However, since we're using the service role key for uploads, the bucket can remain public for read access.

If you want to restrict access:
1. Go to **Storage** → **Policies**
2. Create policies for your bucket

## Environment Variables

Add these to your `.env.local` file:

```env
# Storage Provider (set to "supabase" to use Supabase Storage)
STORAGE_PROVIDER=supabase

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=student-photos

# Bucket visibility (true for public, false for private)
# Default: true (public bucket)
SUPABASE_BUCKET_PUBLIC=false

# Optional: If using local storage instead
# STORAGE_PROVIDER=local
# UPLOAD_PATH=./public/uploads/students
# PUBLIC_URL=/uploads/students
```

### Getting Your Supabase Credentials

1. **NEXT_PUBLIC_SUPABASE_URL**:
   - Go to **Settings** → **API**
   - Copy the **Project URL**

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - Go to **Settings** → **API**
   - Copy the **service_role** key (⚠️ Keep this secret! Never expose it in client-side code)

3. **SUPABASE_STORAGE_BUCKET**:
   - The name of your bucket (default: `student-photos`)

## Switching Between Storage Providers

To switch between local and Supabase storage, simply change the `STORAGE_PROVIDER` environment variable:

- `STORAGE_PROVIDER=local` - Uses local filesystem (dev only)
- `STORAGE_PROVIDER=supabase` - Uses Supabase Storage (production)

## File Structure

Files are stored in Supabase Storage with the following structure:
```
student-photos/
  └── students/
      └── {studentId}-{timestamp}.{ext}
```

Example: `student-photos/students/clx123-1704067200000.jpg`

## Testing

After setup, test the upload functionality:

1. Go to `/admin/students/[id]`
2. Click "Upload Photo"
3. Select an image file
4. Click "Save Photo"
5. Verify the photo appears and is accessible

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure all required environment variables are set in `.env.local`
- Restart your Next.js dev server after adding environment variables

### Error: "Failed to upload file to Supabase"
- Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that the bucket name matches `SUPABASE_STORAGE_BUCKET`
- Ensure the bucket exists and is public

### Error: "Bucket not found"
- Verify the bucket name in Supabase dashboard matches your `SUPABASE_STORAGE_BUCKET` env variable
- Make sure the bucket is created and accessible

### Photos not displaying
- Check that the bucket is set to **Public**
- Verify the public URL format is correct
- Check browser console for CORS or access errors

## Public vs Private Buckets

### Public Bucket
- **Pros**: Simpler, direct URL access, no expiration
- **Cons**: Anyone with the URL can access photos
- **Use case**: When photos don't contain sensitive information

### Private Bucket (Recommended)
- **Pros**: More secure, requires authentication to generate URLs
- **Cons**: URLs expire (default: 1 year), requires signed URL generation
- **Use case**: When you want to control access to student photos

**How it works with private buckets:**
- When uploading, a signed URL is generated (valid for 1 year)
- The signed URL is stored in the database
- If a URL expires, use the `/api/students/[id]/photo-url` endpoint to refresh it

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS)
- Never expose this key in client-side code
- Only use it in server-side API routes
- For private buckets, signed URLs expire after 1 year (configurable)
- Consider setting up bucket policies for additional security if needed
