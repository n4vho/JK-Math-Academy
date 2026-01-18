"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    void loadNotices();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Notices</h1>
        <Link href="/student/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!isLoading && !error && notices.length === 0 && (
            <p className="text-sm text-muted-foreground">No notices yet.</p>
          )}
          {!isLoading && notices.length > 0 && (
            <div className="space-y-4">
              {notices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="block"
                >
                  <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
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
                    <h2 className="mt-2 text-lg font-semibold">{notice.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {notice.body}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
