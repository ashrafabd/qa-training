import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useScrollTop } from "../hooks/useScrollTop";
import { fmt, fmtTime } from "../utils/i18n";
import { Breadcrumb } from "../components/common/Breadcrumb";

function detectLang(text: string) {
  const hasAr = /[\u0600-\u06FF]/.test(text);
  const hasEn = /[A-Za-z]/.test(text);
  if (hasAr && hasEn) return "both";
  if (hasAr) return "ar";
  if (hasEn) return "en";
  return "both";
}

function parseDurationHours(timeText: string) {
  const match = String(timeText).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

export function SearchPage({ curriculum }) {
  const { q } = useParams();
  const query = decodeURIComponent(q || "");
  const { WEEKS, UI } = curriculum;
  const { t, tx, lang } = useAppContext();
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");

  useScrollTop([q]);

  const hits = useMemo(() => {
    const needle = query.toLowerCase();
    const result = [];

    WEEKS.forEach((week) => {
      week.days.forEach((day) => {
        const parts = [day.title, day.exercise, day.deliverable, day.prereq, ...day.objectives, ...day.topics, ...day.resources, week.title, week.theme];

        const haystack = parts
          .map((entry) => {
            if (typeof entry === "string") return entry;
            if (entry && (entry.en || entry.ar)) return `${entry.en || ""} ${entry.ar || ""}`;
            return "";
          })
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(needle)) return;

        const dominantLang = detectLang(haystack);
        const duration = parseDurationHours(day.time);

        if (phaseFilter !== "all" && String(week.phase) !== phaseFilter) return;
        if (langFilter !== "all" && dominantLang !== langFilter) return;
        if (durationFilter === "short" && duration >= 3) return;
        if (durationFilter === "medium" && (duration < 3 || duration > 5)) return;
        if (durationFilter === "long" && duration <= 5) return;

        result.push({ week, day });
      });
    });

    return result;
  }, [WEEKS, query, phaseFilter, langFilter, durationFilter]);

  return (
    <>
      <Breadcrumb
        parts={[
          { label: t(UI.nav_overview), to: "/" },
          { label: `${t(UI.search_results)}: "${query}"` }
        ]}
      />

      <section className="page-header">
        <h1>{t(UI.search_results)}</h1>
        <p className="lead">{fmt(t(UI.search_matching), { n: hits.length, q: query })}</p>
      </section>

      <section className="card">
        <h3>{tx("search.filters")}</h3>
        <div className="search-filter-grid">
          <label>
            {tx("search.filter_phase")}
            <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}>
              <option value="all">{tx("search.any")}</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </label>
          <label>
            {tx("search.filter_language")}
            <select value={langFilter} onChange={(event) => setLangFilter(event.target.value)}>
              <option value="all">{tx("search.any")}</option>
              <option value="en">{tx("search.lang_en")}</option>
              <option value="ar">{tx("search.lang_ar")}</option>
              <option value="both">{tx("search.lang_both")}</option>
            </select>
          </label>
          <label>
            {tx("search.filter_duration")}
            <select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)}>
              <option value="all">{tx("search.any")}</option>
              <option value="short">{tx("search.duration_short")}</option>
              <option value="medium">{tx("search.duration_medium")}</option>
              <option value="long">{tx("search.duration_long")}</option>
            </select>
          </label>
        </div>
      </section>

      {!hits.length ? (
        <p className="muted">{t(UI.search_none)}</p>
      ) : (
        <div className="search-list">
          {hits.map((hit, index) => (
            <Link className="search-hit" to={`/week/${hit.week.num}`} key={`${hit.week.num}-${hit.day.dayNum}-${index}`}>
              <span className={`wk-pill phase-dot-${hit.week.phase}`}>{tx("search.week_day", { week: hit.week.num, day: hit.day.dayNum })}</span>
              <div>
                <strong>{t(hit.day.title)}</strong>
                <div className="muted small">
                  {t(hit.week.title)} — {fmtTime(hit.day.time, lang)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
