import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { useScrollTop } from "../hooks/useScrollTop";
import { fmt, fmtTime } from "../utils/i18n";
import { Breadcrumb } from "../components/common/Breadcrumb";

export function SearchPage({ curriculum }) {
  const { q } = useParams();
  const query = decodeURIComponent(q || "");
  const { WEEKS, UI } = curriculum;
  const { t, tx, lang } = useAppContext();

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

        if (haystack.includes(needle)) {
          result.push({ week, day });
        }
      });
    });

    return result;
  }, [WEEKS, query]);

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
