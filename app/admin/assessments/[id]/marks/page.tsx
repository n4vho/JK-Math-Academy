"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Student = {
  id: string;
  registrationNo: string;
  fullName: string;
};

type AssessmentScore = {
  id: string;
  studentId: string;
  score: number | null;
  remarks: string | null;
};

type Assessment = {
  id: string;
  title: string;
  subject: string;
  date: string;
  maxMarks: number;
  batch: {
    id: string;
    name: string;
  };
};

type StudentScore = {
  studentId: string;
  registrationNo: string;
  fullName: string;
  score: string;
  remarks: string;
  existingScoreId?: string;
};

export default function MarksEntryPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const scoreInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const remarksInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check for success message in URL
  useEffect(() => {
    const success = searchParams.get("success");
    if (success) {
      setSuccessMessage(success);
      // Clear from URL
      router.replace(`/admin/assessments/${assessmentId}/marks`, {
        scroll: false,
      });
      // Clear message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, assessmentId]);

  // Fetch assessment and students
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/assessments/${assessmentId}/data`);
        if (!response.ok) {
          throw new Error("Failed to fetch assessment data");
        }

        const data = await response.json();
        setAssessment(data.assessment);

        // Map students with their existing scores
        const studentScores: StudentScore[] = data.students.map((student: Student) => {
          const existingScore = data.scores.find(
            (score: AssessmentScore) => score.studentId === student.id
          );

          return {
            studentId: student.id,
            registrationNo: student.registrationNo,
            fullName: student.fullName,
            score: existingScore?.score?.toString() || "",
            remarks: existingScore?.remarks || "",
            existingScoreId: existingScore?.id,
          };
        });

        setStudents(studentScores);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load assessment data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [assessmentId]);

  const handleScoreChange = (index: number, value: string) => {
    const updated = [...students];
    updated[index].score = value;
    setStudents(updated);
    setError("");
  };

  const handleRemarksChange = (index: number, value: string) => {
    const updated = [...students];
    updated[index].remarks = value;
    setStudents(updated);
  };

  const handleScoreKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Move to next row's score input
      const nextIndex = index + 1;
      if (nextIndex < students.length) {
        scoreInputRefs.current[nextIndex]?.focus();
      } else {
        // If last row, move to first remarks input or save button
        remarksInputRefs.current[0]?.focus();
      }
    }
  };

  const validateScores = (): string | null => {
    if (!assessment) return "Assessment data not loaded";

    for (let i = 0; i < students.length; i++) {
      const studentScore = students[i];
      const scoreValue = studentScore.score.trim();

      if (scoreValue === "") {
        continue; // Allow blank/null
      }

      const scoreNum = parseFloat(scoreValue);
      if (isNaN(scoreNum)) {
        return `Invalid score for ${studentScore.fullName}`;
      }

      if (scoreNum < 0 || scoreNum > assessment.maxMarks) {
        return `Score for ${studentScore.fullName} must be between 0 and ${assessment.maxMarks}`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!assessment) return;

    // Validate scores
    const validationError = validateScores();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const scoresData = students.map((student) => ({
        studentId: student.studentId,
        score: student.score.trim() === "" ? null : student.score.trim(),
        remarks: student.remarks.trim() || null,
      }));

      const response = await fetch(`/api/assessments/${assessmentId}/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scores: scoresData }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Successfully saved marks for ${data.count} student(s)`);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data.error || "Failed to save marks");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">{error}</div>
        <div className="mt-4 text-center">
          <Link href="/admin/batches">
            <Button variant="outline">Back to Batches</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Assessment not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/admin/batches/${assessment.batch.id}`}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to Batch
          </Link>
          <h1 className="text-3xl font-bold">Enter Marks</h1>
          <p className="text-muted-foreground mt-1">
            {assessment.title} - {assessment.subject}
          </p>
        </div>
        <Link href={`/admin/batches/${assessment.batch.id}`}>
          <Button variant="outline">Back to Batch</Button>
        </Link>
      </div>

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {successMessage}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Title
            </label>
            <p className="text-base font-medium">{assessment.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Subject
            </label>
            <p className="text-base">{assessment.subject}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Date
            </label>
            <p className="text-base">
              {new Date(assessment.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Max Marks
            </label>
            <p className="text-base">{assessment.maxMarks}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Marks Entry</CardTitle>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Marks"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground">
              No students in this batch.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Reg. No.</th>
                    <th className="text-left p-2 font-medium">Full Name</th>
                    <th className="text-left p-2 font-medium">
                      Score (Max: {assessment.maxMarks})
                    </th>
                    <th className="text-left p-2 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.studentId} className="border-b hover:bg-muted/50">
                      <td className="p-2">{student.registrationNo}</td>
                      <td className="p-2">{student.fullName}</td>
                      <td className="p-2">
                        <Input
                          ref={(el) => {
                            scoreInputRefs.current[index] = el;
                          }}
                          type="number"
                          min="0"
                          max={assessment.maxMarks}
                          value={student.score}
                          onChange={(e) => handleScoreChange(index, e.target.value)}
                          onKeyDown={(e) => handleScoreKeyDown(e, index)}
                          placeholder="Enter score"
                          className="w-24"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          ref={(el) => {
                            remarksInputRefs.current[index] = el;
                          }}
                          type="text"
                          value={student.remarks}
                          onChange={(e) => handleRemarksChange(index, e.target.value)}
                          placeholder="Optional remarks"
                          className="w-full"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
