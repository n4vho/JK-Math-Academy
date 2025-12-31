"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StudentLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    registrationNo: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!formData.registrationNo.trim()) {
      setError("Registration number is required");
      setIsLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/student/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationNo: formData.registrationNo.trim(),
          phone: formData.phone.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use window.location for full page reload to ensure cookie is sent
        window.location.href = "/student/dashboard";
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Student Login</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your registration number and phone number to access your portal.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="registrationNo"
                className="block text-sm font-medium mb-1"
              >
                Registration Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="registrationNo"
                type="text"
                value={formData.registrationNo}
                onChange={(e) =>
                  setFormData({ ...formData, registrationNo: e.target.value })
                }
                required
                placeholder="e.g., 2025-0001"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
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
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
