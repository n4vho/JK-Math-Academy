"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    date: "",
    maxMarks: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Prepare data
      const submitData = {
        batchId: batchId,
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        date: formData.date,
        maxMarks: parseInt(formData.maxMarks, 10),
      };

      // Validation
      if (!submitData.title) {
        setError("Title is required");
        setIsLoading(false);
        return;
      }

      if (!submitData.subject) {
        setError("Subject is required");
        setIsLoading(false);
        return;
      }

      if (!submitData.date) {
        setError("Date is required");
        setIsLoading(false);
        return;
      }

      if (isNaN(submitData.maxMarks) || submitData.maxMarks <= 0) {
        setError("Max marks must be a positive number");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        setError(`Server returned invalid response (Status: ${response.status}). Please check the console for details.`);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        // Redirect to marks entry page for the created assessment
        router.push(`/admin/assessments/${data.assessment.id}/marks`);
      } else {
        setError(data.error || `Failed to create assessment (Status: ${response.status})`);
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.message || "Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Set default date to today
  useEffect(() => {
    if (!formData.date) {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, date: today }));
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Assessment</h1>
        <Link href={`/admin/batches/${batchId}`}>
          <Button variant="outline">Back to Batch</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Assessment Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-1"
              >
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter assessment title"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium mb-1"
              >
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Enter subject name"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium mb-1"
              >
                Date <span className="text-destructive">*</span>
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="maxMarks"
                className="block text-sm font-medium mb-1"
              >
                Max Marks <span className="text-destructive">*</span>
              </label>
              <Input
                id="maxMarks"
                name="maxMarks"
                type="number"
                min="1"
                value={formData.maxMarks}
                onChange={handleChange}
                required
                placeholder="Enter maximum marks"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Assessment"}
              </Button>
              <Link href={`/admin/batches/${batchId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
