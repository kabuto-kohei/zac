import { findLogFixture, logFixtures } from "@zac/shared";

export function listClimbingLogs() {
  return logFixtures;
}

export function getClimbingLog(logId: string) {
  return findLogFixture(logId);
}

