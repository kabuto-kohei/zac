"use client";

import { useMemo, useState } from "react";
import { EventCard, GymCard } from "./cards";
import type { GymSummary, HomeViewData } from "./data";

const disciplineFilters = [
  { label: "すべて", value: "all" },
  { label: "ボルダー", value: "boulder" },
  { label: "リード", value: "lead" },
] as const;

type DisciplineFilter = (typeof disciplineFilters)[number]["value"];

export function ExplorePanel({ data }: { data: HomeViewData }) {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<DisciplineFilter>("all");

  const normalizedQuery = query.trim().toLowerCase();
  const queryMatchedGyms = useMemo(() => {
    return data.gyms.filter((gym) => {
      return (
        normalizedQuery.length === 0 ||
        [gym.name, gym.area, gym.address, gym.disciplines].some((value) => value.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [data.gyms, normalizedQuery]);

  const filterCounts = useMemo(() => {
    return {
      all: queryMatchedGyms.length,
      boulder: queryMatchedGyms.filter((gym) => matchesDiscipline(gym, "boulder")).length,
      lead: queryMatchedGyms.filter((gym) => matchesDiscipline(gym, "lead")).length,
    } satisfies Record<DisciplineFilter, number>;
  }, [queryMatchedGyms]);

  const filteredGyms = useMemo(() => {
    return [...queryMatchedGyms.filter((gym) => matchesDiscipline(gym, discipline))].sort((a, b) =>
      a.name.localeCompare(b.name, "ja", { sensitivity: "base", numeric: true }),
    );
  }, [discipline, queryMatchedGyms]);

  const filteredEvents = useMemo(() => {
    return data.events.filter((event) => {
      if (normalizedQuery.length === 0) {
        return true;
      }

      return [event.title, event.description, event.gymName, event.capacity].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [data.events, normalizedQuery]);

  return (
    <section className="stack">
      <section className="search-panel" aria-label="ジム・イベント検索">
        <label className="search-box">
          <span>キーワード</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="検索"
            type="search"
            value={query}
          />
        </label>
        <div className="filter-chips" aria-label="種目">
          {disciplineFilters.map((item) => (
            <button
              aria-label={`${item.label} ${filterCounts[item.value]}件`}
              aria-pressed={discipline === item.value}
              className={discipline === item.value ? "filter-chip is-active" : "filter-chip"}
              key={item.value}
              onClick={() => setDiscipline(item.value)}
              type="button"
            >
              <span>{item.label}</span>
              <small>{filterCounts[item.value]}件</small>
            </button>
          ))}
        </div>
      </section>

      <div className="section-title">
        <div>
          <h2>ジム</h2>
        </div>
        <span>{filteredGyms.length}件</span>
      </div>
      {filteredGyms.length > 0 ? (
        filteredGyms.map((gym) => <GymCard gym={gym} key={gym.id} />)
      ) : (
        <NoResult title="ジムが見つかりません" />
      )}

      <div className="section-title">
        <div>
          <h2>イベント</h2>
        </div>
        <span>{filteredEvents.length}件</span>
      </div>
      {filteredEvents.length > 0 ? (
        filteredEvents.map((event) => <EventCard event={event} key={event.id} />)
      ) : (
        <NoResult title="イベントが見つかりません" />
      )}
    </section>
  );
}

function matchesDiscipline(gym: GymSummary, discipline: DisciplineFilter) {
  if (discipline === "all") {
    return true;
  }

  const disciplineText = gym.disciplines.toLowerCase();
  if (discipline === "boulder") {
    return disciplineText.includes("ボルダー");
  }

  return disciplineText.includes("リード");
}

function NoResult({ title }: { title: string }) {
  return (
    <div className="empty-state compact-empty">
      <h3>{title}</h3>
    </div>
  );
}
