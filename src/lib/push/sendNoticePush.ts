import webpush from "web-push";
import { prisma } from "@/lib/db";

type NoticePayload = {
  id: string;
  title: string;
  audienceType: string;
  audienceRefId: string | null;
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

function mapAudienceFilter(audienceType: string, audienceRefId: string | null) {
  switch (audienceType) {
    case "ALL":
      return { mode: "all" as const };
    case "STAFF_ONLY":
      return { mode: "staff" as const };
    case "GUARDIAN_ONLY":
      return { mode: "guardians" as const };
    case "STUDENT":
      return { mode: "student" as const, userIds: audienceRefId ? [`student:${audienceRefId}`] : [] };
    case "BATCH":
      return { mode: "batch" as const };
    case "CLASS":
      return { mode: "class" as const };
    default:
      return { mode: "all" as const };
  }
}

async function resolveUserIdsByAudience(
  audienceType: string,
  audienceRefId: string | null
) {
  const mapping = mapAudienceFilter(audienceType, audienceRefId);

  if (mapping.mode === "all") {
    return { all: true as const };
  }

  if (mapping.mode === "staff") {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (!admin) return { userIds: [] as string[] };
    return { userIds: [`admin:${admin.id}`] };
  }

  if (mapping.mode === "guardians") {
    // TODO: Replace with real guardian mapping once auth exists.
    return { userIdStartsWith: "student:" };
  }

  if (mapping.mode === "student") {
    return { userIds: mapping.userIds || [] };
  }

  if (mapping.mode === "batch" && audienceRefId) {
    const students = await prisma.student.findMany({
      where: { batchId: audienceRefId },
      select: { id: true },
    });
    return { userIds: students.map((student) => `student:${student.id}`) };
  }

  if (mapping.mode === "class" && audienceRefId) {
    const students = await prisma.student.findMany({
      where: { grade: audienceRefId },
      select: { id: true },
    });
    return { userIds: students.map((student) => `student:${student.id}`) };
  }

  return { userIds: [] as string[] };
}

export async function sendNoticePush(notice: NoticePayload) {
  try {
    ensureVapidConfigured();

    const audience = await resolveUserIdsByAudience(
      notice.audienceType,
      notice.audienceRefId
    );

    let subscriptions = [];

    if ("all" in audience) {
      subscriptions = await prisma.pushSubscription.findMany({
        where: { isEnabled: true },
        select: { endpoint: true, p256dh: true, auth: true },
      });
    } else if ("userIdStartsWith" in audience) {
      subscriptions = await prisma.pushSubscription.findMany({
        where: {
          isEnabled: true,
          userId: { startsWith: audience.userIdStartsWith },
        },
        select: { endpoint: true, p256dh: true, auth: true },
      });
    } else {
      const userIds = audience.userIds || [];
      if (userIds.length === 0) return;
      subscriptions = await prisma.pushSubscription.findMany({
        where: {
          isEnabled: true,
          userId: { in: userIds },
        },
        select: { endpoint: true, p256dh: true, auth: true },
      });
    }

    if (subscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({
      title: "Math Academy",
      body: notice.title,
      url: `/notices/${notice.id}`,
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
        console.error("Push send failed:", result.reason);
      }
    });
  } catch (error) {
    console.error("sendNoticePush error:", error);
  }
}
