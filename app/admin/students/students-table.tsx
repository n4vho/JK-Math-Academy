"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Student = {
  id: string;
  registrationNo: string;
  fullName: string;
  phone: string | null;
  grade: string | null;
  school: string | null;
  status: string;
  createdAt: string; // ISO string from server
  batch: { id: string; name: string } | null;
};

type StudentsTableProps = {
  students: Student[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export function StudentsTable({
  students,
  currentPage,
  totalPages,
  totalCount,
}: StudentsTableProps) {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    const queryString = params.toString();
    router.push(`/admin/students${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No students found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
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
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                      >
                        <td className="px-6 py-4 text-sm">{student.registrationNo}</td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {student.fullName}
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
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {student.batch?.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="border-t px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {students.length} of {totalCount} students
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
