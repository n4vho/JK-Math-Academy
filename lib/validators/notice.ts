import { z } from "zod";

export const NoticeTypeSchema = z.enum([
  "ANNOUNCEMENT",
  "EXAM_SCHEDULE",
  "EXAM_RESULT",
  "PAYMENT",
  "URGENT",
  "OTHER",
]);

export const NoticeAudienceTypeSchema = z.enum([
  "ALL",
  "BATCH",
  "CLASS",
  "STUDENT",
  "GUARDIAN_ONLY",
  "STAFF_ONLY",
]);

export const CreateNoticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  type: NoticeTypeSchema,
  audienceType: NoticeAudienceTypeSchema,
  audienceRefId: z.string().optional(),
  isPinned: z.boolean().optional(),
  publishAt: z.string().datetime().optional(),
  attachmentUrl: z.string().optional(),
});

export const MarkReadSchema = z.object({});

export type CreateNoticeInput = z.infer<typeof CreateNoticeSchema>;
