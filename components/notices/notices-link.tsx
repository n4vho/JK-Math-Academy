"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NoticesLink() {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUnreadCount = async () => {
      try {
        const response = await fetch("/api/notices/unread-count");
        const data = await response.json();
        if (!response.ok) {
          return;
        }
        if (isMounted) {
          setUnreadCount(data?.unreadCount ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    void loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const showDot = (unreadCount ?? 0) > 0;

  return (
    <Link href="/notices">
      <Button variant="outline" className="relative">
        Notices
        {showDot && (
          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>
    </Link>
  );
}
