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

  return (
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
    </div>
  );
}

