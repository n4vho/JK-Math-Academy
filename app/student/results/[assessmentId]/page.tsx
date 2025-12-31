import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudentSession } from "@/lib/student-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ assessmentId: string }>;
};

export default async function StudentAssessmentDetailPage({ params }: Props) {
  // Require student session - redirects if not authenticated
  let studentId: string;
  try {
    studentId = await requireStudentSession();
  } catch {
    redirect("/student/login");
  }

  const { assessmentId } = await params;

  // Fetch student with batch info
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      batchId: true,
      fullName: true,
      registrationNo: true,
    },
  });

  if (!student) {
    redirect("/student/login");
  }

  // Fetch assessment - SECURITY: Verify it belongs to student's batch
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
      assessmentScores: {
        where: {
          studentId: studentId, // Only get THIS student's score
        },
        select: {
          id: true,
          score: true,
          remarks: true,
        },
      },
    },
  });

  // If assessment doesn't exist, return 404
  if (!assessment) {
    notFound();
  }

  // SECURITY: If assessment doesn't belong to student's batch, return 404
  // This prevents students from accessing other batches' assessments
  if (assessment.batchId !== student.batchId) {
    notFound();
  }

  const studentScore = assessment.assessmentScores[0]; // Should be 0 or 1
  const isGraded = studentScore?.score !== null && studentScore?.score !== undefined;
  const percentage = isGraded
    ? Math.round((studentScore!.score! / assessment.maxMarks) * 100)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/student/results"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Results
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/student/profile">
              <Button variant="outline" size="sm">Profile</Button>
            </Link>
            <Link href="/student/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
        <h1 className="text-3xl font-bold">{assessment.title}</h1>
        <p className="text-muted-foreground mt-2">
          {assessment.subject} • {assessment.batch.name}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Assessment Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(assessment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">{assessment.subject}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maximum Marks</p>
                <p className="font-medium">{assessment.maxMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Batch</p>
                <p className="font-medium">{assessment.batch.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Card */}
        {isGraded ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                    <p className="text-3xl font-bold">
                      {studentScore!.score} / {assessment.maxMarks}
                    </p>
                  </div>
                  {percentage !== null && (
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Percentage</p>
                      <p className="text-3xl font-bold">{percentage}%</p>
                    </div>
                  )}
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      Graded
                    </p>
                  </div>
                </div>

                {/* Remarks */}
                {studentScore!.remarks && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Remarks
                    </p>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{studentScore!.remarks}</p>
                    </div>
                  </div>
                )}

                {/* Student Info */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Student Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{student.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registration Number</p>
                      <p className="font-medium">{student.registrationNo}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  This assessment has not been graded yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your results will appear here once grading is complete.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
