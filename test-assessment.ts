import "dotenv/config";
import { prisma } from "./lib/db";

async function testAssessmentCreation() {
  try {
    console.log("Testing Assessment creation...\n");

    // Get the first batch (or create one if none exists)
    let batch = await prisma.batch.findFirst();
    
    if (!batch) {
      console.log("No batch found. Creating a test batch...");
      batch = await prisma.batch.create({
        data: {
          name: "Test Batch",
          description: "Test batch for assessment testing",
        },
      });
      console.log(`Created batch: ${batch.name} (${batch.id})\n`);
    } else {
      console.log(`Using existing batch: ${batch.name} (${batch.id})\n`);
    }

    // Create an Assessment
    const assessment = await prisma.assessment.create({
      data: {
        batchId: batch.id,
        title: "Math Midterm Exam",
        subject: "Mathematics",
        date: new Date("2024-01-15"),
        maxMarks: 100,
      },
    });

    console.log("✅ Assessment created successfully!");
    console.log("\nAssessment details:");
    console.log({
      id: assessment.id,
      batchId: assessment.batchId,
      title: assessment.title,
      subject: assessment.subject,
      date: assessment.date,
      maxMarks: assessment.maxMarks,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    });

    // Verify we can query it back
    const retrieved = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: {
        batch: true,
      },
    });

    if (retrieved) {
      console.log("\n✅ Assessment retrieved successfully!");
      console.log(`Batch name: ${retrieved.batch.name}`);
    } else {
      console.log("\n❌ Failed to retrieve assessment");
    }
  } catch (error) {
    console.error("❌ Error creating assessment:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAssessmentCreation();
