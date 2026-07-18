import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useScrollTop } from "../hooks/useScrollTop";
import { PHASE_ICON } from "../constants/appConfig";
import { logoNode } from "../components/common/LogoAsset";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { WeekCard } from "../components/ui/WeekCard";

function Checklist({ items }) {
  return (
    <ul className="checklist">
      {items.map((item, index) => (
        <li key={`phase-out-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export function PhasePage({ curriculum }) {
  const { id } = useParams();
  const { PHASES, WEEKS, UI } = curriculum;
  const { t, isDone } = useAppContext();

  const phase = useMemo(() => PHASES.find((item) => item.id === Number(id)), [PHASES, id]);
  const phaseWeeks = useMemo(() => WEEKS.filter((week) => week.phase === Number(id)), [WEEKS, id]);

  useScrollTop([id]);

  if (!phase) return null;

  return (
    <>
      <Breadcrumb
        parts={[
          { label: t(UI.nav_overview), to: "/" },
          { label: `${t(UI.phase_word)} ${phase.id}` }
        ]}
      />

      <section className={`phase-header ${phase.color}`}>
        <span className="phase-header-logo">{logoNode(PHASE_ICON[phase.id], 40)}</span>
        <span className="phase-weeks">{t(phase.weeks)}</span>
        <h1>{t(UI.phase_word)} {phase.id} · {t(phase.title)}</h1>
        <p className="lead">{t(phase.summary)}</p>
        <h4>{t(UI.by_end_phase)}</h4>
        <Checklist items={t(phase.outcomes)} />
      </section>

      <div className="week-cards">
        {phaseWeeks.map((week) => {
          const doneCount = week.days.filter((day) => isDone(week.num, day.dayNum)).length;
          return (
            <WeekCard
              key={week.num}
              week={week}
              t={t}
              doneCount={doneCount}
              weekWord={t(UI.week_word)}
              doneShort={t(UI.done_short)}
              milestoneLabel={t(UI.col_milestone)}
            />
          );
        })}
      </div>
    </>
  );
}
