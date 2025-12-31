"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Batch = {
  id: string;
  name: string;
};

type StudentFormProps = {
  batches: Batch[];
};

export function StudentForm({ batches }: StudentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    school: "",
    grade: "",
    status: "ACTIVE",
    photoUrl: "",
    batchId: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      // Prepare data (remove empty strings for optional fields)
      const submitData: any = {
        fullName: formData.fullName.trim(),
        status: formData.status,
      };

      if (formData.phone.trim()) submitData.phone = formData.phone.trim();
      if (formData.school.trim()) submitData.school = formData.school.trim();
      if (formData.grade.trim()) submitData.grade = formData.grade.trim();
      if (formData.photoUrl.trim()) submitData.photoUrl = formData.photoUrl.trim();
      if (formData.batchId.trim()) submitData.batchId = formData.batchId.trim();

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect with success message
        router.push("/admin/students?success=Student created successfully");
      } else {
        setError(data.error || "Failed to create student");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium mb-1"
        >
          Full Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          required
          placeholder="Enter full name"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label htmlFor="school" className="block text-sm font-medium mb-1">
          School
        </label>
        <Input
          id="school"
          name="school"
          type="text"
          value={formData.school}
          onChange={handleChange}
          placeholder="Enter school name"
        />
      </div>

      <div>
        <label htmlFor="grade" className="block text-sm font-medium mb-1">
          Grade
        </label>
        <Input
          id="grade"
          name="grade"
          type="text"
          value={formData.grade}
          onChange={handleChange}
          placeholder="Enter grade"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="PAUSED">PAUSED</option>
          <option value="GRADUATED">GRADUATED</option>
          <option value="DROPPED">DROPPED</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="photoUrl"
          className="block text-sm font-medium mb-1"
        >
          Photo URL
        </label>
        <Input
          id="photoUrl"
          name="photoUrl"
          type="url"
          value={formData.photoUrl}
          onChange={handleChange}
          placeholder="Enter photo URL"
        />
      </div>

      <div>
        <label
          htmlFor="batchId"
          className="block text-sm font-medium mb-1"
        >
          Batch (optional)
        </label>
        <select
          id="batchId"
          name="batchId"
          value={formData.batchId}
          onChange={handleChange}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">No Batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Student"}
        </Button>
        <Link href="/admin/students">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
