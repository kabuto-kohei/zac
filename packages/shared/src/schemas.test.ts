import assert from "node:assert/strict";
import test from "node:test";
import {
  createClimbingLogSchema,
  createPostSchema,
  createReportSchema,
  createSessionPlanSchema,
  localSessionSchema,
  onboardingProfileSchema,
} from "./schemas.js";

test("createSessionPlanSchema accepts a valid gym plan", () => {
  const result = createSessionPlanSchema.safeParse({
    title: "火曜夜にB-PUMPで登る",
    gymId: "00000000-0000-4000-8000-000000000001",
    disciplineId: "00000000-0000-4000-8000-000000000002",
    startAt: "2026-05-01T10:00:00+09:00",
    endAt: "2026-05-01T12:00:00+09:00",
    visibility: "followers",
    joinPolicy: "open",
    maxParticipants: 4,
    note: "軽めに登ります",
  });

  assert.equal(result.success, true);
});

test("createSessionPlanSchema rejects missing place", () => {
  const result = createSessionPlanSchema.safeParse({
    title: "場所未定",
    startAt: "2026-05-01T10:00:00+09:00",
    endAt: "2026-05-01T12:00:00+09:00",
  });

  assert.equal(result.success, false);
});

test("createSessionPlanSchema rejects inverted time range", () => {
  const result = createSessionPlanSchema.safeParse({
    title: "時間不正",
    placeName: "任意場所",
    startAt: "2026-05-01T12:00:00+09:00",
    endAt: "2026-05-01T10:00:00+09:00",
  });

  assert.equal(result.success, false);
});

test("createClimbingLogSchema accepts a valid log", () => {
  const result = createClimbingLogSchema.safeParse({
    gymId: "00000000-0000-4000-8000-000000000001",
    climbedOn: "2026-05-01",
    gradeText: "4級",
    summary: "垂壁の黄色を完登",
    visibility: "private",
  });

  assert.equal(result.success, true);
});

test("createClimbingLogSchema rejects missing place", () => {
  const result = createClimbingLogSchema.safeParse({
    climbedOn: "2026-05-01",
  });

  assert.equal(result.success, false);
});

test("createPostSchema accepts a valid post", () => {
  const result = createPostSchema.safeParse({
    body: "垂壁の黄色、足位置を変えたら安定した。",
    visibility: "followers",
  });

  assert.equal(result.success, true);
});

test("createPostSchema rejects empty body", () => {
  const result = createPostSchema.safeParse({
    body: "",
    visibility: "public",
  });

  assert.equal(result.success, false);
});

test("localSessionSchema accepts email", () => {
  const result = localSessionSchema.safeParse({
    email: "climber@example.test",
  });

  assert.equal(result.success, true);
});

test("onboardingProfileSchema keeps location disabled", () => {
  const result = onboardingProfileSchema.safeParse({
    displayName: "Climber",
    discipline: "boulder",
    experience: "beginner",
    area: "東京",
    interest: "partner",
    defaultVisibility: "followers",
    locationEnabled: false,
  });

  assert.equal(result.success, true);
});

test("createReportSchema accepts a valid report", () => {
  const result = createReportSchema.safeParse({
    targetType: "post",
    targetId: "yellow-wall-post",
    category: "spam",
    note: "同じ内容が繰り返されています。",
  });

  assert.equal(result.success, true);
});

test("createReportSchema rejects missing target", () => {
  const result = createReportSchema.safeParse({
    targetType: "post",
    targetId: "",
    category: "other",
  });

  assert.equal(result.success, false);
});
