import assert from "node:assert/strict";
import test from "node:test";
import { formatEventDisplayTitle } from "./event-title.js";
import {
  attachMediaSchema,
  createClimbingLogSchema,
  createMediaUploadUrlsSchema,
  createPostSchema,
  createReportSchema,
  createSessionPlanSchema,
  localSessionSchema,
  onboardingProfileSchema,
} from "./schemas.js";

test("formatEventDisplayTitle keeps useful official titles", () => {
  assert.equal(
    formatEventDisplayTitle({
      category: "competition",
      gymName: "ディーボルダリング 八王子",
      startsAt: "2026-05-16 10:00",
      title: "TAMAX 2026 ディーボルダリング八王子OPA",
    }),
    "TAMAX 2026 ディーボルダリング八王子OPA",
  );
});

test("formatEventDisplayTitle replaces generic source titles with contextual titles", () => {
  assert.equal(
    formatEventDisplayTitle({
      category: "route_set",
      gymName: "HEADROCK",
      startsAt: "2026-05-18 13:00",
      title: "▶︎▶︎▶︎",
    }),
    "HEADROCK 5/18 セット替え",
  );
});

test("formatEventDisplayTitle replaces long operational source text with contextual titles", () => {
  assert.equal(
    formatEventDisplayTitle({
      category: "opening_change",
      gymName: "クライミングジム Hutte",
      startsAt: "2026-05-20 10:00",
      title: "5/20〜22日まで急遽臨時休業となります😭臨時休業に伴い壁の改装工事が大幅に遅れるかもしれません🙏",
    }),
    "クライミングジム Hutte 5/20 営業情報",
  );
});

test("formatEventDisplayTitle replaces noisy competition source text with contextual titles", () => {
  assert.equal(
    formatEventDisplayTitle({
      category: "competition",
      gymName: "クライミングジム RISE",
      startsAt: "2026-08-29 10:00",
      title: "⚡️Check⚡️Check⚡️Check⚡️",
    }),
    "クライミングジム RISE 8/29 コンペ",
  );
});

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

test("createMediaUploadUrlsSchema accepts image upload requests", () => {
  const result = createMediaUploadUrlsSchema.safeParse({
    targetType: "post",
    targetId: "00000000-0000-4000-8000-000000000001",
    files: [
      {
        fileName: "wall.png",
        contentType: "image/png",
        size: 1024,
      },
    ],
  });

  assert.equal(result.success, true);
});

test("createMediaUploadUrlsSchema rejects oversized images", () => {
  const result = createMediaUploadUrlsSchema.safeParse({
    targetType: "climbing_log",
    targetId: "00000000-0000-4000-8000-000000000001",
    files: [
      {
        fileName: "large.jpg",
        contentType: "image/jpeg",
        size: 5 * 1024 * 1024 + 1,
      },
    ],
  });

  assert.equal(result.success, false);
});

test("attachMediaSchema accepts uploaded post paths", () => {
  const result = attachMediaSchema.safeParse({
    targetType: "post",
    targetId: "00000000-0000-4000-8000-000000000001",
    paths: ["posts/00000000-0000-4000-8000-000000000001/image.jpg"],
  });

  assert.equal(result.success, true);
});

test("attachMediaSchema rejects missing paths", () => {
  const result = attachMediaSchema.safeParse({
    targetType: "climbing_log",
    targetId: "00000000-0000-4000-8000-000000000001",
    paths: [],
  });

  assert.equal(result.success, false);
});
