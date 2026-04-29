export type GymSummary = {
  id: string;
  name: string;
  area: string;
  address: string;
  disciplines: string;
  openingHours: string;
  saved: boolean;
};

export type PlanSummary = {
  id: string;
  title: string;
  place: string;
  time: string;
  members: string;
  visibility: string;
};

export type LogSummary = {
  id: string;
  title: string;
  place: string;
  grade: string;
  note: string;
};

export type PostSummary = {
  id: string;
  body: string;
  authorName: string;
  sourceType: "standalone" | "climbing_log" | "session_plan" | "gym";
  sourceLabel: string;
  visibility: string;
};

export type EventSummary = {
  id: string;
  title: string;
  gymName: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  status: "scheduled" | "closed";
};

export type AnnouncementSummary = {
  id: string;
  title: string;
  audience: "all" | "users" | "gyms";
  status: "draft" | "published";
  publishedAt: string;
};

export type ReportSummary = {
  id: string;
  targetType: string;
  category: string;
  status: "open" | "reviewing" | "resolved";
  createdAt: string;
};

export type CommentSummary = {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export type AuditLogSummary = {
  id: string;
  action: string;
  targetType: string;
  actorName: string;
  createdAt: string;
};

export type NotificationSummary = {
  id: string;
  type: string;
  title: string;
  body: string;
  targetType: string;
  targetId: string;
  readAt: string | null;
  createdAt: string;
};

export type UserProfileSummary = {
  userId: string;
  email: string | null;
  displayName: string;
  discipline: "boulder" | "lead" | "top_rope";
  experience: "beginner" | "intermediate" | "advanced";
  area: string;
  defaultVisibility: string;
  locationEnabled: false;
};

export type AdminUserSummary = {
  id: string;
  email: string;
  displayName: string;
  status: string;
  area: string;
  createdAt: string;
};

export const gymFixtures: GymSummary[] = [
  {
    id: "b-pump-tokyo",
    name: "B-PUMP Tokyo",
    area: "秋葉原",
    address: "東京都千代田区",
    disciplines: "ボルダー / リード",
    openingHours: "平日 12:00-23:00",
    saved: true,
  },
  {
    id: "rocky-shinagawa",
    name: "Rocky Shinagawa",
    area: "品川",
    address: "東京都港区",
    disciplines: "ボルダー",
    openingHours: "10:00-22:00",
    saved: false,
  },
  {
    id: "noborock-shibuya",
    name: "Noborock Shibuya",
    area: "渋谷",
    address: "東京都渋谷区",
    disciplines: "ボルダー",
    openingHours: "平日 13:00-23:00",
    saved: true,
  },
];

export const planFixtures: PlanSummary[] = [
  {
    id: "tuesday-night",
    title: "火曜夜に軽く登る",
    place: "B-PUMP Tokyo",
    time: "5/1 19:30",
    members: "3人",
    visibility: "followers",
  },
  {
    id: "weekend-session",
    title: "週末セッション",
    place: "Rocky Shinagawa",
    time: "5/4 10:00",
    members: "2人",
    visibility: "public",
  },
];

export const logFixtures: LogSummary[] = [
  {
    id: "yellow-wall",
    title: "垂壁の黄色を完登",
    place: "Noborock Shibuya",
    grade: "4級",
    note: "保持より足位置が効いた。",
  },
  {
    id: "lead-basic",
    title: "リード基礎練",
    place: "B-PUMP Tokyo",
    grade: "5.10a",
    note: "クリップのリズムを確認。",
  },
];

export const postFixtures: PostSummary[] = [
  {
    id: "yellow-wall-post",
    body: "垂壁の黄色、足位置を変えたら一気に安定した。",
    authorName: "Climber",
    sourceType: "climbing_log",
    sourceLabel: "垂壁の黄色を完登",
    visibility: "followers",
  },
  {
    id: "partner-search-post",
    body: "週末の午前中に品川で登れる人を探しています。",
    authorName: "Climber",
    sourceType: "session_plan",
    sourceLabel: "週末セッション",
    visibility: "public",
  },
];

export const eventFixtures: EventSummary[] = [
  {
    id: "b-pump-beginner-session",
    title: "はじめてのボルダー講習",
    gymName: "B-PUMP Tokyo",
    startsAt: "2026-05-02 19:00",
    endsAt: "2026-05-02 20:30",
    capacity: "12人",
    status: "scheduled",
  },
  {
    id: "rocky-morning-session",
    title: "朝活セッション",
    gymName: "Rocky Shinagawa",
    startsAt: "2026-05-05 08:00",
    endsAt: "2026-05-05 10:00",
    capacity: "8人",
    status: "scheduled",
  },
];

export const announcementFixtures: AnnouncementSummary[] = [
  {
    id: "beta-guideline",
    title: "ベータ利用ガイドを公開",
    audience: "all",
    status: "published",
    publishedAt: "2026-04-28 09:00",
  },
  {
    id: "event-policy",
    title: "イベント掲載ポリシー確認",
    audience: "gyms",
    status: "draft",
    publishedAt: "",
  },
];

export const reportFixtures: ReportSummary[] = [
  {
    id: "report-001",
    targetType: "post",
    category: "スパム",
    status: "open",
    createdAt: "2026-04-28 10:30",
  },
  {
    id: "report-002",
    targetType: "comment",
    category: "ハラスメント",
    status: "reviewing",
    createdAt: "2026-04-28 12:45",
  },
];

export const auditLogFixtures: AuditLogSummary[] = [
  {
    id: "audit-001",
    action: "gym_update",
    targetType: "gym",
    actorName: "admin",
    createdAt: "2026-04-28 09:12",
  },
  {
    id: "audit-002",
    action: "report_status_update",
    targetType: "report",
    actorName: "admin",
    createdAt: "2026-04-28 13:18",
  },
];

export const notificationFixtures: NotificationSummary[] = [
  {
    id: "notification-plan-comment",
    type: "comment",
    title: "予定にコメントがありました",
    body: "火曜夜の予定に新しいコメントがあります。",
    targetType: "session_plan",
    targetId: "tuesday-night",
    readAt: null,
    createdAt: "2026-04-29 09:00",
  },
  {
    id: "notification-event",
    type: "event",
    title: "保存ジムのイベント",
    body: "B-PUMP Tokyoで初心者向け講習が予定されています。",
    targetType: "event",
    targetId: "b-pump-beginner-session",
    readAt: "2026-04-29 10:00",
    createdAt: "2026-04-29 08:30",
  },
];

export function findGymFixture(gymId: string) {
  return gymFixtures.find((gym) => gym.id === gymId);
}

export function findPlanFixture(planId: string) {
  return planFixtures.find((plan) => plan.id === planId);
}

export function findLogFixture(logId: string) {
  return logFixtures.find((log) => log.id === logId);
}

export function findPostFixture(postId: string) {
  return postFixtures.find((post) => post.id === postId);
}

export function findEventFixture(eventId: string) {
  return eventFixtures.find((event) => event.id === eventId);
}

export function findAnnouncementFixture(announcementId: string) {
  return announcementFixtures.find((announcement) => announcement.id === announcementId);
}

export const feedFixtures = [
  ...planFixtures.map((plan) => ({ type: "session_plan" as const, item: plan })),
  ...logFixtures.slice(0, 1).map((log) => ({ type: "climbing_log" as const, item: log })),
  ...postFixtures.map((post) => ({ type: "post" as const, item: post })),
];
