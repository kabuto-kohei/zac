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

export type ReportSummary = {
  id: string;
  targetType: string;
  category: string;
  status: "open" | "reviewing" | "resolved";
  createdAt: string;
};

export type AuditLogSummary = {
  id: string;
  action: string;
  targetType: string;
  actorName: string;
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

export const feedFixtures = [
  ...planFixtures.map((plan) => ({ type: "session_plan" as const, item: plan })),
  ...logFixtures.slice(0, 1).map((log) => ({ type: "climbing_log" as const, item: log })),
  ...postFixtures.map((post) => ({ type: "post" as const, item: post })),
];
