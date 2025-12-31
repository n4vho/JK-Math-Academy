"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  studentId: string;
  currentPhotoUrl: string | null;
  onPhotoUpdate?: (photoUrl: string | null) => void;
};

export function PhotoUpload({ studentId, currentPhotoUrl, onPhotoUpdate }: Props) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`/api/admin/students/${studentId}/photo`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(data.student.photoUrl);
        onPhotoUpdate?.(data.student.photoUrl);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(data.error || "Failed to upload photo");
        // Reset preview on error
        setPreview(currentPhotoUrl);
      }
    } catch (err) {
      setError("An error occurred while uploading the photo");
      setPreview(currentPhotoUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/students/${studentId}/photo`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(null);
        onPhotoUpdate?.(null);
        // Refresh the page to show updated data
        router.refresh();
      } else {
        setError(data.error || "Failed to delete photo");
      }
    } catch (err) {
      setError("An error occurred while deleting the photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo Preview */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Student photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground text-center p-4">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-sm">No photo</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="space-y-2">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
              disabled={isUploading}
            />
            <label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview && preview !== currentPhotoUrl
                  ? "Change Photo"
                  : preview
                  ? "Replace Photo"
                  : "Upload Photo"}
              </Button>
            </label>
          </div>

          {preview && preview !== currentPhotoUrl && (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? "Uploading..." : "Save Photo"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreview(currentPhotoUrl);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          )}

          {preview && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? "Deleting..." : "Delete Photo"}
            </Button>
          )}
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Supported formats: JPEG, PNG, WebP (max 5MB)
        </p>
      </CardContent>
    </Card>
  );
}
