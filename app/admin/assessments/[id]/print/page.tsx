import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssessmentPrintContent } from "./assessment-print-content";

type Props = {
  params: Promise<{ id: string }>;
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AssessmentPrintPage({ params }: Props) {
  const { id: assessmentId } = await params;

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
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          student: {
            fullName: "asc",
          },
        },
      },
    },
  });

  if (!assessment) {
    notFound();
  }

  // Filter to only students with scores and sort alphabetically by name
  const scoresWithData = assessment.assessmentScores
    .filter((score) => score.score !== null)
    .map((score) => ({
      id: score.id,
      studentName: score.student.fullName,
      score: score.score!,
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));

  const institutionInfo = {
    name: "Math Academy",
    address: "10 Zilla School Road, Mymensingh",
    phone: "+8801914070418",
    email: "kabir0718@gmail.com",
  };

  return (
    <AssessmentPrintContent
      assessment={{
        id: assessment.id,
        title: assessment.title,
        subject: assessment.subject,
        date: assessment.date,
        maxMarks: assessment.maxMarks,
        batchName: assessment.batch.name,
      }}
      scores={scoresWithData}
      institutionInfo={institutionInfo}
    />
  );
}
