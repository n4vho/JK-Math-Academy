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
    // Log error details for debugging - this will show in browser console
    console.error("Admin route error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      name: error.name,
      cause: (error as any).cause,
    });

    // Also try to send to server for logging (if API route exists)
    if (error.digest) {
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          digest: error.digest,
          message: error.message,
          name: error.name,
          stack: error.stack,
        }),
      }).catch(() => {
        // Ignore errors from logging endpoint
      });
    }
  }, [error]);

  // Always show digest and basic info, even in production
  const showDetails = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_ERRORS === "true";

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
        
        {/* Always show digest - it's safe and helps debugging */}
        {error.digest && (
          <div className="mt-4 p-3 bg-background rounded border">
            <p className="text-xs font-mono text-muted-foreground mb-1">Error Digest:</p>
            <p className="text-sm font-mono">{error.digest}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Check your server logs for this digest to find the full error details.
            </p>
          </div>
        )}

        {showDetails && (
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-background rounded border">
              <p className="text-xs font-semibold mb-2">Error Message:</p>
              <pre className="text-xs overflow-auto">
                {error.message || "Unknown error"}
              </pre>
            </div>
            {error.stack && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground p-2 bg-background rounded border">
                  Stack trace (click to expand)
                </summary>
                <pre className="mt-2 bg-background p-2 rounded overflow-auto border text-xs">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
          <Link href="/admin/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/admin/view-error-logs">
            <Button variant="outline">How to Find Error Logs</Button>
          </Link>
          <Link href="/admin/test-db">
            <Button variant="outline">Test Database</Button>
          </Link>
          <Link href="/admin/check-migrations">
            <Button variant="outline">Check Migrations</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
