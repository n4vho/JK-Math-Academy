"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type Assessment = {
  id: string;
  title: string;
  subject: string;
  date: Date;
  maxMarks: number;
  batchName: string;
};

type Score = {
  id: string;
  studentName: string;
  score: number;
};

type InstitutionInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

type Props = {
  assessment: Assessment;
  scores: Score[];
  institutionInfo: InstitutionInfo;
};

function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print mb-4 flex justify-end">
      <Button onClick={handlePrint} className="gap-2">
        <Printer className="h-4 w-4" />
        Print Results
      </Button>
    </div>
  );
}

export function AssessmentPrintContent({ assessment, scores, institutionInfo }: Props) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculatePercentage = (score: number) => {
    return ((score / assessment.maxMarks) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-white p-8 print:p-0 assessment-print-container">
      <PrintButton />

      <div className="mx-auto max-w-3xl bg-white p-8 print:p-0 assessment-print-section">
        {/* Header - Logo and name in top left */}
        <div className="mb-4 flex items-start justify-between border-b-2 border-blue-800 pb-3">
          <div className="flex items-center gap-3">
            <Image
              src="/math-academy-logo.jpeg"
              alt="Math Academy Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <div>
              <h1 className="text-lg font-bold">{institutionInfo.name}</h1>
              <p className="text-xs text-gray-600">{institutionInfo.address}</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>{institutionInfo.phone}</p>
            <p>{institutionInfo.email}</p>
          </div>
        </div>

        {/* Assessment Details */}
        <div className="mb-6 border-b border-gray-300 pb-4">
          <h2 className="mb-4 text-2xl font-bold text-center">Assessment Results</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Assessment Title:</p>
              <p className="font-semibold">{assessment.title}</p>
            </div>
            <div>
              <p className="text-gray-600">Subject:</p>
              <p className="font-semibold">{assessment.subject}</p>
            </div>
            <div>
              <p className="text-gray-600">Date:</p>
              <p className="font-semibold">{formatDate(assessment.date)}</p>
            </div>
            <div>
              <p className="text-gray-600">Batch:</p>
              <p className="font-semibold">{assessment.batchName}</p>
            </div>
          </div>
        </div>

        {/* Statistics underneath Assessment Results */}
        {scores.length > 0 && (
          <div className="mb-6 border-b border-gray-300 pb-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Students:</p>
                <p className="font-semibold">{scores.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Average Score:</p>
                <p className="font-semibold">
                  {(
                    scores.reduce((sum, s) => sum + s.score, 0) / scores.length
                  ).toFixed(2)} / {assessment.maxMarks}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Average Percentage:</p>
                <p className="font-semibold">
                  {(
                    scores.reduce((sum, s) => sum + parseFloat(calculatePercentage(s.score)), 0) /
                    scores.length
                  ).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Student Results</h3>
          {scores.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No scores entered yet for this assessment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold">S.No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr
                      key={score.id}
                      className="border-b border-gray-300 hover:bg-gray-50 print:hover:bg-transparent"
                    >
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{score.studentName}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        {score.score} / {assessment.maxMarks}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {calculatePercentage(score.score)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Footer */}
        <div className="mt-8 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
