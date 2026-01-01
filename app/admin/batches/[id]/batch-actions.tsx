"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type BatchActionsProps = {
  batchId: string;
  batchName: string;
  studentCount: number;
};

export function BatchActions({ batchId, batchName, studentCount }: BatchActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/batches/${batchId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/batches?success=Batch deleted successfully");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete batch");
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      alert("An error occurred while deleting the batch");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isDeleting}
      >
        Delete Batch
      </Button>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete the batch <strong>&quot;{batchName}&quot;</strong>?
              <br />
              <br />
              This action cannot be undone. All assessments for this batch will be deleted.
              {studentCount > 0 && (
                <>
                  <br />
                  <br />
                  <strong className="text-destructive">
                    Warning: This batch has {studentCount} student{studentCount !== 1 ? "s" : ""}.
                    Their batch assignment will be removed, but the students will not be deleted.
                  </strong>
                </>
              )}
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
                {isDeleting ? "Deleting..." : "Delete Batch"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
