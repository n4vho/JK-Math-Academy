import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStudentSession } from "@/lib/student-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StudentResultsPage() {
  // Require student session - redirects if not authenticated
  let studentId: string;
  try {
    studentId = await requireStudentSession();
  } catch {
    redirect("/student/login");
  }

  // Fetch student with batch info
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      batchId: true,
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!student) {
    redirect("/student/login");
  }

  // If student has no batch, show empty state
  if (!student.batchId || !student.batch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Assessment Results</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              You are not assigned to any batch yet. No assessments available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all assessments for the student's batch
  const assessments = await prisma.assessment.findMany({
    where: {
      batchId: student.batchId,
    },
    include: {
      assessmentScores: {
        where: {
          studentId: studentId, // Only get THIS student's scores
        },
        select: {
          id: true,
          score: true,
          remarks: true,
        },
      },
    },
    orderBy: {
      date: "desc", // Newest first
    },
  });

  // Calculate percentage helper
  const getPercentage = (score: number | null, maxMarks: number) => {
    if (score === null) return null;
    return Math.round((score / maxMarks) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessment Results</h1>
          <p className="text-muted-foreground mt-2">
            Batch: {student.batch.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/student/profile">
            <Button variant="outline" size="sm">Profile</Button>
          </Link>
          <Link href="/student/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No assessments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => {
            const studentScore = assessment.assessmentScores[0]; // Should be 0 or 1 due to unique constraint
            const isGraded = studentScore?.score !== null && studentScore?.score !== undefined;
            const percentage = isGraded
              ? getPercentage(studentScore!.score!, assessment.maxMarks)
              : null;

            return (
              <Card key={assessment.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{assessment.title}</h3>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                          {assessment.subject}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Date: {new Date(assessment.date).toLocaleDateString()}
                      </p>
                      {isGraded ? (
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="text-2xl font-bold">
                              {studentScore!.score} / {assessment.maxMarks}
                            </p>
                          </div>
                          {percentage !== null && (
                            <div>
                              <p className="text-sm text-muted-foreground">Percentage</p>
                              <p className="text-2xl font-bold">{percentage}%</p>
                            </div>
                          )}
                          {studentScore!.remarks && (
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">Remarks</p>
                              <p className="text-sm">{studentScore!.remarks}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground italic">
                            Not graded yet
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <Link href={`/student/results/${assessment.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
