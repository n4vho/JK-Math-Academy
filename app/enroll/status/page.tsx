"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface EnrollmentStatus {
  id: string;
  referenceId: string;
  studentName: string;
  phone: string;
  grade: string | null;
  school: string | null;
  subjects: string | null;
  message: string | null;
  status: "NEW" | "CONTACTED" | "APPROVED" | "REJECTED";
  registrationNo: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EnrollmentStatusPage() {
  const [requestId, setRequestId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedRegNo, setCopiedRegNo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnrollmentStatus(null);

    if (!requestId.trim()) {
      setError("Request ID is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/enrollment-requests/${requestId.trim()}`);

      if (response.ok) {
        const data = await response.json();
        setEnrollmentStatus(data.enrollmentRequest);
      } else {
        const data = await response.json();
        if (response.status === 404) {
          setError("Invalid request ID");
        } else {
          setError(data.error || "An error occurred. Please try again.");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string, type: "requestId" | "regNo") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "requestId") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopiedRegNo(true);
        setTimeout(() => setCopiedRegNo(false), 2000);
      }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        if (type === "requestId") {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          setCopiedRegNo(true);
          setTimeout(() => setCopiedRegNo(false), 2000);
        }
      } catch (e) {
        console.error("Failed to copy:", e);
      }
      document.body.removeChild(textArea);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "REJECTED":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "CONTACTED":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "Pending";
      case "CONTACTED":
        return "Contacted";
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Check Enrollment Status</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your Request ID to check the status of your enrollment application.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="requestId"
                className="block text-sm font-medium mb-1"
              >
                Request ID <span className="text-red-500">*</span>
              </label>
              <Input
                id="requestId"
                type="text"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                required
                placeholder="Enter your Request ID"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Checking..." : "Check Status"}
            </Button>
          </form>

          {enrollmentStatus && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-md border ${getStatusColor(enrollmentStatus.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium mb-1">Status</p>
                    <p className="text-lg font-semibold">
                      {getStatusLabel(enrollmentStatus.status)}
                    </p>
                  </div>
                  {enrollmentStatus.status === "APPROVED" && (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {enrollmentStatus.status === "REJECTED" && (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
                  Application Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400">Request ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-base">
                        {enrollmentStatus.referenceId || enrollmentStatus.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(enrollmentStatus.referenceId || enrollmentStatus.id, "requestId")}
                        className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        title="Copy Request ID"
                      >
                        {copied ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Student Name:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {enrollmentStatus.studentName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Phone:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {enrollmentStatus.phone}
                    </span>
                  </div>
                  {enrollmentStatus.grade && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Grade:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {enrollmentStatus.grade}
                      </span>
                    </div>
                  )}
                  {enrollmentStatus.school && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">School:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {enrollmentStatus.school}
                      </span>
                    </div>
                  )}
                  {enrollmentStatus.subjects && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Subjects:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {enrollmentStatus.subjects}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Submitted:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {new Date(enrollmentStatus.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {enrollmentStatus.status === "APPROVED" && enrollmentStatus.registrationNo && (
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-base font-semibold text-green-800 dark:text-green-200">
                      Enrollment Approved!
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Your Registration Number:
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-2xl font-mono font-bold text-green-700 dark:text-green-400 flex-1">
                        {enrollmentStatus.registrationNo}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(enrollmentStatus.registrationNo!, "regNo")}
                        className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-md transition-colors flex items-center gap-1.5"
                        title="Copy registration number"
                      >
                        {copiedRegNo ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link href="/student/login" className="block">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Go to Student Login
                      </Button>
                    </Link>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                        Login Instructions:
                      </p>
                      <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                        <li>Use your Registration Number: <span className="font-mono font-semibold">{enrollmentStatus.registrationNo}</span></li>
                        <li>Use the phone number on file: <span className="font-semibold">{enrollmentStatus.phone}</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {(enrollmentStatus.status === "NEW" || enrollmentStatus.status === "CONTACTED") && (
                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-base font-semibold text-yellow-800 dark:text-yellow-200">
                      Pending Approval
                    </p>
                  </div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your enrollment request is being reviewed. We will contact you soon with an update.
                  </p>
                </div>
              )}

              {enrollmentStatus.status === "REJECTED" && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Your enrollment request has been rejected. Please contact us for more information.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
