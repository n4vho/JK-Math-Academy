import webpush from "web-push";
import { prisma } from "@/lib/db";

type AssessmentPayload = {
  id: string;
  title: string;
  batchId: string;
};

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

function ensureVapidConfigured() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    throw new Error("VAPID keys are not configured");
  }
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendAssessmentPush(assessment: AssessmentPayload) {
  try {
    ensureVapidConfigured();

    const students = await prisma.student.findMany({
      where: { batchId: assessment.batchId },
      select: { id: true },
    });

    if (students.length === 0) {
      return;
    }

    const userIds = students.map((student) => `student:${student.id}`);
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        isEnabled: true,
        userId: { in: userIds },
      },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({
      title: "Math Academy",
      body: `New assessment: ${assessment.title}`,
      url: `/student/results`,
    });

    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        )
      )
    );

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Assessment push failed:", result.reason);
      }
    });
  } catch (error) {
    console.error("sendAssessmentPush error:", error);
  }
}
