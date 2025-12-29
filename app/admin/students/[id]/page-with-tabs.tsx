"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StudentInfoTab } from "./student-info-tab";
import { MarksHistoryTab } from "./marks-history";

type Student = {
  id: string;
  registrationNo: string;
  fullName: string;
  phone: string | null;
  school: string | null;
  grade: string | null;
  status: string;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  batch: {
    id: string;
    name: string;
  } | null;
};

type AssessmentScore = {
  id: string;
  score: number | null;
  remarks: string | null;
  assessment: {
    id: string;
    title: string;
    subject: string;
    date: string;
    maxMarks: number;
  };
};

type Props = {
  student: Student;
  scores: AssessmentScore[];
};

export function StudentDetailTabs({ student, scores }: Props) {
  const [activeTab, setActiveTab] = useState<"info" | "marks">("info");

  return (
    <>
      <div className="border-b mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("info")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Student Information
          </button>
          <button
            onClick={() => setActiveTab("marks")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "marks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Marks History
          </button>
        </div>
      </div>

      {activeTab === "info" && <StudentInfoTab student={student} />}
      {activeTab === "marks" && <MarksHistoryTab scores={scores} />}
    </>
  );
}
