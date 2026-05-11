import { and, asc, eq, eventSaves, events, gyms, isNull } from "@zac/db";
import { eventFixtures, findEventFixture, type EventSummary, type UpsertAdminEventInput } from "@zac/shared";
import type { RequestActor } from "../auth.js";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";
import { isUuid } from "./ids.js";

const savedEventIds = new Set<string>();
const memoryEvents = new Map<string, EventSummary>();

export async function listEvents(options: { includeDrafts?: boolean } = {}) {
  const rows = await listPersistentEvents(options.includeDrafts ?? false);
  const memoryRows = [...memoryEvents.values()].filter((event) => options.includeDrafts || event.status !== "draft");
  if (!isRuntimeFallbackAllowed()) {
    return rows;
  }
  return rows.length > 0 ? rows : [...memoryRows, ...eventFixtures.filter((event) => options.includeDrafts || event.status !== "draft")];
}

export async function getEvent(eventId: string) {
  const memoryEvent = memoryEvents.get(eventId);

  if (memoryEvent && memoryEvent.status !== "draft") {
    return memoryEvent;
  }

  if (isUuid(eventId)) {
    const row = await getPersistentEvent(eventId);

    if (row) {
      return row;
    }
  }

  if (!isRuntimeFallbackAllowed()) {
    return undefined;
  }

  const fixture = findEventFixture(eventId);
  return fixture && fixture.status !== "draft" ? fixture : undefined;
}

export async function createEvent(input: UpsertAdminEventInput, actor: RequestActor) {
  const db = getDatabase();

  if (!db) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Database is required for events.", 503);
    }
    const event = toMemoryEvent(`event-local-${memoryEvents.size + 1}`, input);
    memoryEvents.set(event.id, event);
    return event;
  }

  const [row] = await db
    .insert(events)
    .values({
      title: input.title,
      gymId: input.gymId ?? null,
      description: input.description ?? null,
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      status: input.status,
      createdBy: actor.userId,
    })
    .returning({
      id: events.id,
      category: events.category,
      title: events.title,
      summary: events.summary,
      description: events.description,
      gymId: events.gymId,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      capacityText: events.capacityText,
      sourceUrl: events.sourceUrl,
      sourceAccount: events.sourceAccount,
      sourceQuote: events.sourceQuote,
      status: events.status,
    });

  if (!row) {
    throw new ApiError("service_unavailable", "Could not create event.", 503);
  }

  return toEventSummary(row);
}

export async function updateEvent(eventId: string, input: UpsertAdminEventInput) {
  const db = getDatabase();

  if (!db || !isUuid(eventId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("not_found", "Event not found.", 404);
    }
    const event = toMemoryEvent(eventId, input);
    memoryEvents.set(event.id, event);
    return event;
  }

  const [row] = await db
    .update(events)
    .set({
      title: input.title,
      gymId: input.gymId ?? null,
      description: input.description ?? null,
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId))
    .returning({
      id: events.id,
      category: events.category,
      title: events.title,
      summary: events.summary,
      description: events.description,
      gymId: events.gymId,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      capacityText: events.capacityText,
      sourceUrl: events.sourceUrl,
      sourceAccount: events.sourceAccount,
      sourceQuote: events.sourceQuote,
      status: events.status,
    });

  if (!row) {
    throw new ApiError("not_found", "Event not found.", 404);
  }

  return toEventSummary(row);
}

export async function saveEvent(eventId: string, actorId?: string) {
  const persisted = await setPersistentEventSave(eventId, actorId, true);

  if (!persisted) {
    savedEventIds.add(eventId);
  }

  return { eventId, saved: true };
}

async function listPersistentEvents(includeDrafts: boolean) {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db
      .select({
        id: events.id,
        category: events.category,
        title: events.title,
        summary: events.summary,
        description: events.description,
        gymId: events.gymId,
        startsAt: events.startsAt,
        endsAt: events.endsAt,
        capacityText: events.capacityText,
        sourceUrl: events.sourceUrl,
        sourceAccount: events.sourceAccount,
        sourceQuote: events.sourceQuote,
        status: events.status,
      })
      .from(events)
      .where(isNull(events.deletedAt))
      .orderBy(asc(events.startsAt))
      .limit(50);
    return Promise.all(rows.filter((row) => includeDrafts || row.status !== "draft").map(toEventSummary));
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list events.", 503);
    }
    return [];
  }
}

async function getPersistentEvent(eventId: string) {
  const db = getDatabase();

  if (!db) {
    return null;
  }

  try {
    const [row] = await db
      .select({
        id: events.id,
        category: events.category,
        title: events.title,
        summary: events.summary,
        description: events.description,
        gymId: events.gymId,
        startsAt: events.startsAt,
        endsAt: events.endsAt,
        capacityText: events.capacityText,
        sourceUrl: events.sourceUrl,
        sourceAccount: events.sourceAccount,
        sourceQuote: events.sourceQuote,
        status: events.status,
        deletedAt: events.deletedAt,
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    return row && !row.deletedAt ? toEventSummary(row) : null;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not load event.", 503);
    }
    return null;
  }
}

async function toEventSummary(row: {
  id: string;
  category: string;
  title: string;
  summary: string | null;
  description: string | null;
  gymId: string | null;
  startsAt: Date;
  endsAt: Date | null;
  capacityText: string | null;
  sourceUrl: string | null;
  sourceAccount: string | null;
  sourceQuote: string | null;
  status: string;
}) {
  return {
    id: row.id,
    category: parseEventCategory(row.category),
    title: row.title,
    summary: row.summary ?? row.description ?? "",
    description: row.description ?? "",
    gymName: await getGymName(row.gymId),
    startsAt: formatDateTime(row.startsAt),
    endsAt: row.endsAt ? formatDateTime(row.endsAt) : "",
    capacity: row.capacityText ?? "定員未設定",
    sourceUrl: row.sourceUrl ?? "",
    sourceLabel: row.sourceAccount ?? "公式情報",
    ...(row.sourceQuote ? { sourceQuote: row.sourceQuote } : {}),
    status: parseEventStatus(row.status),
  } satisfies EventSummary;
}

function toMemoryEvent(eventId: string, input: UpsertAdminEventInput) {
  return {
    id: eventId,
    category: "event",
    title: input.title,
    summary: input.description ?? "",
    description: input.description ?? "",
    gymName: "Zac",
    startsAt: formatDateTime(new Date(input.startsAt)),
    endsAt: input.endsAt ? formatDateTime(new Date(input.endsAt)) : "",
    capacity: "定員未設定",
    sourceUrl: "",
    sourceLabel: "管理画面",
    status: input.status,
  } satisfies EventSummary;
}

function parseEventCategory(category: string): EventSummary["category"] {
  if (
    category === "lesson" ||
    category === "competition" ||
    category === "route_set" ||
    category === "opening_change" ||
    category === "private_booking" ||
    category === "construction" ||
    category === "notice" ||
    category === "recruit"
  ) {
    return category;
  }

  return "event";
}

function parseEventStatus(status: string): EventSummary["status"] {
  if (status === "draft" || status === "closed") {
    return status;
  }

  return "scheduled";
}

async function getGymName(gymId: string | null) {
  const db = getDatabase();

  if (!db || !gymId) {
    return "Zac";
  }

  try {
    const [row] = await db.select({ name: gyms.name }).from(gyms).where(eq(gyms.id, gymId)).limit(1);
    return row?.name ?? "Zac";
  } catch {
    return "Zac";
  }
}

function formatDateTime(value: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}`;
}

export async function unsaveEvent(eventId: string, actorId?: string) {
  const persisted = await setPersistentEventSave(eventId, actorId, false);

  if (!persisted) {
    savedEventIds.delete(eventId);
  }

  return { eventId, saved: false };
}

async function setPersistentEventSave(eventId: string, actorId: string | undefined, saved: boolean) {
  const db = getDatabase();

  if (!db || !actorId || !isUuid(eventId)) {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("not_found", "Event not found.", 404);
    }
    return false;
  }

  try {
    if (saved) {
      await db.insert(eventSaves).values({ eventId, userId: actorId }).onConflictDoNothing();
    } else {
      await db.delete(eventSaves).where(and(eq(eventSaves.eventId, eventId), eq(eventSaves.userId, actorId)));
    }
    return true;
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not update event save.", 503);
    }
    return false;
  }
}
