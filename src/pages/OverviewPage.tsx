import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { fmt, arrow as arrowForLang } from "../utils/i18n";
import { LogoTile } from "../components/common/LogoAsset";
import { PhaseCard } from "../components/ui/PhaseCard";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useScrollTop } from "../hooks/useScrollTop";

function Checklist({ items }) {
  return (
    <ul className="checklist">
      {items.map((item, index) => (
        <li key={`chk-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export function OverviewPage({ curriculum }) {
  const { META, UI, PHASES, WEEKS, BRANDS, ASSESSMENTS } = curriculum;
  const { t, lang, doneCount, totalDays, progressPct, isDone, resetProgress } = useAppContext();
  const navigate = useNavigate();

  useScrollTop([]);

  const arrow = arrowForLang(lang);

  const weekRows = useMemo(
    () =>
      WEEKS.map((week) => (
        <tr className="row-link" key={week.num} onClick={() => navigate(`/week/${week.num}`)}>
          <td>
            <span className={`wk-pill phase-dot-${week.phase}`}>{week.num}</span>
          </td>
          <td>
            <strong>{t(week.title)}</strong>
            <div className="muted small">{t(week.theme)}</div>
          </td>
          <td>
            <span className="ms-type">{t(week.milestone.type)}</span>
            <div className="small">{t(week.milestone.title)}</div>
          </td>
        </tr>
      )),
    [WEEKS, navigate, t]
  );

  return (
    <>
      <section className="hero">
        <p className="eyebrow">{t(UI.hero_eyebrow)}</p>
        <h1>{t(UI.hero_h1)}</h1>
        <p className="lead">{t(UI.hero_lead)}</p>
        <div className="hero-meta">
          <div className="meta-chip">
            <span className="mc-label">{t(UI.meta_schedule)}</span>
            <span className="mc-val">{t(META.weeklyLoad)}</span>
          </div>
          <div className="meta-chip">
            <span className="mc-label">{t(UI.meta_total)}</span>
            <span className="mc-val">{META.totalHours} {t(UI.hours_word)}</span>
          </div>
          <div className="meta-chip">
            <span className="mc-label">{t(UI.meta_audience)}</span>
            <span className="mc-val">{t(META.audience)}</span>
          </div>
          <div className="meta-chip">
            <span className="mc-label">{t(UI.meta_cost)}</span>
            <span className="mc-val">{t(META.toolsFree)}</span>
          </div>
        </div>
        <div className="stack-row">
          {BRANDS.map((brand) => (
            <LogoTile key={brand.slug} slug={brand.slug} label={brand.name} />
          ))}
        </div>
      </section>

      <section className="card progress-card">
        <div className="progress-head">
          <h2>{t(UI.progress_title)}</h2>
          <button
            className="btn-ghost"
            onClick={() => {
              if (window.confirm(t(UI.reset_confirm))) resetProgress();
            }}
          >
            {t(UI.reset)}
          </button>
        </div>
        <ProgressBar pct={progressPct} />
        <p className="muted">
          {fmt(t(UI.progress_note), { done: doneCount, total: totalDays, pct: progressPct })}
        </p>
      </section>

      <section>
        <h2 className="section-title">{t(UI.four_phases)}</h2>
        <div className="phase-grid">
          {PHASES.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              weeks={WEEKS}
              t={t}
              doneForWeek={isDone}
              phaseWord={t(UI.phase_word)}
              arrow={arrow}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">{t(UI.glance)}</h2>
        <div className="card table-wrap">
          <table className="week-table">
            <thead>
              <tr>
                <th>{t(UI.col_wk)}</th>
                <th>{t(UI.col_focus)}</th>
                <th>{t(UI.col_milestone)}</th>
              </tr>
            </thead>
            <tbody>{weekRows}</tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="section-title">{t(UI.assess_phil)}</h2>
        <div className="card">
          <p>{t(ASSESSMENTS.cadence)}</p>
          <p className="muted">{t(ASSESSMENTS.grading)}</p>
          <h4>{t(UI.rubric_title)}</h4>
          <Checklist items={t(ASSESSMENTS.rubricDimensions)} />
        </div>
      </section>
    </>
  );
}
