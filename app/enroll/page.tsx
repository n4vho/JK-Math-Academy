"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EnrollPage() {
  const router = useRouter();
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
        // Reset form
        setFormData({
          studentName: "",
          phone: "",
          grade: "",
          school: "",
          subjects: "",
          message: "",
        });
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
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
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                Thank you! Your enrollment request has been submitted successfully. We will contact you soon.
              </p>
            </div>
          )}
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
        </CardContent>
      </Card>
    </div>
  );
}
