import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function TestDbPage() {
  const diagnostics: Array<{ name: string; status: "ok" | "error"; message: string }> = [];

  // Test 1: Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    diagnostics.push({
      name: "DATABASE_URL",
      status: "error",
      message: "DATABASE_URL environment variable is not set",
    });
  } else {
    diagnostics.push({
      name: "DATABASE_URL",
      status: "ok",
      message: `Set (length: ${process.env.DATABASE_URL.length} chars)`,
    });
  }

  // Test 2: Try to connect to database
  try {
    await prisma.$connect();
    diagnostics.push({
      name: "Database Connection",
      status: "ok",
      message: "Successfully connected to database",
    });
  } catch (error) {
    diagnostics.push({
      name: "Database Connection",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 3: Try a simple query
  try {
    const count = await prisma.student.count();
    diagnostics.push({
      name: "Database Query",
      status: "ok",
      message: `Successfully queried database (found ${count} students)`,
    });
  } catch (error) {
    diagnostics.push({
      name: "Database Query",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Test 4: Check Prisma client
  try {
    const prismaVersion = await prisma.$queryRaw`SELECT version()`;
    diagnostics.push({
      name: "Prisma Client",
      status: "ok",
      message: "Prisma client is working",
    });
  } catch (error) {
    diagnostics.push({
      name: "Prisma Client",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }

  const hasErrors = diagnostics.some((d) => d.status === "error");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Database Diagnostics</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {hasErrors ? "❌ Issues Found" : "✅ All Checks Passed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnostics.map((diagnostic, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  diagnostic.status === "ok"
                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{diagnostic.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {diagnostic.message}
                    </p>
                  </div>
                  <span className="text-2xl">
                    {diagnostic.status === "ok" ? "✅" : "❌"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasErrors && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Check your environment variables</li>
                <li>Verify your database is running and accessible</li>
                <li>Check server logs for detailed error messages</li>
                <li>See DEBUGGING_ERRORS.md for more help</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
