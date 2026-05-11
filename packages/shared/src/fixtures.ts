import { kantoGymFixtures } from "./kanto-gym-fixtures.js";
import { kantoEventFixtures } from "./kanto-event-fixtures.js";

export type GymSummary = {
  id: string;
  name: string;
  area: string;
  address: string;
  disciplines: string;
  openingHours: string;
  websiteUrl?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  sourceUrl?: string;
  sourceAttribution?: string;
  sourceVerifiedAt?: string;
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
  category:
    | "event"
    | "lesson"
    | "competition"
    | "route_set"
    | "opening_change"
    | "private_booking"
    | "construction"
    | "notice"
    | "recruit";
  title: string;
  summary: string;
  description: string;
  gymName: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  sourceUrl: string;
  sourceLabel: string;
  sourceQuote?: string;
  status: "draft" | "scheduled" | "closed";
};

export type EventSourceSummary = {
  id: string;
  platform: "instagram" | "web";
  handle: string;
  displayName: string;
  sourceUrl: string;
  sourceType: "aggregator_instagram" | "official_instagram" | "official_site" | "media_summary";
  relationshipSourceHandle: string | null;
  discoverySource: string;
  discoveryNote: string;
  ingestionPolicy: "summary_with_link";
  lastCheckedAt: string;
  sourceVerifiedAt: string | null;
  status: "candidate" | "approved" | "paused" | "rejected";
};

export type AnnouncementSummary = {
  id: string;
  title: string;
  body: string;
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
    address: "東京都文京区湯島1-1-8",
    disciplines: "ボルダー / リード",
    openingHours: "平日 12:00-23:00 / 土祝 11:00-21:00 / 日 10:00-21:00",
    websiteUrl: "https://pump-climbing.com/gym/akiba/",
    instagramHandle: "bpumptokyo",
    instagramUrl: "https://www.instagram.com/bpumptokyo/",
    sourceUrl: "https://pump-climbing.com/gym/akiba/",
    sourceAttribution: "B-PUMP TOKYO AKIHABARA 公式サイト",
    sourceVerifiedAt: "2026-05-10",
    saved: true,
  },
  {
    id: "rocky-shinagawa",
    name: "Rocky Shinagawa",
    area: "品川",
    address: "東京都港区港南5-4-38 松岡品川埠頭ビル103",
    disciplines: "ボルダー / フィットネス",
    openingHours: "平日 10:00-23:00 / 土日祝 10:00-21:00",
    websiteUrl: "https://www.rockyclimbing.com/shinagawa/",
    instagramHandle: "rocky_shinagawa",
    instagramUrl: "https://www.instagram.com/rocky_shinagawa/",
    sourceUrl: "https://www.rockyclimbing.com/shinagawa/",
    sourceAttribution: "ROCKY Climbing & Fitness Gym 品川店 公式サイト",
    sourceVerifiedAt: "2026-05-10",
    saved: false,
  },
  {
    id: "noborock-shibuya",
    name: "Noborock Shibuya",
    area: "渋谷",
    address: "東京都渋谷区桜丘町9-1 ビアンクォードビル B1",
    disciplines: "ボルダー",
    openingHours: "平日 10:00-23:00 / 土日祝 10:00-22:00",
    websiteUrl: "https://noborock-climbing.com/program/shibuya/",
    instagramHandle: "noborock_shibuya",
    instagramUrl: "https://www.instagram.com/noborock_shibuya/",
    sourceUrl: "https://noborock-climbing.com/program/shibuya/",
    sourceAttribution: "NOBOROCK 渋谷店 公式サイト",
    sourceVerifiedAt: "2026-05-10",
    saved: true,
  },
  ...kantoGymFixtures,
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
    category: "event",
    title: "ビギナー道場",
    summary: "土日祝の午後に開催される、スタッフ設定課題を参加者で登る初心者向けセッション。",
    description: "B-PUMP Tokyo の道場情報に基づくイベント。開催日は公式NEWSやInstagramで最新情報を確認してください。",
    gymName: "B-PUMP Tokyo",
    startsAt: "2026-05-03 15:00",
    endsAt: "2026-05-03 16:00",
    capacity: "予約不要",
    sourceUrl: "https://pump-climbing.com/gym/akiba/school/",
    sourceLabel: "B-PUMP Tokyo 公式サイト",
    sourceQuote: "土曜日・日曜日・祝日 ビギナー道場",
    status: "scheduled",
  },
  {
    id: "b-pump-rooftop-route-set",
    category: "route_set",
    title: "4F ROOF TOP セット営業変更",
    summary: "4F ROOF TOP のルートセットに伴うクローズ/セット予定。",
    description: "B-PUMP Tokyo 公式NEWSに基づくセット営業変更。来店前に公式ページで最新状況を確認してください。",
    gymName: "B-PUMP Tokyo",
    startsAt: "2026-05-11 22:30",
    endsAt: "2026-05-15 12:00",
    capacity: "営業変更",
    sourceUrl: "https://pump-climbing.com/gym/akiba/",
    sourceLabel: "B-PUMP Tokyo 公式サイト",
    sourceQuote: "4F ROOF TOP SET",
    status: "scheduled",
  },
  {
    id: "noborock-shibuya-route-set",
    category: "route_set",
    title: "渋谷店 ルートセット営業変更",
    summary: "5/17は17:00クローズ、5/18はクローズ、5/19は18:30オープン予定。",
    description: "NOBOROCK 渋谷店公式ページのルートセット告知に基づく営業変更。来店前に公式ページで最新状況を確認してください。",
    gymName: "Noborock Shibuya",
    startsAt: "2026-05-17 17:00",
    endsAt: "2026-05-19 18:30",
    capacity: "営業変更",
    sourceUrl: "https://noborock-climbing.com/program/shibuya/",
    sourceLabel: "NOBOROCK 渋谷店 公式サイト",
    sourceQuote: "5/17(日) 17:00 close",
    status: "scheduled",
  },
  ...kantoEventFixtures,
];

export const eventSourceFixtures: EventSourceSummary[] = [
  {
    id: "event-source-comp-bible",
    platform: "instagram",
    handle: "comp_bible",
    displayName: "コンペバイブル",
    sourceUrl: "https://www.instagram.com/comp_bible/",
    sourceType: "aggregator_instagram",
    relationshipSourceHandle: null,
    discoverySource: "user_request",
    discoveryNote: "クライミングコンペ/イベント情報の発見起点。正確なInstagram handleとフォロー一覧はユーザー確認後に確定する。",
    ingestionPolicy: "summary_with_link",
    lastCheckedAt: "2026-05-10",
    sourceVerifiedAt: null,
    status: "candidate",
  },
  {
    id: "event-source-westrock-event",
    platform: "web",
    handle: "westrock-climbing-event",
    displayName: "WESTROCK 公式イベント情報",
    sourceUrl: "https://www.westrock-climbing.com/event/",
    sourceType: "official_site",
    relationshipSourceHandle: "comp_bible",
    discoverySource: "manual_crosscheck",
    discoveryNote: "STONE CIRCUIT Plus+ と TAMAX 2026 の確認元。",
    ingestionPolicy: "summary_with_link",
    lastCheckedAt: "2026-05-10",
    sourceVerifiedAt: "2026-05-10",
    status: "approved",
  },
  {
    id: "event-source-base-camp-edogawabashi",
    platform: "web",
    handle: "base-camp-edogawabashi",
    displayName: "BASE CAMP TOKYO 江戸川橋 公式サイト",
    sourceUrl: "https://b-camp.jp/edogawabashi/",
    sourceType: "official_site",
    relationshipSourceHandle: "comp_bible",
    discoverySource: "manual_crosscheck",
    discoveryNote: "ルートセット/工事/エリア制限情報の確認元。",
    ingestionPolicy: "summary_with_link",
    lastCheckedAt: "2026-05-10",
    sourceVerifiedAt: "2026-05-10",
    status: "approved",
  },
  {
    id: "event-source-climbers-bloc-2026",
    platform: "web",
    handle: "climbers-bloc-2026",
    displayName: "CLIMBERS BLoC 2026記事",
    sourceUrl: "https://www.climbers-web.jp/news/20260214-1/",
    sourceType: "media_summary",
    relationshipSourceHandle: "comp_bible",
    discoverySource: "manual_crosscheck",
    discoveryNote: "BLoC 2026の初期スケジュール確認元。公式BLoC/開催ジム情報で順次上書きする。",
    ingestionPolicy: "summary_with_link",
    lastCheckedAt: "2026-05-10",
    sourceVerifiedAt: null,
    status: "candidate",
  },
];

export const announcementFixtures: AnnouncementSummary[] = [
  {
    id: "beta-guideline",
    title: "ベータ利用ガイドを公開",
    body: "ZacのMVPベータ利用時の基本ルールと安全方針を公開しました。",
    audience: "all",
    status: "published",
    publishedAt: "2026-04-28 09:00",
  },
  {
    id: "event-policy",
    title: "イベント掲載ポリシー確認",
    body: "ジムイベント掲載時の確認項目を運営向けに整理しています。",
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

export function findEventSourceFixture(eventSourceId: string) {
  return eventSourceFixtures.find((source) => source.id === eventSourceId);
}

export function findAnnouncementFixture(announcementId: string) {
  return announcementFixtures.find((announcement) => announcement.id === announcementId);
}

export const feedFixtures = [
  ...planFixtures.map((plan) => ({ type: "session_plan" as const, item: plan })),
  ...logFixtures.slice(0, 1).map((log) => ({ type: "climbing_log" as const, item: log })),
  ...postFixtures.map((post) => ({ type: "post" as const, item: post })),
];
