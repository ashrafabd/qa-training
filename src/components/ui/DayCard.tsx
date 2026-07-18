import { fmtTime } from "../../utils/i18n";

function List({ items, className, t }) {
  return (
    <ul className={className}>
      {t(items).map((item, index) => (
        <li key={`${className}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function Block({ title, children }) {
  return (
    <div className="day-block">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

export function DayCard({ weekNum, day, t, lang, isDone, toggleDone, labels }) {
  const done = isDone(weekNum, day.dayNum);

  return (
    <section className={`day-card ${done ? "is-done" : ""}`} id={`day-${weekNum}-${day.dayNum}`}>
      <div className="day-head">
        <div className="day-id">
          <span className="day-num">{labels.dayWord} {day.dayNum}</span>
          <span className="day-dow">{labels.dow[day.dayNum - 1] || ""}</span>
        </div>
        <h3>{t(day.title)}</h3>
        <div className="day-head-right">
          <span className="time-chip">⏱ {fmtTime(day.time, lang)}</span>
          <label className="done-toggle">
            <input
              type="checkbox"
              checked={done}
              onChange={() => {
                toggleDone(weekNum, day.dayNum);
              }}
            />
            <span>{labels.doneWord}</span>
          </label>
        </div>
      </div>
      <div className="day-body">
        <Block title={labels.blockPrereq}>
          <p className="prereq">{t(day.prereq)}</p>
        </Block>
        <Block title={labels.blockObj}>
          <List items={day.objectives} className="checklist" t={t} />
        </Block>
        <Block title={labels.blockTopics}>
          <List items={day.topics} className="topics" t={t} />
        </Block>
        <Block title={labels.blockExercise}>
          <p>{t(day.exercise)}</p>
        </Block>
        <Block title={labels.blockDeliverable}>
          <p className="deliverable">📦 {t(day.deliverable)}</p>
        </Block>
        <Block title={labels.blockResources}>
          <List items={day.resources} className="resources" t={t} />
        </Block>
      </div>
    </section>
  );
}
