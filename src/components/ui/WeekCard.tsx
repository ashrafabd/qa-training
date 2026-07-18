import { Link } from "react-router-dom";

export function WeekCard({ week, t, doneCount, weekWord, doneShort, milestoneLabel }) {
  const total = week.days.length;
  return (
    <Link className="week-card" to={`/week/${week.num}`}>
      <div className="wc-top">
        <span className={`wk-pill phase-dot-${week.phase}`}>{weekWord} {week.num}</span>
        <span className="small muted">{doneCount}/{total} {doneShort}</span>
      </div>
      <h3>{t(week.title)}</h3>
      <p className="muted small">{t(week.theme)}</p>
      {week.istqb ? <p className="istqb-tag">{t(week.istqb)}</p> : null}
      <div className="ms-mini">
        <strong>{milestoneLabel}: </strong>
        {t(week.milestone.title)}
      </div>
    </Link>
  );
}
