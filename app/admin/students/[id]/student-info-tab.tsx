"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

type Props = {
  student: Student;
};

export function StudentInfoTab({ student }: Props) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Registration Number
              </label>
              <p className="text-base font-medium">{student.registrationNo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="text-base">{student.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Phone
              </label>
              <p className="text-base">{student.phone || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                School
              </label>
              <p className="text-base">{student.school || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Grade
              </label>
              <p className="text-base">{student.grade || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <p className="text-base">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                  {student.status}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.batch && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Batch
                </label>
                <p className="text-base">{student.batch.name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Photo URL
              </label>
              {student.photoUrl ? (
                <div className="mt-2">
                  <a
                    href={student.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {student.photoUrl}
                  </a>
                </div>
              ) : (
                <p className="text-base">-</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p className="text-base">
                {new Date(student.createdAt).toLocaleDateString()} at{" "}
                {new Date(student.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Updated At
              </label>
              <p className="text-base">
                {new Date(student.updatedAt).toLocaleDateString()} at{" "}
                {new Date(student.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
