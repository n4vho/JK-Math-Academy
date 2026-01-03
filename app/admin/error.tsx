"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details for debugging
    console.error("Admin route error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      name: error.name,
    });
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Error</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link href="/logout">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          An error occurred while loading this page. Please try refreshing the page or contact support if the problem persists.
        </p>
        {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_ERRORS === "true") && (
          <div className="mt-4 space-y-2">
            <pre className="text-xs bg-background p-2 rounded overflow-auto border">
              {error.message || "Unknown error"}
            </pre>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error digest: {error.digest}
              </p>
            )}
            {error.stack && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Stack trace
                </summary>
                <pre className="mt-2 bg-background p-2 rounded overflow-auto border">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
          <Link href="/admin/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
