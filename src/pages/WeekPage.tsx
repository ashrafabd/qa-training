import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { useScrollTop } from "../hooks/useScrollTop";
import { arrow as arrowForLang } from "../utils/i18n";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { DayCard } from "../components/ui/DayCard";

function Checklist({ items }) {
  return (
    <ul className="checklist">
      {items.map((item, index) => (
        <li key={`week-obj-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export function WeekPage({ curriculum }) {
  const { num } = useParams();
  const { WEEKS, PHASES, UI } = curriculum;
  const { t, lang, isDone, toggleDone } = useAppContext();

  const weekNum = Number(num);
  const week = useMemo(() => WEEKS.find((item) => item.num === weekNum), [WEEKS, weekNum]);
  const phase = useMemo(() => PHASES.find((item) => item.id === week?.phase), [PHASES, week]);
  const prevWeek = useMemo(() => WEEKS.find((item) => item.num === weekNum - 1), [WEEKS, weekNum]);
  const nextWeek = useMemo(() => WEEKS.find((item) => item.num === weekNum + 1), [WEEKS, weekNum]);

  useScrollTop([num]);

  if (!week || !phase) return null;

  const arrow = arrowForLang(lang);
  const backArrow = lang === "ar" ? "→" : "←";

  return (
    <>
      <Breadcrumb
        parts={[
          { label: t(UI.nav_overview), to: "/" },
          { label: `${t(UI.phase_word)} ${phase.id}`, to: `/phase/${phase.id}` },
          { label: `${t(UI.week_word)} ${week.num}` }
        ]}
      />

      <section className={`week-header ${phase.color}`}>
        <span className="phase-weeks">{t(UI.phase_word)} {phase.id} · {t(phase.title)}</span>
        <h1>{t(UI.week_word)} {week.num} · {t(week.title)}</h1>
        <p className="lead">{t(week.theme)}</p>
        {week.istqb ? <p className="istqb-tag light">{arrow} {t(week.istqb)}</p> : null}
        <div className="wk-obj">
          <h4>{t(UI.weekly_obj)}</h4>
          <Checklist items={t(week.objectives)} />
        </div>
      </section>

      <section className="milestone-box">
        <div className="ms-flag">{t(UI.ms_flag)}</div>
        <h3>{t(week.milestone.title)}</h3>
        <div className="ms-tags">
          <span className="tag">{t(week.milestone.type)}</span>
          <span className="tag tag-pass">{t(UI.pass_label)}{t(week.milestone.pass)}</span>
        </div>
        <p>{t(week.milestone.description)}</p>
      </section>

      <h2 className="section-title">{t(UI.daily_plan)}</h2>
      {week.days.map((day) => (
        <DayCard
          key={day.dayNum}
          weekNum={week.num}
          day={day}
          t={t}
          lang={lang}
          isDone={isDone}
          toggleDone={toggleDone}
          labels={{
            dayWord: t(UI.day_word),
            doneWord: t(UI.done_word),
            blockPrereq: t(UI.block_prereq),
            blockObj: t(UI.block_obj),
            blockTopics: t(UI.block_topics),
            blockExercise: t(UI.block_exercise),
            blockDeliverable: t(UI.block_deliverable),
            blockResources: t(UI.block_resources),
            dow: t(UI.dow)
          }}
        />
      ))}

      <nav className="week-nav">
        {prevWeek ? (
          <Link className="btn" to={`/week/${prevWeek.num}`}>
            {backArrow} {t(UI.week_word)} {prevWeek.num}: {t(prevWeek.title)}
          </Link>
        ) : (
          <span />
        )}

        {nextWeek ? (
          <Link className="btn" to={`/week/${nextWeek.num}`}>
            {t(UI.week_word)} {nextWeek.num}: {t(nextWeek.title)} {arrow}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </>
  );
}
