"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type StudentActionsProps = {
  studentId: string;
  currentStatus: string;
};

export function StudentActions({ studentId, currentStatus }: StudentActionsProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isResettingPhoto, setIsResettingPhoto] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleArchive = async () => {
    if (
      !confirm(
        "Are you sure you want to archive this student? This will set their status to DROPPED."
      )
    ) {
      return;
    }

    setIsArchiving(true);
    try {
      const response = await fetch(`/api/students/${studentId}/archive`, {
        method: "POST",
      });

      if (response.ok) {
        router.push("/admin/students?success=Student archived successfully");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to archive student");
      }
    } catch (error) {
      alert("An error occurred while archiving the student");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleResetPhoto = async () => {
    if (!confirm("Are you sure you want to reset the photo URL?")) {
      return;
    }

    setIsResettingPhoto(true);
    try {
      const response = await fetch(`/api/students/${studentId}/reset-photo`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
        alert("Photo URL reset successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reset photo");
      }
    } catch (error) {
      alert("An error occurred while resetting the photo");
    } finally {
      setIsResettingPhoto(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/students?success=Student deleted successfully");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete student");
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      alert("An error occurred while deleting the student");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Link href={`/admin/students/${studentId}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
        {currentStatus !== "DROPPED" && (
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={isArchiving}
          >
            {isArchiving ? "Archiving..." : "Archive"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleResetPhoto}
          disabled={isResettingPhoto}
        >
          {isResettingPhoto ? "Resetting..." : "Reset Photo"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
        >
          Delete
        </Button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this student? This action cannot be undone.
              All assessment scores associated with this student will also be deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIsDeleting(false);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
              >
                {isDeleting ? "Deleting..." : "Delete Student"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

