"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AssessmentScore = {
  id: string;
  score: number | null;
  remarks: string | null;
  assessment: {
    id: string;
    title: string;
    subject: string;
    date: string;
    maxMarks: number;
  };
};

type Props = {
  scores: AssessmentScore[];
};

export function MarksHistoryTab({ scores }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Marks History</CardTitle>
      </CardHeader>
      <CardContent>
        {scores.length === 0 ? (
          <p className="text-muted-foreground">
            No assessment scores recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Assessment Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score) => (
                  <tr
                    key={score.id}
                    className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      {score.assessment.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {score.assessment.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(score.assessment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {score.score !== null ? (
                        <span>
                          {score.score} / {score.assessment.maxMarks}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Not entered
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {score.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
