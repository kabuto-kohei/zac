import {
  findEventFixture,
  findGymFixture,
  findLogFixture,
  findPlanFixture,
  findPostFixture,
  eventFixtures,
  gymFixtures,
  logFixtures,
  planFixtures,
  postFixtures,
  type EventSummary,
  type GymSummary,
  type LogSummary,
  type PlanSummary,
  type PostSummary,
} from "@zac/shared";
import type { Tab } from "./app-shell";

export type { EventSummary, GymSummary, LogSummary, PlanSummary, PostSummary };

export type HomeFeedItem =
  | { type: "session_plan"; item: PlanSummary }
  | { type: "climbing_log"; item: LogSummary }
  | { type: "post"; item: PostSummary };

export type HomeViewData = {
  activeTab: Tab;
  events: EventSummary[];
  gyms: GymSummary[];
  plans: PlanSummary[];
  logs: LogSummary[];
  posts: PostSummary[];
  feed: HomeFeedItem[];
  metrics: {
    weeklyPlans: number;
    savedGyms: number;
    logs: number;
  };
};

type DataResponse<T> = {
  data: T;
};

export type GymOption = {
  id: string;
  name: string;
};

export async function getHomeViewData(activeTab: Tab): Promise<HomeViewData> {
  const [events, gyms] = await Promise.all([
    getApiList<EventSummary>("/v1/events", eventFixtures),
    getApiList<GymSummary>("/v1/gyms", gymFixtures),
  ]);

  return {
    activeTab,
    events,
    gyms,
    plans: [],
    logs: [],
    posts: [],
    feed: [],
    metrics: {
      weeklyPlans: 0,
      savedGyms: gyms.filter((gym) => gym.saved).length,
      logs: 0,
    },
  };
}

export async function getGymDetailData(gymId: string) {
  const gym = await getApiData<GymSummary>(`/v1/gyms/${encodeURIComponent(gymId)}`, findGymFixture(gymId) ?? null);

  return {
    gym,
  };
}

export async function getEventDetailData(eventId: string) {
  return getApiData<EventSummary>(`/v1/events/${encodeURIComponent(eventId)}`, findEventFixture(eventId) ?? null);
}

export async function getPlanDetailData(planId: string) {
  return getApiData<PlanSummary>(`/v1/session-plans/${encodeURIComponent(planId)}`, findPlanFixture(planId) ?? null);
}

export async function getLogDetailData(logId: string) {
  return getApiData<LogSummary>(`/v1/logs/${encodeURIComponent(logId)}`, findLogFixture(logId) ?? null);
}

export async function getPostDetailData(postId: string) {
  return getApiData<PostSummary>(`/v1/posts/${encodeURIComponent(postId)}`, findPostFixture(postId) ?? null);
}

export async function getGymOptions(): Promise<GymOption[]> {
  const gyms = await getApiList<GymSummary>("/v1/gyms", gymFixtures);

  return gyms.map((gym) => ({
    id: gym.id,
    name: gym.name,
  }));
}

async function getApiList<T>(path: string, fallback: T[]): Promise<T[]> {
  const response = await getApiJson<DataResponse<T[]>>(path);
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return isLiveApiMode() ? [] : fallback;
}

async function getApiData<T>(path: string, fallback: T | null): Promise<T | null> {
  const response = await getApiJson<DataResponse<T>>(path);
  return response?.data ?? (isLiveApiMode() ? null : fallback);
}

async function getApiJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getApiBaseUrl() {
  return process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
}

function isLiveApiMode() {
  return process.env.APP_ENV === "production" || process.env.NEXT_PUBLIC_APP_ENV === "production";
}
