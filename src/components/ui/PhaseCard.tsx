import { Link } from "react-router-dom";
import { PHASE_ICON } from "../../constants/appConfig";
import { logoNode } from "../common/LogoAsset";
import { ProgressBar } from "./ProgressBar";

export function PhaseCard({ phase, weeks, t, doneForWeek, phaseWord, arrow }) {
  const phaseWeeks = weeks.filter((week) => week.phase === phase.id);
  const totalDays = phaseWeeks.reduce((total, week) => total + week.days.length, 0);
  const doneDays = phaseWeeks.reduce(
    (total, week) => total + week.days.filter((day) => doneForWeek(week.num, day.dayNum)).length,
    0
  );

  return (
    <Link className={`phase-card ${phase.color}`} to={`/phase/${phase.id}`}>
      <div className="phase-card-head">
        <span className="phase-badge">{phaseWord} {phase.id}</span>
        <span className="phase-logo">{logoNode(PHASE_ICON[phase.id], 26)}</span>
      </div>
      <span className="phase-weeks">{t(phase.weeks)}</span>
      <h3>{t(phase.title)}</h3>
      <p className="muted">{t(phase.summary)}</p>
      <div className="mini-bar-wrap">
        <ProgressBar pct={Math.round((doneDays / totalDays) * 100)} mini />
      </div>
      <span className="phase-link">{doneDays}/{totalDays} {arrow}</span>
    </Link>
  );
}
