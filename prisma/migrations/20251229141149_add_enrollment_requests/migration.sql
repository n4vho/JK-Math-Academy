-- CreateEnum
CREATE TYPE "EnrollmentRequestStatus" AS ENUM ('NEW', 'CONTACTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "EnrollmentRequest" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "grade" TEXT,
    "school" TEXT,
    "subjects" TEXT,
    "message" TEXT,
    "status" "EnrollmentRequestStatus" NOT NULL DEFAULT 'NEW',
    "convertedStudentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnrollmentRequest_status_idx" ON "EnrollmentRequest"("status");

-- CreateIndex
CREATE INDEX "EnrollmentRequest_createdAt_idx" ON "EnrollmentRequest"("createdAt");

-- CreateIndex
CREATE INDEX "EnrollmentRequest_convertedStudentId_idx" ON "EnrollmentRequest"("convertedStudentId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentRequest_convertedStudentId_key" ON "EnrollmentRequest"("convertedStudentId");

-- AddForeignKey
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_convertedStudentId_fkey" FOREIGN KEY ("convertedStudentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
