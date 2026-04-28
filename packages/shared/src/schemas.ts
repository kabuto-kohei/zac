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
  targetType: z.enum(["post", "session_plan", "climbing_log", "user"]),
  targetId: z.string().min(1).max(120),
  category: reportCategorySchema,
  note: z.string().max(1000).nullable().optional(),
});

export type Visibility = z.infer<typeof visibilitySchema>;
export type SessionPlanStatus = z.infer<typeof sessionPlanStatusSchema>;
export type JoinPolicy = z.infer<typeof joinPolicySchema>;
export type LocalSessionInput = z.infer<typeof localSessionSchema>;
export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
export type CreateSessionPlanInput = z.infer<typeof createSessionPlanSchema>;
export type CreateClimbingLogInput = z.infer<typeof createClimbingLogSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
