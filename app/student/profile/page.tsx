import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudentSession } from "@/lib/student-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function StudentProfilePage() {
  // Require student session - redirects if not authenticated
  let studentId: string;
  try {
    studentId = await requireStudentSession();
  } catch {
    redirect("/student/login");
  }

  // Fetch student data scoped by session studentId
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  // This should never happen if session is valid, but handle gracefully
  if (!student) {
    redirect("/student/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Link href="/student/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Photo Card */}
        {student.photoUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
                  <img
                    src={student.photoUrl}
                    alt={`${student.fullName}'s photo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium text-lg">{student.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Number</p>
                <p className="font-medium">{student.registrationNo}</p>
              </div>
              {student.grade && (
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-medium">{student.grade}</p>
                </div>
              )}
              {student.school && (
                <div>
                  <p className="text-sm text-muted-foreground">School</p>
                  <p className="font-medium">{student.school}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                  {student.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {student.phone ? (
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{student.phone}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="text-muted-foreground italic">Not provided</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Batch Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent>
            {student.batch ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Batch Name</p>
                  <p className="font-medium">{student.batch.name}</p>
                </div>
                {student.batch.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{student.batch.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Not assigned to any batch</p>
            )}
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="font-medium">
                  {new Date(student.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(student.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Information Notice */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Need to Update Your Information?</h3>
                <p className="text-sm text-muted-foreground">
                  To update your profile information, please contact your administrator.
                  They can help you update your name, phone number, school, grade, or other details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
