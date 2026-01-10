import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ViewErrorLogsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">How to Find Error Logs</h1>
        <div className="flex gap-2">
          <Link href="/admin/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Error Digest: 3608923710</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use this digest to search for the error in your server logs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Method 1: Vercel Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com/dashboard</a></li>
              <li>Click on your project name</li>
              <li>Click on the <strong>"Deployments"</strong> tab</li>
              <li>Click on the <strong>latest deployment</strong></li>
              <li>Click on <strong>"Runtime Logs"</strong> or <strong>"Function Logs"</strong> tab</li>
              <li>Search for: <code className="bg-muted px-1 rounded">ERROR IN ADMIN</code> or <code className="bg-muted px-1 rounded">3608923710</code></li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-sm">
                <strong>Tip:</strong> The error logs will be between lines of <code>===</code> characters. 
                Look for sections that start with <code>ERROR IN ADMIN BATCHES PAGE</code> or <code>ERROR IN ADMIN STUDENTS PAGE</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Method 2: Local Development</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">If running locally:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Check the terminal where you ran <code className="bg-muted px-1 rounded">npm run dev</code> or <code className="bg-muted px-1 rounded">npm start</code></li>
              <li>Look for output starting with:</li>
            </ol>
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
{`================================================================================
ERROR IN ADMIN BATCHES PAGE
================================================================================
Message: [error message]
Digest: 3608923710
...`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Method 3: Browser Console</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open browser DevTools (Press F12)</li>
              <li>Go to the <strong>"Console"</strong> tab</li>
              <li>Look for errors logged by the error boundary</li>
              <li>You should see: <code className="bg-muted px-1 rounded">Admin route error:</code> with error details</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Method 4: Test Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Visit the diagnostics page to test your database connection and see what's wrong:
            </p>
            <Link href="/admin/test-db">
              <Button>Go to Database Diagnostics</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What the Error Logs Contain</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">The error logs will show:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Message:</strong> The actual error message</li>
              <li><strong>Digest:</strong> 3608923710 (error identifier)</li>
              <li><strong>Stack:</strong> Full stack trace</li>
              <li><strong>Environment:</strong> Whether DATABASE_URL is set, etc.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Missing DATABASE_URL:</strong> Check if <code className="bg-muted px-1 rounded">hasDatabaseUrl: false</code> in logs</li>
              <li><strong>Database Connection Failed:</strong> Verify database is running and connection string is correct</li>
              <li><strong>Prisma Client Not Generated:</strong> Run <code className="bg-muted px-1 rounded">npx prisma generate</code></li>
              <li><strong>Migrations Not Applied:</strong> Run <code className="bg-muted px-1 rounded">npx prisma migrate deploy</code></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
