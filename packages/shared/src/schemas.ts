import { z } from "zod";
import { joinPolicyValues, sessionPlanStatusValues, visibilityValues } from "./constants.js";

export const visibilitySchema = z.enum(visibilityValues);
export const sessionPlanStatusSchema = z.enum(sessionPlanStatusValues);
export const joinPolicySchema = z.enum(joinPolicyValues);

export const uuidSchema = z.string().uuid();

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const localSessionSchema = z.object({
  email: z.string().email(),
});

export const onboardingProfileSchema = z.object({
  displayName: z.string().min(1).max(40),
  discipline: z.enum(["boulder", "lead", "top_rope"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  area: z.string().min(1).max(40),
  interest: z.enum(["partner", "log", "event", "training"]),
  defaultVisibility: visibilitySchema.default("followers"),
  locationEnabled: z.literal(false),
});

export const updateProfileSettingsSchema = z.object({
  defaultVisibility: visibilitySchema.default("followers"),
  locationEnabled: z.literal(false),
});

export const createSessionPlanSchema = z
  .object({
    title: z.string().min(1).max(80),
    gymId: uuidSchema.nullish(),
    placeName: z.string().min(1).max(120).nullish(),
    disciplineId: uuidSchema.nullish(),
    startAt: z.string().datetime({ offset: true }),
    endAt: z.string().datetime({ offset: true }),
    visibility: visibilitySchema.default("followers"),
    joinPolicy: joinPolicySchema.default("open"),
    maxParticipants: z.number().int().min(1).nullable().optional(),
    note: z.string().max(1000).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (!value.gymId && !value.placeName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "gymId or placeName is required.",
        path: ["gymId"],
      });
    }

    if (Date.parse(value.startAt) >= Date.parse(value.endAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startAt must be before endAt.",
        path: ["startAt"],
      });
    }
  });

export const createClimbingLogSchema = z
  .object({
    sessionPlanId: uuidSchema.nullish(),
    gymId: uuidSchema.nullish(),
    placeName: z.string().min(1).max(120).nullish(),
    disciplineId: uuidSchema.nullish(),
    climbedOn: z.string().date(),
    gradeText: z.string().max(50).nullable().optional(),
    summary: z.string().max(140).nullable().optional(),
    note: z.string().max(2000).nullable().optional(),
    visibility: visibilitySchema.default("private"),
  })
  .superRefine((value, context) => {
    if (!value.gymId && !value.placeName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "gymId or placeName is required.",
        path: ["gymId"],
      });
    }
  });

export const createPostSchema = z.object({
  body: z.string().min(1).max(500),
  categoryId: uuidSchema.nullish(),
  visibility: visibilitySchema.default("followers"),
});

export const reportCategorySchema = z.enum([
  "gym_info_update",
  "event_info_update",
  "new_event_request",
  "closure_or_relocation",
  "source_link_update",
  "harassment",
  "spam",
  "inappropriate_image",
  "dangerous_behavior",
  "personal_information",
  "copyright",
  "impersonation",
  "other",
]);

export const createReportSchema = z.object({
  targetType: z.enum(["gym", "event", "post", "comment", "session_plan", "climbing_log", "user"]),
  targetId: z.string().min(1).max(120),
  category: reportCategorySchema,
  note: z.string().max(1000).nullable().optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(300),
});

export const mediaUploadTargetSchema = z.enum(["avatar", "post", "climbing_log"]);
export const mediaAttachTargetSchema = z.enum(["post", "climbing_log"]);

export const mediaUploadFileSchema = z.object({
  fileName: z.string().min(1).max(120),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().min(1).max(5 * 1024 * 1024),
});

export const createMediaUploadUrlsSchema = z
  .object({
    targetType: mediaUploadTargetSchema,
    targetId: z.string().min(1).max(120).optional(),
    files: z.array(mediaUploadFileSchema).min(1).max(4),
  })
  .superRefine((value, context) => {
    if (value.targetType !== "avatar" && !value.targetId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetId is required.",
        path: ["targetId"],
      });
    }

    if (value.targetType === "avatar" && value.files.length > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "avatar accepts only one image.",
        path: ["files"],
      });
    }
  });

export const attachMediaSchema = z.object({
  targetType: mediaAttachTargetSchema,
  targetId: uuidSchema,
  paths: z.array(z.string().min(1).max(500)).min(1).max(4),
});

export const adminReportStatusSchema = z.enum(["open", "reviewing", "resolved"]);
export const adminModerationActionSchema = z.enum(["hide_post", "delete_comment", "warn_user", "suspend_user", "ban_user", "dismiss_report", "mark_review_pending"]);
export const adminGymStatusSchema = z.enum(["draft", "published", "closed"]);
export const adminEventStatusSchema = z.enum(["draft", "scheduled", "closed"]);
export const adminAnnouncementStatusSchema = z.enum(["draft", "published"]);
export const adminEventReviewActionSchema = z.enum(["approve", "reject"]);
export const adminEventCategorySchema = z.enum([
  "event",
  "lesson",
  "competition",
  "route_set",
  "opening_change",
  "private_booking",
  "construction",
  "notice",
  "recruit",
]);
export const instagramReviewQueueActionSchema = z.object({
  action: z.enum(["confirm_official", "reject_official", "needs_followup"]),
  reason: z.string().max(1000).nullable().optional(),
});

export const sourceObservationReviewActionSchema = z.object({
  action: z.enum(["ignore", "keep_pending"]),
  reason: z.string().max(1000).nullable().optional(),
});

export const updateReportStatusSchema = z.object({
  status: adminReportStatusSchema,
  action: adminModerationActionSchema.default("mark_review_pending"),
  reason: z.string().max(1000).nullable().optional(),
});

export const moderatePostSchema = z.object({
  action: z.enum(["hide_post", "dismiss_report"]),
  reason: z.string().max(1000).nullable().optional(),
});

export const updateGymStatusSchema = z.object({
  status: adminGymStatusSchema,
  reason: z.string().max(1000).nullable().optional(),
});

export const reviewAdminEventSchema = z.object({
  action: adminEventReviewActionSchema,
  reason: z.string().max(1000).nullable().optional(),
});

export const upsertAdminEventSchema = z
  .object({
    title: z.string().min(1).max(120),
    gymId: uuidSchema.nullish(),
    description: z.string().max(2000).nullable().optional(),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }).nullable().optional(),
    status: adminEventStatusSchema.default("draft"),
  })
  .superRefine((value, context) => {
    if (value.endsAt && Date.parse(value.startsAt) >= Date.parse(value.endsAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startsAt must be before endsAt.",
        path: ["startsAt"],
      });
    }
  });

export const upsertAdminAnnouncementSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(4000),
  status: adminAnnouncementStatusSchema.default("draft"),
});

export type Visibility = z.infer<typeof visibilitySchema>;
export type SessionPlanStatus = z.infer<typeof sessionPlanStatusSchema>;
export type JoinPolicy = z.infer<typeof joinPolicySchema>;
export type LocalSessionInput = z.infer<typeof localSessionSchema>;
export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
export type UpdateProfileSettingsInput = z.infer<typeof updateProfileSettingsSchema>;
export type CreateSessionPlanInput = z.infer<typeof createSessionPlanSchema>;
export type CreateClimbingLogInput = z.infer<typeof createClimbingLogSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type MediaUploadTarget = z.infer<typeof mediaUploadTargetSchema>;
export type MediaAttachTarget = z.infer<typeof mediaAttachTargetSchema>;
export type MediaUploadFileInput = z.infer<typeof mediaUploadFileSchema>;
export type CreateMediaUploadUrlsInput = z.infer<typeof createMediaUploadUrlsSchema>;
export type AttachMediaInput = z.infer<typeof attachMediaSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type ModeratePostInput = z.infer<typeof moderatePostSchema>;
export type UpdateGymStatusInput = z.infer<typeof updateGymStatusSchema>;
export type ReviewAdminEventInput = z.infer<typeof reviewAdminEventSchema>;
export type UpsertAdminEventInput = z.infer<typeof upsertAdminEventSchema>;
export type InstagramReviewQueueActionInput = z.infer<typeof instagramReviewQueueActionSchema>;
export type SourceObservationReviewActionInput = z.infer<typeof sourceObservationReviewActionSchema>;
export type UpsertAdminAnnouncementInput = z.infer<typeof upsertAdminAnnouncementSchema>;
