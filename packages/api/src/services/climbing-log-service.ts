import { findLogFixture, logFixtures, type CreateClimbingLogInput, type LogSummary } from "@zac/shared";

const createdClimbingLogs: LogSummary[] = [];
let createdClimbingLogCount = 0;

export function listClimbingLogs() {
  return [...createdClimbingLogs, ...logFixtures];
}

export function getClimbingLog(logId: string) {
  return createdClimbingLogs.find((log) => log.id === logId) ?? findLogFixture(logId);
}

export function createClimbingLog(input: CreateClimbingLogInput) {
  createdClimbingLogCount += 1;
  const log: LogSummary = {
    id: `local-log-${createdClimbingLogCount}`,
    title: input.summary || `${input.climbedOn}の記録`,
    place: input.placeName ?? "ジム未接続",
    grade: input.gradeText ?? "未設定",
    note: input.note ?? "",
  };

  createdClimbingLogs.unshift(log);
  return log;
}
