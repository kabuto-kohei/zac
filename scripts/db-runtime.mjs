import dns from "node:dns/promises";
import { setTimeout as sleep } from "node:timers/promises";

const TRANSIENT_CODES = new Set([
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "57P03",
  "53300",
  "08006",
]);

export async function withDatabaseClient(postgres, databaseUrl, operation, options = {}) {
  const attempts = options.attempts ?? 4;
  const label = options.label ?? "database operation";
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let sql;
    try {
      await waitForDatabaseDns(databaseUrl, { attempts: 3, label });
      sql = postgres(databaseUrl, { max: 1, prepare: false });
      return await operation(sql);
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !isTransientDatabaseError(error)) {
        throw error;
      }

      const delayMs = 500 * attempt * attempt;
      console.warn(`${label} failed with ${error.code ?? error.name}; retrying in ${delayMs}ms (${attempt}/${attempts})`);
      await sleep(delayMs);
    } finally {
      if (sql) {
        await sql.end({ timeout: 5 }).catch(() => undefined);
      }
    }
  }

  throw lastError;
}

export function formatDatabaseError(error) {
  return {
    databaseReachable: false,
    code: error.code ?? error.name,
    message: String(error.message ?? "").slice(0, 160),
  };
}

export async function waitForDatabaseDns(databaseUrl, options = {}) {
  const attempts = options.attempts ?? 3;
  const label = options.label ?? "database dns";
  const hostname = getDatabaseHostname(databaseUrl);
  if (!hostname) {
    return;
  }

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await dns.lookup(hostname);
      return;
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !isTransientDatabaseError(error)) {
        throw error;
      }

      const delayMs = 300 * attempt * attempt;
      console.warn(`${label} DNS lookup failed with ${error.code ?? error.name}; retrying in ${delayMs}ms (${attempt}/${attempts})`);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

function getDatabaseHostname(databaseUrl) {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return "";
  }
}

function isTransientDatabaseError(error) {
  if (TRANSIENT_CODES.has(error.code ?? error.name)) {
    return true;
  }

  return /EMAXCONNSESSION|max clients reached|pool_size/u.test(String(error.message ?? ""));
}
