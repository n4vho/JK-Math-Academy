/**
 * Storage abstraction layer for file uploads
 * 
 * Supports both local filesystem storage (dev) and Supabase Storage (production).
 * Switch providers via STORAGE_PROVIDER environment variable.
 */

import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { supabaseAdmin, getSupabasePublicUrl, getSupabaseSignedUrl } from "./supabase";

export interface StorageConfig {
  provider: "local" | "supabase";
  // Local storage config
  localPath?: string;
  publicUrl?: string;
  // Supabase config
  supabaseUrl?: string;
  supabaseBucket?: string;
  supabaseBucketPublic?: boolean; // Whether the bucket is public or private
}

const config: StorageConfig = {
  provider: (process.env.STORAGE_PROVIDER as "local" | "supabase") || "local",
  localPath: process.env.UPLOAD_PATH || join(process.cwd(), "public", "uploads", "students"),
  publicUrl: process.env.PUBLIC_URL || "/uploads/students",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || "student-photos",
  supabaseBucketPublic: process.env.SUPABASE_BUCKET_PUBLIC !== "false", // Default to true (public)
};

/**
 * Upload a file and return the public URL
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  folder = "students"
): Promise<string> {
  if (config.provider === "local") {
    return uploadToLocal(file, filename, folder);
  } else if (config.provider === "supabase") {
    return uploadToSupabase(file, filename, contentType, folder);
  } else {
    throw new Error(`Unknown storage provider: ${config.provider}`);
  }
}

/**
 * Delete a file by its public URL
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  if (config.provider === "local") {
    return deleteFromLocal(publicUrl);
  } else if (config.provider === "supabase") {
    return deleteFromSupabase(publicUrl);
  } else {
    throw new Error(`Unknown storage provider: ${config.provider}`);
  }
}

/**
 * Local filesystem upload implementation
 */
async function uploadToLocal(file: Buffer, filename: string, folder: string): Promise<string> {
  const uploadDir = join(config.localPath!, folder);
  
  // Ensure upload directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = join(uploadDir, filename);
  await writeFile(filePath, file);

  // Return public URL
  return `${config.publicUrl}/${folder}/${filename}`;
}

/**
 * Local filesystem delete implementation
 */
async function deleteFromLocal(publicUrl: string): Promise<void> {
  // Extract filename from public URL
  const filename = publicUrl.replace(config.publicUrl!, "");
  const filePath = join(config.localPath!, filename);

  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}

/**
 * Supabase Storage upload implementation
 */
async function uploadToSupabase(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: string
): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase client not initialized. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  if (!config.supabaseBucket) {
    throw new Error("Supabase bucket not configured. Set SUPABASE_STORAGE_BUCKET environment variable.");
  }

  const path = `${folder}/${filename}`;

  const { data, error } = await supabaseAdmin.storage
    .from(config.supabaseBucket)
    .upload(path, file, {
      contentType,
      upsert: true, // Replace if file already exists
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(`Failed to upload file to Supabase: ${error.message}`);
  }

  // Return URL based on bucket type
  if (config.supabaseBucketPublic) {
    // Public bucket: return public URL
    return getSupabasePublicUrl(config.supabaseBucket, path);
  } else {
    // Private bucket: return signed URL (valid for 1 year)
    return await getSupabaseSignedUrl(config.supabaseBucket, path, 60 * 60 * 24 * 365);
  }
}

/**
 * Supabase Storage delete implementation
 */
async function deleteFromSupabase(publicUrl: string): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase client not initialized. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  if (!config.supabaseBucket) {
    throw new Error("Supabase bucket not configured. Set SUPABASE_STORAGE_BUCKET environment variable.");
  }

  // Extract path from URL (works for both public and signed URLs)
  let path: string;
  
  // Check if it's a public URL
  if (publicUrl.includes("/storage/v1/object/public/")) {
    // Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlParts = publicUrl.split("/storage/v1/object/public/");
    if (urlParts.length !== 2) {
      throw new Error(`Invalid Supabase public URL format: ${publicUrl}`);
    }
    path = urlParts[1].replace(`${config.supabaseBucket}/`, "");
  } else if (publicUrl.includes("/storage/v1/object/sign/")) {
    // Format: https://{project}.supabase.co/storage/v1/object/sign/{bucket}/{path}?token=...
    // Extract path from signed URL
    const urlParts = publicUrl.split("/storage/v1/object/sign/");
    if (urlParts.length !== 2) {
      throw new Error(`Invalid Supabase signed URL format: ${publicUrl}`);
    }
    const pathAndToken = urlParts[1].split("?")[0]; // Remove token query param
    path = pathAndToken.replace(`${config.supabaseBucket}/`, "");
  } else {
    // Try to extract path from the URL directly
    // This handles cases where we stored just the path
    path = publicUrl.includes("/") ? publicUrl.split("/").slice(-2).join("/") : publicUrl;
  }

  const { error } = await supabaseAdmin.storage
    .from(config.supabaseBucket)
    .remove([path]);

  if (error) {
    console.error("Supabase delete error:", error);
    throw new Error(`Failed to delete file from Supabase: ${error.message}`);
  }
}

/**
 * Generate a unique filename for student photos
 */
export function generateStudentPhotoFilename(studentId: string, originalFilename: string): string {
  const ext = originalFilename.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  return `${studentId}-${timestamp}.${ext}`;
}

/**
 * Generate a unique filename for notice attachments
 */
export function generateNoticeAttachmentFilename(originalFilename: string): string {
  const ext = originalFilename.split(".").pop()?.toLowerCase() || "dat";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `notice-${timestamp}-${random}.${ext}`;
}
