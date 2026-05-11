"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthStatus } from "./auth-state";
import { GymCard, LogCard, PlanCard, PostCard } from "./cards";
import type { HomeFeedItem, HomeViewData } from "./data";
import { MemberActivityState, type MemberActivityLoadState } from "./member-activity-data";
import { ZacIcon } from "./zac-icons";

type FeedFilter = "all" | HomeFeedItem["type"];

const filterLabels: Array<{ value: FeedFilter; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "session_plan", label: "予定" },
  { value: "climbing_log", label: "記録" },
  { value: "post", label: "投稿" },
];

export function FeedExperience({ data, memberState }: { data: HomeViewData; memberState: MemberActivityLoadState }) {
  const { authenticated, checking } = useAuthStatus();

  if (!checking && authenticated) {
    if (memberState.status !== "ready") {
      return <MemberActivityState state={memberState} />;
    }

    return <MemberHomeExperience data={memberState.data} />;
  }

  return <GuestHomeExperience data={data} />;
}

function GuestHomeExperience({ data }: { data: HomeViewData }) {
  const [showGyms, setShowGyms] = useState(false);
  const gyms = useMemo(() => getSortedGyms(data.gyms), [data.gyms]);
  const calendarEvents = getCalendarEvents(data.events);

  return (
    <section className="stack">
      <EventCalendar events={calendarEvents} />
      <div className="section-title">
        <div>
          <h2>ジム</h2>
        </div>
        <span>{data.gyms.length}件</span>
        <button className="ghost-button section-toggle" onClick={() => setShowGyms((current) => !current)} type="button">
          {showGyms ? "閉じる" : "表示"}
        </button>
        <Link className="primary-action" href="/explore">
          探す
        </Link>
      </div>
      {showGyms ? (
        <section className="feed-grid" aria-label="ジム一覧">
          {gyms.map((gym) => (
            <GymCard gym={gym} key={gym.id} />
          ))}
        </section>
      ) : null}
    </section>
  );
}

type CalendarDay = {
  dateKey: string;
  day: number;
  events: HomeViewData["events"];
  displayGroups: CalendarDisplayGroup[];
};

type CalendarDisplayGroup = "event" | "competition" | "route_set" | "opening_change" | "private_booking";

const calendarDisplayGroups: Array<{ key: CalendarDisplayGroup; label: string }> = [
  { key: "event", label: "イベント" },
  { key: "competition", label: "コンペ" },
  { key: "route_set", label: "セット" },
  { key: "opening_change", label: "営業時間変更" },
  { key: "private_booking", label: "貸切" },
];

function EventCalendar({ events }: { events: HomeViewData["events"] }) {
  const initialMonthKey = useMemo(() => getInitialCalendarMonth(events), [events]);
  const [visibleMonth, setVisibleMonth] = useState(initialMonthKey);
  const [activeFilter, setActiveFilter] = useState<CalendarDisplayGroup | null>(null);
  const filteredEvents = useMemo(
    () => (activeFilter ? events.filter((event) => getCalendarDisplayGroup(event) === activeFilter) : events),
    [activeFilter, events],
  );
  const eventDays = useMemo(() => buildEventCalendarDays(filteredEvents, visibleMonth), [filteredEvents, visibleMonth]);
  const visibleMonthEvents = useMemo(() => events.filter((event) => getEventDateKey(event)?.slice(0, 7) === visibleMonth), [events, visibleMonth]);
  const todayKey = getTodayDateKey();
  const firstEventDate =
    eventDays.find((day) => day.events.length > 0 && day.dateKey >= todayKey)?.dateKey ?? eventDays.find((day) => day.events.length > 0)?.dateKey ?? `${visibleMonth}-01`;
  const [selectedDate, setSelectedDate] = useState(firstEventDate);
  const selectedDay = eventDays.find((day) => day.dateKey === selectedDate && day.events.length > 0);
  const firstCalendarDate = eventDays.find((day) => day.day > 0)?.dateKey;
  const monthLabel = firstCalendarDate ? `${firstCalendarDate.slice(0, 4)}年${Number(firstCalendarDate.slice(5, 7))}月` : "イベント";
  const counts = useMemo(() => getCalendarCounts(visibleMonthEvents), [visibleMonthEvents]);

  useEffect(() => {
    setSelectedDate(firstEventDate);
  }, [firstEventDate]);

  return (
    <section className="event-calendar" aria-label="イベントカレンダー">
      <div className="section-title calendar-title">
        <div>
          <h2>イベント</h2>
          <span>{monthLabel}</span>
        </div>
        <div className="calendar-month-actions" aria-label="月を切り替え">
          <button aria-label="前月" onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))} type="button">
            ←
          </button>
          <button aria-label="翌月" onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))} type="button">
            →
          </button>
        </div>
        <div className="calendar-summary" aria-label="カレンダー内訳">
          {calendarDisplayGroups.map((group) => (
            <button
              aria-label={`${group.label}だけ表示`}
              aria-pressed={activeFilter === group.key}
              key={group.key}
              onClick={() => setActiveFilter((current) => (current === group.key ? null : group.key))}
              type="button"
            >
              {group.label} {counts[group.key]}
            </button>
          ))}
        </div>
        <Link className="primary-action" href="/explore">
          探す
        </Link>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {eventDays.map((day) =>
          day.day === 0 ? (
            <span className="calendar-day is-empty" key={day.dateKey} />
          ) : (
            <button
              aria-label={`${day.dateKey}${day.events.length > 0 ? ` ${day.events.map((event) => event.title).join("、")}` : ""}`}
              aria-pressed={selectedDate === day.dateKey}
              className={getCalendarDayClassName(day)}
              key={day.dateKey}
              onClick={() => setSelectedDate(day.dateKey)}
              type="button"
            >
              <span>{day.day}</span>
              {day.events.length > 0 ? (
                <small aria-hidden="true">
                  {day.displayGroups.map((group) => (
                    <i className={`calendar-dot ${group}`} key={group} />
                  ))}
                </small>
              ) : null}
            </button>
          ),
        )}
      </div>
      <div className="calendar-detail" aria-live="polite">
        {selectedDay ? (
          <CalendarEventGroups events={selectedDay.events} />
        ) : (
          <p>イベントなし</p>
        )}
      </div>
    </section>
  );
}

function CalendarEventGroups({ events }: { events: HomeViewData["events"] }) {
  return (
    <>
      {calendarDisplayGroups.map((group) => {
        const groupEvents = events.filter((event) => getCalendarDisplayGroup(event) === group.key);
        return groupEvents.length > 0 ? <CalendarEventGroup events={groupEvents} key={group.key} label={group.label} /> : null;
      })}
    </>
  );
}

function CalendarEventGroup({ events, label }: { events: HomeViewData["events"]; label: string }) {
  return (
    <section className="calendar-event-group" aria-label={label}>
      <h3>{label}</h3>
      {events.map((event) => (
        <Link className="calendar-event" href={`/events/${event.id}`} key={event.id}>
          <span className="calendar-event-meta">
            <i className={getCalendarEventBadgeClassName(event)}>{getCalendarEventLabel(event)}</i>
            <span className="calendar-event-gym">{event.gymName}</span>
          </span>
          <strong>{event.title}</strong>
        </Link>
      ))}
    </section>
  );
}

function getCalendarEvents(events: HomeViewData["events"]) {
  return [...events]
    .filter((event) => event.status === "scheduled")
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

function getInitialCalendarMonth(events: HomeViewData["events"]) {
  const scheduledEvents = getCalendarEvents(events);
  const upcomingEvents = scheduledEvents.filter((event) => {
    const eventTime = Date.parse(event.startsAt.replace(" ", "T"));
    if (Number.isNaN(eventTime)) {
      return true;
    }

    return eventTime >= startOfToday().getTime();
  });
  const targetEvents = upcomingEvents.length > 0 ? upcomingEvents : scheduledEvents;
  const firstDateKey = getEventDateKey(targetEvents[0]);
  return firstDateKey?.slice(0, 7) ?? getCurrentMonthKey().slice(0, 7);
}

function buildEventCalendarDays(events: HomeViewData["events"], monthKey: string): CalendarDay[] {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const leadingEmptyDays = (firstDay + 6) % 7;
  const eventsByDay = new Map<string, HomeViewData["events"]>();

  for (const event of events) {
    const dateKey = getEventDateKey(event);
    if (!dateKey) {
      continue;
    }

    eventsByDay.set(dateKey, [...(eventsByDay.get(dateKey) ?? []), event]);
  }

  const days: CalendarDay[] = Array.from({ length: leadingEmptyDays }, (_, index) => ({
    dateKey: `empty-${index}`,
    day: 0,
    events: [],
    displayGroups: [],
  }));

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = eventsByDay.get(dateKey) ?? [];
    days.push({
      dateKey,
      day,
      events: dayEvents,
      displayGroups: getCalendarDisplayGroups(dayEvents),
    });
  }

  return days;
}

function shiftMonth(monthKey: string, amount: number) {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  const next = new Date(year, month - 1 + amount, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

function getCalendarCounts(events: HomeViewData["events"]) {
  return events.reduce(
    (counts, event) => {
      counts[getCalendarDisplayGroup(event)] += 1;

      return counts;
    },
    {
      event: 0,
      competition: 0,
      route_set: 0,
      opening_change: 0,
      private_booking: 0,
    } satisfies Record<CalendarDisplayGroup, number>,
  );
}

function getCalendarDayClassName(day: CalendarDay) {
  const classes = ["calendar-day"];
  if (day.events.length > 0) {
    classes.push("has-event");
  }
  day.displayGroups.forEach((group) => classes.push(`has-${group}`));

  return classes.join(" ");
}

function getCalendarEventLabel(event: HomeViewData["events"][number]) {
  return calendarDisplayGroups.find((group) => group.key === getCalendarDisplayGroup(event))?.label ?? "イベント";
}

function getCalendarEventBadgeClassName(event: HomeViewData["events"][number]) {
  return `calendar-event-badge ${getCalendarDisplayGroup(event)}`;
}

function getCalendarDisplayGroups(events: HomeViewData["events"]) {
  const groups = new Set(events.map(getCalendarDisplayGroup));
  return calendarDisplayGroups.map((group) => group.key).filter((group) => groups.has(group));
}

function getCalendarDisplayGroup(event: HomeViewData["events"][number]): CalendarDisplayGroup {
  if (event.category === "competition") {
    return "competition";
  }

  if (event.category === "route_set") {
    return "route_set";
  }

  if (event.category === "private_booking") {
    return "private_booking";
  }

  if (event.category === "opening_change" || event.category === "construction" || event.category === "notice") {
    return "opening_change";
  }

  return "event";
}

function getEventDateKey(event: HomeViewData["events"][number] | undefined) {
  return event?.startsAt.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function getTodayDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getSortedGyms(gyms: HomeViewData["gyms"]) {
  return [...gyms].sort((left, right) => left.name.localeCompare(right.name, "en", { numeric: true, sensitivity: "base" }));
}

function MemberHomeExperience({ data }: { data: HomeViewData }) {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const filteredFeed = useMemo(() => {
    if (filter === "all") {
      return data.feed;
    }

    return data.feed.filter((entry) => entry.type === filter);
  }, [data.feed, filter]);

  const nextPlan = data.plans[0];
  const highlightedGym = data.gyms.find((gym) => gym.saved) ?? data.gyms[0];
  const latestLog = data.logs[0];
  const feedCounts = {
    all: data.feed.length,
    session_plan: data.feed.filter((entry) => entry.type === "session_plan").length,
    climbing_log: data.feed.filter((entry) => entry.type === "climbing_log").length,
    post: data.feed.filter((entry) => entry.type === "post").length,
  };

  return (
    <section className="stack">
      <MemberDashboard nextPlan={nextPlan} highlightedGym={highlightedGym} latestLog={latestLog} metrics={data.metrics} />
      <QuickComposer />
      <div className="section-title">
        <div>
          <h2>フィード</h2>
        </div>
        <Link className="primary-action" href="/posts/new">
          投稿
        </Link>
      </div>
      <div className="feed-tabs" aria-label="フィード切り替え">
        {filterLabels.map((item) => (
          <button
            aria-pressed={filter === item.value}
            className={filter === item.value ? "feed-tab is-active" : "feed-tab"}
            key={item.value}
            onClick={() => setFilter(item.value)}
            type="button"
          >
            {item.label}
            <span>{feedCounts[item.value]}</span>
          </button>
        ))}
      </div>
      {filteredFeed.length > 0 ? (
        <div className="feed-grid">
          {filteredFeed.map((entry) => (
            <FeedCard entry={entry} key={`${entry.type}-${entry.item.id}`} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>まだありません</h3>
        </div>
      )}
    </section>
  );
}

function MemberDashboard({
  nextPlan,
  highlightedGym,
  latestLog,
  metrics,
}: {
  nextPlan: HomeViewData["plans"][number] | undefined;
  highlightedGym: HomeViewData["gyms"][number] | undefined;
  latestLog: HomeViewData["logs"][number] | undefined;
  metrics: HomeViewData["metrics"];
}) {
  return (
    <section className="member-dashboard" aria-label="ログイン後ホーム">
      <div className="member-dashboard-copy">
        <p className="card-kind">Home</p>
        <h2>今日</h2>
        <div className="action-row">
          <Link className="primary-action" href="/plans/new">
            予定
          </Link>
          <Link className="ghost-button" href="/logs/new">
            記録
          </Link>
        </div>
      </div>
      <div className="member-dashboard-grid">
        <MemberStat label="今週の予定" value={String(metrics.weeklyPlans)} />
        <MemberStat label="保存ジム" value={String(metrics.savedGyms)} />
        <MemberStat label="記録" value={String(metrics.logs)} />
      </div>
      <div className="member-dashboard-list">
        <MemberLink
          href={nextPlan ? `/plans/${nextPlan.id}` : "/plans"}
          label="次の予定"
          title={nextPlan?.title ?? "未定"}
          meta={nextPlan ? `${nextPlan.place} · ${nextPlan.time}` : "予定なし"}
        />
        <MemberLink
          href={highlightedGym ? `/gyms/${highlightedGym.id}` : "/explore"}
          label="保存ジム"
          title={highlightedGym?.name ?? "ジムを探す"}
          meta={highlightedGym ? `${highlightedGym.area} · ${highlightedGym.disciplines}` : "エリアと種目で探す"}
        />
        <MemberLink
          href={latestLog ? `/logs/${latestLog.id}` : "/logs/new"}
          label="記録"
          title={latestLog?.title ?? "未記録"}
          meta={latestLog ? `${latestLog.place} · ${latestLog.grade}` : "記録なし"}
        />
      </div>
    </section>
  );
}

function MemberStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="member-stat">
      <strong>{value}</strong>
      {label}
    </span>
  );
}

function MemberLink({ href, label, title, meta }: { href: string; label: string; title: string; meta: string }) {
  return (
    <Link className="member-link" href={href}>
      <span>{label}</span>
      <strong>{title}</strong>
      <small>{meta}</small>
    </Link>
  );
}

function QuickComposer() {
  const { authenticated, checking } = useAuthStatus();

  if (!checking && !authenticated) {
    return (
      <section className="composer-card guest-composer" aria-label="ログイン">
        <div className="composer-avatar">
          <ZacIcon decorative icon="logo" size={38} />
        </div>
        <div className="composer-main">
          <p className="composer-input">ログインして保存・参加</p>
          <div className="composer-actions">
            <Link href="/login">ログイン</Link>
            <Link href="/register">新規登録</Link>
            <Link href="/explore">探す</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="composer-card" aria-label="作成">
      <div className="composer-avatar">
        <ZacIcon decorative icon="logo" size={38} />
      </div>
      <div className="composer-main">
        <Link className="composer-input" href="/posts/new">
          いまどう？
        </Link>
        <div className="composer-actions">
          <Link href="/logs/new">
            <ZacIcon decorative icon="climbLog" size={20} />
            記録
          </Link>
          <Link href="/plans/new">
            <ZacIcon decorative icon="sessionPlan" size={20} />
            予定
          </Link>
          <Link href="/posts/new">
            <ZacIcon decorative icon="bouldering" size={20} />
            投稿
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeedCard({ entry }: { entry: HomeFeedItem }) {
  if (entry.type === "session_plan") {
    return <PlanCard plan={entry.item} />;
  }

  if (entry.type === "climbing_log") {
    return <LogCard log={entry.item} />;
  }

  return <PostCard post={entry.item} />;
}
