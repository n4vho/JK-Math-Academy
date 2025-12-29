"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkMoveStudents } from "./bulk-move-students";

type Student = {
  id: string;
  registrationNo: string;
  fullName: string;
  phone: string | null;
  grade: string | null;
  school: string | null;
  status: string;
};

type RosterTableProps = {
  students: Student[];
  currentBatchId: string;
};

export function RosterTable({ students, currentBatchId }: RosterTableProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleMoveComplete = () => {
    setSelectedStudentIds([]);
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roster ({students.length} students)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              No students assigned to this batch yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Roster ({students.length} students)</CardTitle>
          {selectedStudentIds.length > 0 && (
            <BulkMoveStudents
              selectedStudentIds={selectedStudentIds}
              sourceBatchId={currentBatchId}
              onMoveComplete={handleMoveComplete}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      students.length > 0 &&
                      selectedStudentIds.length === students.length
                    }
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Registration No
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  School
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">{student.registrationNo}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="hover:underline"
                    >
                      {student.fullName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {student.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {student.grade || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {student.school || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
