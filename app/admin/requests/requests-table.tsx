"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EnrollmentRequest = {
  id: string;
  studentName: string;
  phone: string;
  grade: string | null;
  school: string | null;
  subjects: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  convertedStudent: {
    id: string;
    registrationNo: string;
    fullName: string;
  } | null;
};

type RequestsTableProps = {
  requests: EnrollmentRequest[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export function RequestsTable({
  requests,
  currentPage,
  totalPages,
  totalCount,
}: RequestsTableProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    const queryString = params.toString();
    router.push(`/admin/requests${queryString ? `?${queryString}` : ""}`);
  };

  const handleApprove = async (requestId: string) => {
    if (processingId) return;
    setProcessingId(requestId);

    try {
      const response = await fetch(`/api/enrollment-requests/${requestId}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve request");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (processingId) return;
    setProcessingId(requestId);

    try {
      const response = await fetch(`/api/enrollment-requests/${requestId}/reject`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject request");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "CONTACTED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No enrollment requests found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Student Name
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
                        Subjects
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium">
                          {request.studentName}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {request.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {request.grade || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {request.school || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {request.subjects || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                          {request.convertedStudent && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              → {request.convertedStudent.registrationNo}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            {request.status === "NEW" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={processingId === request.id}
                                >
                                  {processingId === request.id ? "Processing..." : "Approve"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(request.id)}
                                  disabled={processingId === request.id}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {request.status === "APPROVED" && request.convertedStudent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  router.push(`/admin/students/${request.convertedStudent!.id}`)
                                }
                              >
                                View Student
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="border-t px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {requests.length} of {totalCount} requests
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
