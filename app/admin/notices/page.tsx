"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";

type Notice = {
  id: string;
  title: string;
  body: string;
  type: string;
  audienceType: string;
  audienceRefId: string | null;
  isPinned: boolean;
  publishAt: string;
  attachmentUrl: string | null;
  createdAt: string;
  createdByUserId: string | null;
};

type ToastState = {
  message: string;
  type?: "success" | "error";
} | null;

type BatchOption = {
  id: string;
  name: string;
};

type StudentOption = {
  id: string;
  fullName: string;
  registrationNo: string;
  batchId: string | null;
};

const noticeTypes = [
  "ANNOUNCEMENT",
  "EXAM_SCHEDULE",
  "EXAM_RESULT",
  "PAYMENT",
  "URGENT",
  "OTHER",
];

const audienceTypes = [
  "ALL",
  "BATCH",
  "CLASS",
  "STUDENT",
  "GUARDIAN_ONLY",
  "STAFF_ONLY",
];

function formatAudience(audienceType: string, audienceRefId: string | null) {
  if (!audienceRefId) return audienceType;
  return `${audienceType} (${audienceRefId})`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewNotice, setViewNotice] = useState<Notice | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    type: "ANNOUNCEMENT",
    audienceType: "ALL",
    audienceRefId: "",
    attachmentUrl: "",
    isPinned: false,
    publishAt: "",
  });

  const requiresAudienceRef = useMemo(
    () => ["BATCH", "CLASS", "STUDENT"].includes(formData.audienceType),
    [formData.audienceType]
  );

  const loadNotices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/notices");
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error || "Failed to load notices.");
        return;
      }
      setNotices(payload.notices || []);
    } catch (err) {
      console.error("Failed to load notices:", err);
      setError("Failed to load notices.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAudienceOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [batchResponse, studentResponse] = await Promise.all([
        fetch("/api/batches"),
        fetch("/api/students?limit=200"),
      ]);

      const batchPayload = await batchResponse.json();
      const studentPayload = await studentResponse.json();

      if (batchResponse.ok) {
        setBatches(batchPayload.batches || []);
      }

      if (studentResponse.ok) {
        setStudents(studentPayload.students || []);
      }
    } catch (err) {
      console.error("Failed to load notice options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    void loadNotices();
    void loadAudienceOptions();
  }, []);

  useEffect(() => {
    if (!isDialogOpen) {
      setUploadFile(null);
      setIsUploading(false);
    }
  }, [isDialogOpen]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "audienceType" ? { audienceRefId: "" } : null),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (isUploading) {
      setError("Please wait for the upload to finish.");
      return;
    }

    const payload: any = {
      title: formData.title.trim(),
      body: formData.body.trim(),
      type: formData.type,
      audienceType: formData.audienceType,
      isPinned: formData.isPinned,
    };

    if (formData.attachmentUrl.trim()) {
      payload.attachmentUrl = formData.attachmentUrl.trim();
    }

    if (formData.publishAt) {
      payload.publishAt = new Date(formData.publishAt).toISOString();
    }

    if (requiresAudienceRef && formData.audienceRefId.trim()) {
      payload.audienceRefId = formData.audienceRefId.trim();
    }

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Failed to create notice.");
        setToast({ message: data?.error || "Failed to create notice.", type: "error" });
        return;
      }

      setToast({ message: "Notice created successfully.", type: "success" });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        body: "",
        type: "ANNOUNCEMENT",
        audienceType: "ALL",
        audienceRefId: "",
        attachmentUrl: "",
        isPinned: false,
        publishAt: "",
      });
      await loadNotices();
    } catch (err) {
      console.error("Failed to create notice:", err);
      setError("Failed to create notice.");
      setToast({ message: "Failed to create notice.", type: "error" });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setUploadFile(null);
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setToast({ message: "Only PDF, JPG, and PNG files are allowed.", type: "error" });
      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setToast({ message: "File size exceeds 5MB limit.", type: "error" });
      event.target.value = "";
      return;
    }

    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setToast({ message: "Select a file to upload.", type: "error" });
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", uploadFile);

      const response = await fetch("/api/admin/notices/upload", {
        method: "POST",
        body: form,
      });

      const data = await response.json();
      if (!response.ok) {
        setToast({ message: data?.error || "Upload failed.", type: "error" });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        attachmentUrl: data.attachmentUrl || "",
      }));
      setUploadFile(null);
      setToast({ message: "Attachment uploaded.", type: "success" });
    } catch (err) {
      console.error("Upload failed:", err);
      setToast({ message: "Upload failed.", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Notices</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ New Notice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Notice</DialogTitle>
              <DialogDescription>
                Fill in the notice details and publish to your audience.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {noticeTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select
                    value={formData.audienceType}
                    onValueChange={(value) => handleSelectChange("audienceType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {requiresAudienceRef && (
                <div className="space-y-2">
                  <Label htmlFor="audienceRefId">
                    {formData.audienceType === "BATCH" && "Batch"}
                    {formData.audienceType === "CLASS" && "Class / Grade"}
                    {formData.audienceType === "STUDENT" && "Student"}
                  </Label>
                  {formData.audienceType === "BATCH" && (
                    <Select
                      value={formData.audienceRefId}
                      onValueChange={(value) => handleSelectChange("audienceRefId", value)}
                      disabled={isLoadingOptions}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {formData.audienceType === "STUDENT" && (
                    <Select
                      value={formData.audienceRefId}
                      onValueChange={(value) => handleSelectChange("audienceRefId", value)}
                      disabled={isLoadingOptions}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.fullName} ({student.registrationNo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {formData.audienceType === "CLASS" && (
                    <Input
                      id="audienceRefId"
                      name="audienceRefId"
                      value={formData.audienceRefId}
                      onChange={handleChange}
                      placeholder="e.g. Grade 10"
                      required={requiresAudienceRef}
                    />
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachmentUrl">Attachment URL</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="attachmentUrl"
                    name="attachmentUrl"
                    value={formData.attachmentUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, or PNG up to 5MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="publishAt">Publish At</Label>
                  <Input
                    id="publishAt"
                    name="publishAt"
                    type="datetime-local"
                    value={formData.publishAt}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Input
                    id="isPinned"
                    name="isPinned"
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isPinned">Pin notice</Label>
                </div>
              </div>

              {error && (
                <div className="rounded bg-destructive/10 p-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">Create Notice</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && notices.length === 0 && (
            <p className="text-sm text-muted-foreground">No notices yet.</p>
          )}
          {!isLoading && notices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Title</th>
                    <th className="py-2 pr-4 font-medium">Audience</th>
                    <th className="py-2 pr-4 font-medium">Publish At</th>
                    <th className="py-2 pr-4 font-medium">Pinned</th>
                    <th className="py-2 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map((notice) => (
                    <tr key={notice.id} className="border-b">
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                          {notice.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium">{notice.title}</td>
                      <td className="py-3 pr-4">
                        {formatAudience(notice.audienceType, notice.audienceRefId)}
                      </td>
                      <td className="py-3 pr-4">{formatDate(notice.publishAt)}</td>
                      <td className="py-3 pr-4">
                        {notice.isPinned ? (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-900">
                            Pinned
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewNotice(notice)}
                              >
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle>{viewNotice?.title || "Notice"}</DialogTitle>
                                <DialogDescription>
                                  Review notice details before sharing.
                                </DialogDescription>
                              </DialogHeader>
                              {viewNotice && (
                                <div className="space-y-3 text-sm">
                                  <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                                      {viewNotice.type.replace("_", " ")}
                                    </span>
                                    <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                                      {formatAudience(
                                        viewNotice.audienceType,
                                        viewNotice.audienceRefId
                                      )}
                                    </span>
                                    {viewNotice.isPinned && (
                                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-900">
                                        Pinned
                                      </span>
                                    )}
                                  </div>
                                  <p className="whitespace-pre-wrap text-sm">
                                    {viewNotice.body}
                                  </p>
                                  {viewNotice.attachmentUrl && (
                                    <a
                                      href={viewNotice.attachmentUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm text-blue-600 hover:underline"
                                    >
                                      View attachment
                                    </a>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Publish At: {formatDate(viewNotice.publishAt)}
                                  </p>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" disabled>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
