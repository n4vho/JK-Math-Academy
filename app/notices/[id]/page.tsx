"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
};

export default function NoticeDetailPage() {
  const params = useParams();
  const noticeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeId) return;

    const loadNotice = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/notices/${noticeId}`);
        const payload = await response.json();
        if (!response.ok) {
          setError(payload?.error || "Failed to load notice.");
          return;
        }
        setNotice(payload.notice || null);
      } catch (err) {
        console.error("Failed to load notice:", err);
        setError("Failed to load notice.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotice();
  }, [noticeId]);

  useEffect(() => {
    if (!noticeId) return;
    void fetch(`/api/notices/${noticeId}/read`, { method: "POST" });
  }, [noticeId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Notice</h1>
        <Link href="/notices">
          <Button variant="outline">Back to Notices</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{notice?.title || "Notice Details"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!isLoading && !error && notice && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                  {notice.type.replace("_", " ")}
                </span>
                {notice.isPinned && (
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-900">
                    Pinned
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(notice.publishAt).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{notice.body}</p>
              {notice.attachmentUrl && (
                <a
                  href={notice.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View attachment
                </a>
              )}
            </div>
          )}
          {!isLoading && !error && !notice && (
            <p className="text-sm text-muted-foreground">Notice not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
