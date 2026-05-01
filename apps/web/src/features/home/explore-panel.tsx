"use client";

import { useMemo, useState } from "react";
import { EventCard, GymCard } from "./cards";
import type { HomeViewData } from "./data";

const disciplineFilters = ["すべて", "ボルダー", "リード"] as const;

export function ExplorePanel({ data }: { data: HomeViewData }) {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<(typeof disciplineFilters)[number]>("すべて");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredGyms = useMemo(() => {
    return data.gyms.filter((gym) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [gym.name, gym.area, gym.address, gym.disciplines].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesDiscipline = discipline === "すべて" || gym.disciplines.includes(discipline);
      return matchesQuery && matchesDiscipline;
    });
  }, [data.gyms, discipline, normalizedQuery]);

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
      <section className="explore-hero" aria-label="検索">
        <div>
          <p className="card-kind">Explore</p>
          <h2>ジムとイベントを探す</h2>
          <p>エリア、ジム名、種目、イベント名で公開情報を横断できます。</p>
        </div>
        <div className="explore-counts" aria-label="検索結果">
          <span>
            イベント <strong>{filteredEvents.length}</strong>
          </span>
          <span>
            ジム <strong>{filteredGyms.length}</strong>
          </span>
        </div>
      </section>

      <section className="search-panel" aria-label="ジム・イベント検索">
        <label className="search-box">
          <span>キーワード</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="秋葉原、B-PUMP、ボルダー"
            type="search"
            value={query}
          />
        </label>
        <div className="filter-chips" aria-label="種目">
          {disciplineFilters.map((item) => (
            <button
              aria-pressed={discipline === item}
              className={discipline === item ? "filter-chip is-active" : "filter-chip"}
              key={item}
              onClick={() => setDiscipline(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="section-title">
        <div>
          <p className="section-kicker">Events</p>
          <h2>イベント</h2>
        </div>
        <span>{filteredEvents.length}件</span>
      </div>
      {filteredEvents.length > 0 ? (
        filteredEvents.map((event) => <EventCard event={event} key={event.id} />)
      ) : (
        <NoResult title="イベントが見つかりません" />
      )}

      <div className="section-title">
        <div>
          <p className="section-kicker">Gyms</p>
          <h2>ジム</h2>
        </div>
        <span>{filteredGyms.length}件</span>
      </div>
      {filteredGyms.length > 0 ? (
        filteredGyms.map((gym) => <GymCard gym={gym} key={gym.id} />)
      ) : (
        <NoResult title="ジムが見つかりません" />
      )}
    </section>
  );
}

function NoResult({ title }: { title: string }) {
  return (
    <div className="empty-state compact-empty">
      <h3>{title}</h3>
      <p>検索語を短くするか、種目フィルタを「すべて」に戻してください。</p>
    </div>
  );
}
