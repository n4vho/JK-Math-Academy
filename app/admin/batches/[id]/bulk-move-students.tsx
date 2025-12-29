"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Batch = {
  id: string;
  name: string;
};

type BulkMoveStudentsProps = {
  selectedStudentIds: string[];
  sourceBatchId: string;
  onMoveComplete: () => void;
};

export function BulkMoveStudents({
  selectedStudentIds,
  sourceBatchId,
  onMoveComplete,
}: BulkMoveStudentsProps) {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBatches, setIsFetchingBatches] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetBatchName, setTargetBatchName] = useState<string>("");

  // Fetch all batches except the current one
  useEffect(() => {
    const fetchBatches = async () => {
      setIsFetchingBatches(true);
      try {
        const response = await fetch("/api/batches");
        if (response.ok) {
          const data = await response.json();
          const otherBatches = data.batches?.filter(
            (b: Batch) => b.id !== sourceBatchId
          ) || [];
          setBatches(otherBatches);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setIsFetchingBatches(false);
      }
    };

    fetchBatches();
  }, [sourceBatchId]);

  const handleMoveClick = () => {
    if (!selectedBatchId) {
      alert("Please select a target batch");
      return;
    }
    const batch = batches.find((b) => b.id === selectedBatchId);
    setTargetBatchName(batch?.name || "");
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/batches/${sourceBatchId}/move-students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          targetBatchId: selectedBatchId,
        }),
      });

      if (response.ok) {
        setShowConfirmModal(false);
        onMoveComplete();
        router.push(
          `/admin/batches/${sourceBatchId}?success=${selectedStudentIds.length} student(s) moved successfully`
        );
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to move students");
      }
    } catch (error) {
      alert("An error occurred while moving students");
    } finally {
      setIsLoading(false);
    }
  };

  if (batches.length === 0 && !isFetchingBatches) {
    return (
      <div className="text-sm text-muted-foreground">
        No other batches available to move students to.
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selectedStudentIds.length} selected
        </span>
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          disabled={isLoading || isFetchingBatches}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Move selected to...</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name}
            </option>
          ))}
        </select>
        <Button
          onClick={handleMoveClick}
          disabled={!selectedBatchId || isLoading || isFetchingBatches}
          size="sm"
        >
          Move
        </Button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Move</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to move {selectedStudentIds.length} student(s) to{" "}
              <strong>{targetBatchName}</strong>?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                variant="destructive"
              >
                {isLoading ? "Moving..." : "Confirm Move"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
