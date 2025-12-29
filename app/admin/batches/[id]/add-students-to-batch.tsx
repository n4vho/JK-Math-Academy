"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Student = {
  id: string;
  registrationNo: string;
  fullName: string;
};

type AddStudentsToBatchProps = {
  batchId: string;
  currentStudentIds: string[];
};

export function AddStudentsToBatch({
  batchId,
  currentStudentIds,
}: AddStudentsToBatchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch available students (not in this batch) when search query changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (searchQuery.trim().length < 2) {
        setAvailableStudents([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/students?search=${encodeURIComponent(searchQuery)}&excludeBatchId=${batchId}`
        );
        if (response.ok) {
          const data = await response.json();
          setAvailableStudents(data.students || []);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, batchId]);

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudentIds.length === 0) {
      alert("Please select at least one student");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/batches/${batchId}/assign-students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      });

      if (response.ok) {
        router.push(`/admin/batches/${batchId}?success=${selectedStudentIds.length} student(s) assigned successfully`);
        router.refresh();
        setSearchQuery("");
        setSelectedStudentIds([]);
        setAvailableStudents([]);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to assign students");
      }
    } catch (error) {
      alert("An error occurred while assigning students");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Search Students
        </label>
        <Input
          type="text"
          placeholder="Type at least 2 characters to search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {isSearching && (
        <p className="text-sm text-muted-foreground">Searching...</p>
      )}

      {availableStudents.length > 0 && (
        <div className="border rounded-md max-h-60 overflow-y-auto">
          {availableStudents.map((student) => (
            <label
              key={student.id}
              className="flex items-center gap-2 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedStudentIds.includes(student.id)}
                onChange={() => toggleStudentSelection(student.id)}
                className="rounded border-gray-300"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{student.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  {student.registrationNo}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {selectedStudentIds.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedStudentIds.length} student(s) selected
        </div>
      )}

      <Button
        type="submit"
        disabled={selectedStudentIds.length === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Assigning..."
          : `Assign ${selectedStudentIds.length > 0 ? `${selectedStudentIds.length} ` : ""}Student(s)`}
      </Button>
    </form>
  );
}
