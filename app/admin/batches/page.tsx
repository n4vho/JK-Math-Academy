import { Suspense } from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuccessMessage } from "./success-message";

// Force dynamic rendering - this page requires database access and authentication
export const dynamic = 'force-dynamic';

export default async function AdminBatchesPage() {
  try {
    // Check for DATABASE_URL early
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const batches = await prisma.batch.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { students: true },
        },
      },
    }) as Array<{
      id: string;
      name: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
      _count: { students: number };
    }>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Batches</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link href="/admin/batches/new">
            <Button>Create Batch</Button>
          </Link>
          <Link href="/admin/students">
            <Button variant="outline">Students</Button>
          </Link>
          <Link href="/logout">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </div>
      <Suspense fallback={null}>
        <SuccessMessage />
      </Suspense>
      <Card>
        <CardContent className="p-0">
          {batches.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No batches yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Student Count
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        <Link
                          href={`/admin/batches/${batch.id}`}
                          className="hover:underline"
                        >
                          {batch.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {batch.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {batch._count.students}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {batch.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  } catch (error) {
    // Log error details for debugging - this will appear in server logs
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorDigest = (error as any)?.digest;
    
    // Enhanced logging with all available error information
    console.error("=".repeat(80));
    console.error("ERROR IN ADMIN BATCHES PAGE");
    console.error("=".repeat(80));
    console.error("Message:", errorMessage);
    console.error("Digest:", errorDigest || "No digest available");
    console.error("Stack:", errorStack || "No stack trace");
    console.error("Environment:", {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    });
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("=".repeat(80));

    // Return error UI instead of crashing
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Batches</h1>
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
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Batches</h2>
          <p className="text-sm text-muted-foreground">
            An error occurred while loading the batches list. Please try refreshing the page or contact support if the problem persists.
          </p>
          {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_ERRORS === "true") && error instanceof Error && (
            <div className="mt-4 space-y-2">
              <pre className="text-xs bg-background p-2 rounded overflow-auto border">
                {errorMessage}
              </pre>
              {errorStack && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Stack trace</summary>
                  <pre className="mt-2 bg-background p-2 rounded overflow-auto border">
                    {errorStack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

