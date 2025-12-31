/**
 * Supabase client for server-side operations
 * Used for file storage operations
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Supabase client with service role key for admin operations
 * This bypasses RLS (Row Level Security) for server-side operations
 * 
 * Only initialized if Supabase environment variables are provided
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Get the public URL for a file in Supabase Storage (for public buckets)
 */
export function getSupabasePublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Get a signed URL for a file in Supabase Storage (for private buckets)
 * Signed URLs expire after the specified number of seconds (default: 1 year)
 */
export async function getSupabaseSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 60 * 60 * 24 * 365 // 1 year default
): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase client not initialized. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
