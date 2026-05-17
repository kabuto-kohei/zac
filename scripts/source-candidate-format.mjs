const categoryTemplates = {
  competition: {
    label: "コンペ",
    titleSuffix: "コンペ",
    summaryNoun: "コンペ・大会",
    capacityText: "公式情報で確認",
    reviewFocus: "開催日、対象店舗、参加条件、申込要否",
  },
  route_set: {
    label: "セット",
    titleSuffix: "セット",
    summaryNoun: "セット・ホールド替え",
    capacityText: "公式情報で確認",
    reviewFocus: "対象エリア、作業期間、利用制限",
  },
  opening_change: {
    label: "営業変更",
    titleSuffix: "営業変更",
    summaryNoun: "営業時間・休業変更",
    capacityText: "公式情報で確認",
    reviewFocus: "変更日、営業時間、休業/短縮営業の範囲",
  },
  private_booking: {
    label: "貸切",
    titleSuffix: "貸切",
    summaryNoun: "貸切・利用制限",
    capacityText: "公式情報で確認",
    reviewFocus: "貸切日時、一般利用への影響",
  },
  construction: {
    label: "工事",
    titleSuffix: "工事・メンテナンス",
    summaryNoun: "工事・メンテナンス",
    capacityText: "公式情報で確認",
    reviewFocus: "工事期間、対象エリア、営業影響",
  },
  event: {
    label: "イベント",
    titleSuffix: "イベント",
    summaryNoun: "イベント",
    capacityText: "公式情報で確認",
    reviewFocus: "開催日、内容、参加条件",
  },
};

export const sourceCandidateCategoryShapes = Object.freeze(
  Object.fromEntries(
    Object.entries(categoryTemplates).map(([category, template]) => [
      category,
      {
        label: template.label,
        titleSuffix: template.titleSuffix,
        summaryNoun: template.summaryNoun,
        requiredReviewFocus: template.reviewFocus,
      },
    ]),
  ),
);

export function normalizeObservationCategory(value) {
  if (value === "lesson") return "event";
  return categoryTemplates[value] ? value : null;
}

export function categoryLabel(category) {
  const normalized = normalizeObservationCategory(category);
  return normalized ? categoryTemplates[normalized].label : "イベント";
}

export function formatSourceCandidate(input) {
  const category = normalizeObservationCategory(input.category) ?? "event";
  const template = categoryTemplates[category];
  const sourceName = normalizeWhitespace(input.sourceName || "公式情報");
  const titleCore = selectTitleCore(input.rawTitle, input.sourceName);
  const startsAt = asDate(input.startsAt);
  const dateText = startsAt ? formatJstDate(startsAt) : "";
  const title = truncate(`${sourceName} ${titleCore || `${dateText} ${template.titleSuffix}`}`.trim(), 100);
  const sourceTypeLabel = input.sourceType === "official_site" ? "公式サイト" : "公式Instagram";
  const sourceAttribution = sourceName.includes(sourceTypeLabel) ? `${sourceName}から` : `${sourceName}の${sourceTypeLabel}から`;
  const dateSentence = startsAt ? `日付候補は${dateText}。` : "日付候補は未確定。";
  const quote = truncate(normalizeWhitespace(input.sourceQuote ?? ""), 120);
  const quoteSentence = quote ? `根拠抜粋: ${quote}` : "根拠抜粋は未取得。";
  const summary = `${sourceAttribution}${template.summaryNoun}候補を検出。${dateSentence}Adminで${template.reviewFocus}を確認してください。`;
  const decisionNote = `${sourceTypeLabel}由来の${template.label}候補。${dateSentence}${quoteSentence}`;

  return {
    category,
    title,
    summary,
    description: `${summary} ${decisionNote}`,
    capacityText: template.capacityText,
    sourceQuote: quote,
    decisionNote,
    extractionConfidence: normalizeConfidence(input.extractionConfidence, startsAt),
  };
}

function selectTitleCore(rawTitle, sourceName) {
  const normalized = normalizeWhitespace(rawTitle ?? "")
    .replace(/^【|】$/gu, "")
    .replace(/^《|》$/gu, "")
    .replace(/^「|」$/gu, "")
    .trim();
  if (!normalized) return "";

  const withoutSource = normalizeWhitespace(normalized.replace(normalizeWhitespace(sourceName ?? ""), ""));
  const compact = withoutSource.replace(/[・.。！？!?【】「」『』（）()\s\d年月日\-_/〜~:：,.、]/gu, "");
  if (compact.length < 3) return "";

  return withoutSource;
}

function normalizeConfidence(value, startsAt) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0 && numeric <= 1) {
    return numeric.toFixed(2);
  }
  return startsAt ? "0.70" : "0.55";
}

function asDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatJstDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function truncate(value, max) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
