import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function CheckMigrationsPage() {
  const checks: Array<{ name: string; status: "ok" | "error" | "warning"; message: string; details?: string }> = [];

  // Check 1: DATABASE_URL
  if (!process.env.DATABASE_URL) {
    checks.push({
      name: "DATABASE_URL",
      status: "error",
      message: "DATABASE_URL environment variable is not set",
    });
  } else {
    checks.push({
      name: "DATABASE_URL",
      status: "ok",
      message: `Set (length: ${process.env.DATABASE_URL.length} chars)`,
    });
  }

  // Check 2: Database Connection
  try {
    await prisma.$connect();
    checks.push({
      name: "Database Connection",
      status: "ok",
      message: "Successfully connected to database",
    });
  } catch (error) {
    checks.push({
      name: "Database Connection",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    });
  }

  // Check 3: Student table exists and has correct columns
  try {
    const student = await prisma.student.findFirst({
      select: {
        id: true,
        registrationNo: true,
        fullName: true,
        phone: true,
        school: true,
        grade: true,
        status: true,
        photoUrl: true,
        batchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    checks.push({
      name: "Student Table Schema",
      status: "ok",
      message: "Student table exists with all required columns",
      details: student ? `Found ${student.registrationNo}` : "Table exists but empty",
    });
  } catch (error: any) {
    if (error?.code === "P2022" || error?.message?.includes("does not exist")) {
      checks.push({
        name: "Student Table Schema",
        status: "error",
        message: "Schema mismatch: Student table is missing columns",
        details: error.message || "Run 'npx prisma migrate deploy' to fix",
      });
    } else {
      checks.push({
        name: "Student Table Schema",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  // Check 4: Batch table exists
  try {
    const batch = await prisma.batch.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        monthlyFee: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    checks.push({
      name: "Batch Table Schema",
      status: "ok",
      message: "Batch table exists with all required columns",
      details: batch ? `Found batch: ${batch.name}` : "Table exists but empty",
    });
  } catch (error: any) {
    if (error?.code === "P2022" || error?.message?.includes("does not exist")) {
      checks.push({
        name: "Batch Table Schema",
        status: "error",
        message: "Schema mismatch: Batch table is missing columns",
        details: error.message || "Run 'npx prisma migrate deploy' to fix",
      });
    } else {
      checks.push({
        name: "Batch Table Schema",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Check 5: Try a simple count query
  try {
    const studentCount = await prisma.student.count();
    const batchCount = await prisma.batch.count();
    checks.push({
      name: "Database Queries",
      status: "ok",
      message: `Queries working (${studentCount} students, ${batchCount} batches)`,
    });
  } catch (error: any) {
    checks.push({
      name: "Database Queries",
      status: "error",
      message: error instanceof Error ? error.message : "Query failed",
      details: error?.code === "P2022" 
        ? "Schema mismatch detected. Run migrations: npx prisma migrate deploy"
        : error instanceof Error ? error.stack : undefined,
    });
  }

  const hasErrors = checks.some((c) => c.status === "error");
  const hasWarnings = checks.some((c) => c.status === "warning");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Migration Status Check</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {hasErrors ? "❌ Schema Mismatch Detected" : hasWarnings ? "⚠️ Warnings Found" : "✅ All Checks Passed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  check.status === "ok"
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : check.status === "warning"
                    ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                    : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{check.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {check.message}
                    </p>
                    {check.details && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                          Show details
                        </summary>
                        <pre className="mt-2 text-xs bg-background p-2 rounded overflow-auto border">
                          {check.details}
                        </pre>
                      </details>
                    )}
                  </div>
                  <span className="text-2xl ml-4">
                    {check.status === "ok" ? "✅" : check.status === "warning" ? "⚠️" : "❌"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasErrors && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <h3 className="font-semibold mb-2 text-red-900 dark:text-red-200">Action Required:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-red-800 dark:text-red-300">
                <li>Your database schema is out of sync with your Prisma schema</li>
                <li>You need to run migrations: <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">npx prisma migrate deploy</code></li>
                <li>See <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">FIX_DATABASE_MIGRATIONS.md</code> for detailed instructions</li>
                <li>After running migrations, refresh this page to verify</li>
              </ol>
            </div>
          )}

          {!hasErrors && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ All database checks passed! Your schema is in sync.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
