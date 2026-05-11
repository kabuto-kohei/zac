import { asc, eventSources, isNull } from "@zac/db";
import { eventSourceFixtures, type EventSourceSummary } from "@zac/shared";
import { ApiError } from "../errors.js";
import { getDatabase } from "../integrations/database.js";
import { isRuntimeFallbackAllowed } from "../integrations/env.js";

export async function listEventSources(options: { includeCandidates?: boolean } = {}) {
  const rows = await listPersistentEventSources(options.includeCandidates ?? false);

  if (!isRuntimeFallbackAllowed()) {
    return rows;
  }

  return rows.length > 0
    ? rows
    : eventSourceFixtures.filter((source) => options.includeCandidates || source.status === "approved");
}

async function listPersistentEventSources(includeCandidates: boolean) {
  const db = getDatabase();

  if (!db) {
    return [];
  }

  try {
    const rows = await db
      .select()
      .from(eventSources)
      .where(isNull(eventSources.deletedAt))
      .orderBy(asc(eventSources.platform), asc(eventSources.handle))
      .limit(250);
    return rows.filter((row) => includeCandidates || row.status === "approved").map(toEventSourceSummary);
  } catch {
    if (!isRuntimeFallbackAllowed()) {
      throw new ApiError("service_unavailable", "Could not list event sources.", 503);
    }
    return [];
  }
}

function toEventSourceSummary(row: {
  id: string;
  platform: string;
  handle: string;
  displayName: string | null;
  sourceUrl: string;
  sourceType: string;
  relationshipSourceHandle: string | null;
  discoverySource: string | null;
  discoveryNote: string | null;
  ingestionPolicy: string;
  lastCheckedAt: Date | null;
  sourceVerifiedAt: Date | null;
  status: string;
}) {
  return {
    id: row.id,
    platform: row.platform === "instagram" ? "instagram" : "web",
    handle: row.handle,
    displayName: row.displayName ?? row.handle,
    sourceUrl: row.sourceUrl,
    sourceType: parseSourceType(row.sourceType),
    relationshipSourceHandle: row.relationshipSourceHandle,
    discoverySource: row.discoverySource ?? "",
    discoveryNote: row.discoveryNote ?? "",
    ingestionPolicy: "summary_with_link",
    lastCheckedAt: row.lastCheckedAt ? formatDate(row.lastCheckedAt) : "",
    sourceVerifiedAt: row.sourceVerifiedAt ? formatDate(row.sourceVerifiedAt) : null,
    status: parseSourceStatus(row.status),
  } satisfies EventSourceSummary;
}

function parseSourceType(value: string): EventSourceSummary["sourceType"] {
  if (value === "aggregator_instagram" || value === "official_instagram" || value === "official_site" || value === "media_summary") {
    return value;
  }
  return "official_site";
}

function parseSourceStatus(value: string): EventSourceSummary["status"] {
  if (value === "candidate" || value === "approved" || value === "paused" || value === "rejected") {
    return value;
  }
  return "candidate";
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
