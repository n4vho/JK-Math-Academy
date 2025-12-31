"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EnrollPage() {
  const [formData, setFormData] = useState({
    studentName: "",
    phone: "",
    grade: "",
    school: "",
    subjects: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!formData.studentName.trim()) {
      setError("Student name is required");
      setIsLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/enrollment-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: formData.studentName.trim(),
          phone: formData.phone.trim(),
          grade: formData.grade.trim() || null,
          school: formData.school.trim() || null,
          subjects: formData.subjects.trim() || null,
          message: formData.message.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setRequestId(data.enrollmentRequest?.id || null);
        setReferenceId(data.enrollmentRequest?.referenceId || null);
        // Reset form
        setFormData({
          studentName: "",
          phone: "",
          grade: "",
          school: "",
          subjects: "",
          message: "",
        });
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Enrollment Request</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Please fill out the form below to request enrollment. We will contact you shortly.
          </p>
          <div className="mt-3">
            <Link
              href="/enroll/status"
              className="text-sm text-primary hover:underline font-medium"
            >
              Already submitted? Check your enrollment status →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {success && (requestId || referenceId) ? (
            <div className="mb-4 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
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
                    Enrollment Request Submitted Successfully!
                  </p>
                </div>
                <div className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Your Request ID:
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-2xl font-mono font-bold text-green-700 dark:text-green-400 flex-1">
                      {referenceId || requestId}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(referenceId || requestId || "")}
                      className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-md transition-colors flex items-center gap-1.5"
                      title="Copy to clipboard"
                    >
                      {copied ? (
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
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Please save this Request ID. You can use it to check your enrollment status at{" "}
                      <a
                        href="/enroll/status"
                        className="text-green-600 dark:text-green-400 hover:underline font-medium"
                      >
                        /enroll/status
                      </a>
                      .
                    </p>
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <svg
                        className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>Tip:</strong> Take a screenshot of this page or copy the Request ID to save it safely.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/enroll/status" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      Check Status
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      Go to Home
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setRequestId(null);
                      setReferenceId(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-md transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="studentName"
                className="block text-sm font-medium mb-1"
              >
                Student Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="studentName"
                type="text"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                required
                placeholder="Enter student's full name"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium mb-1"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                placeholder="01700000000"
              />
            </div>
            <div>
              <label htmlFor="grade" className="block text-sm font-medium mb-1">
                Grade (Optional)
              </label>
              <Input
                id="grade"
                type="text"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                placeholder="e.g., Grade 10"
              />
            </div>
            <div>
              <label htmlFor="school" className="block text-sm font-medium mb-1">
                School (Optional)
              </label>
              <Input
                id="school"
                type="text"
                value={formData.school}
                onChange={(e) =>
                  setFormData({ ...formData, school: e.target.value })
                }
                placeholder="Enter school name"
              />
            </div>
            <div>
              <label
                htmlFor="subjects"
                className="block text-sm font-medium mb-1"
              >
                Subjects (Optional)
              </label>
              <Input
                id="subjects"
                type="text"
                value={formData.subjects}
                onChange={(e) =>
                  setFormData({ ...formData, subjects: e.target.value })
                }
                placeholder="e.g., Math, Physics, Chemistry"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1"
              >
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                placeholder="Any additional information..."
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit Enrollment Request"}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
