export const visibilityValues = ["public", "followers", "participants", "private"] as const;

export const sessionPlanStatusValues = [
  "draft",
  "scheduled",
  "active",
  "completed",
  "cancelled",
] as const;

export const joinPolicyValues = ["open", "approval_required", "invite_only", "closed"] as const;

export const participantStatusValues = ["joined", "cancelled", "invited", "declined"] as const;

export const disciplineSeeds = [
  { key: "boulder", name: "ボルダー", sortOrder: 10 },
  { key: "lead", name: "リード", sortOrder: 20 },
  { key: "top_rope", name: "トップロープ", sortOrder: 30 },
  { key: "outdoor", name: "外岩", sortOrder: 40 },
  { key: "training", name: "トレーニング", sortOrder: 50 },
] as const;

export const categorySeeds = [
  { key: "partner", name: "仲間探し", sortOrder: 10 },
  { key: "log", name: "記録", sortOrder: 20 },
  { key: "event", name: "イベント", sortOrder: 30 },
  { key: "competition", name: "コンペ", sortOrder: 40 },
  { key: "gym_discovery", name: "ジム開拓", sortOrder: 50 },
  { key: "training", name: "トレーニング", sortOrder: 60 },
] as const;

