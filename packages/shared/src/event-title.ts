import type { EventSummary } from "./fixtures.js";

type EventTitleInput = Pick<EventSummary, "category" | "gymName" | "startsAt" | "title">;

const genericTitlePatterns = [
  /^▶+$/,
  /^[-ー—―]+$/,
  /^期間イベント$/,
  /^check(?:check)*$/i,
  /^今年のbloc$/i,
  /^information$/i,
  /information$/i,
  /^お知らせ$/,
  /^イベント$/,
  /^営業時間$/,
  /^営業案内$/,
];

export function formatEventDisplayTitle(event: EventTitleInput) {
  const cleanedTitle = cleanEventTitle(event.title);

  if (cleanedTitle && !shouldUseContextualTitle(cleanedTitle, event.category)) {
    return cleanedTitle;
  }

  const dateLabel = formatEventMonthDay(event.startsAt);
  const categoryLabel = getEventTitleCategoryLabel(event.category);
  const parts = [event.gymName, dateLabel, categoryLabel].filter(Boolean);
  return parts.join(" ");
}

function cleanEventTitle(title: string) {
  return title
    .normalize("NFKC")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .replace(/\uFE0F/g, "")
    .replace(/[🙏😭]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isGenericEventTitle(title: string) {
  const symbolStripped = title.replace(/[>＞▶︎▶→←↑↓・\s]/g, "");
  if (symbolStripped.length === 0) {
    return true;
  }

  return genericTitlePatterns.some((pattern) => pattern.test(title));
}

function shouldUseContextualTitle(title: string, category: EventSummary["category"]) {
  if (isGenericEventTitle(title)) {
    return true;
  }

  if (!isOperationalCategory(category)) {
    return title.length > 42;
  }

  return title.length > 34 || /^\d{1,2}[月/]\d{1,2}/.test(title);
}

function isOperationalCategory(category: EventSummary["category"]) {
  return category === "route_set" || category === "opening_change" || category === "construction" || category === "notice" || category === "private_booking";
}

function formatEventMonthDay(startsAt: string) {
  const match = startsAt.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return "";
  }

  return `${Number(match[2])}/${Number(match[3])}`;
}

function getEventTitleCategoryLabel(category: EventSummary["category"]) {
  if (category === "competition") {
    return "コンペ";
  }

  if (category === "route_set") {
    return "セット替え";
  }

  if (category === "opening_change" || category === "construction" || category === "notice") {
    return "営業情報";
  }

  if (category === "private_booking") {
    return "貸切";
  }

  if (category === "lesson") {
    return "レッスン";
  }

  if (category === "recruit") {
    return "募集情報";
  }

  return "イベント";
}
