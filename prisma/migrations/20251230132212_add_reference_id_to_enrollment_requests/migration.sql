-- AlterTable: Add referenceId column as nullable first
ALTER TABLE "EnrollmentRequest" ADD COLUMN "referenceId" TEXT;

-- Backfill existing records with reference IDs
-- Generate REQ-0001, REQ-0002, etc. for existing records
DO $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN SELECT id FROM "EnrollmentRequest" ORDER BY "createdAt" ASC
    LOOP
        UPDATE "EnrollmentRequest"
        SET "referenceId" = 'REQ-' || LPAD(counter::TEXT, 4, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Make referenceId NOT NULL after backfilling
ALTER TABLE "EnrollmentRequest" ALTER COLUMN "referenceId" SET NOT NULL;

-- CreateIndex: Add unique constraint after data is populated
CREATE UNIQUE INDEX "EnrollmentRequest_referenceId_key" ON "EnrollmentRequest"("referenceId");

-- CreateIndex: Add regular index
CREATE INDEX "EnrollmentRequest_referenceId_idx" ON "EnrollmentRequest"("referenceId");
