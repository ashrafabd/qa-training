import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useScrollTop } from "../hooks/useScrollTop";
import { useAppContext } from "../context/AppContext";
import { Breadcrumb } from "../components/common/Breadcrumb";

function Checklist({ items }) {
  return (
    <ul className="checklist">
      {items.map((item, index) => (
        <li key={`ass-r-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export function AssessmentsPage({ curriculum }) {
  const { ASSESSMENTS, UI, WEEKS } = curriculum;
  const { t, tx } = useAppContext();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(12 * 60);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useScrollTop([]);

  const quiz = useMemo(() => {
    return WEEKS.slice(0, 5).map((week, index) => {
      const correct = index % 4;
      return {
        id: index,
        question: t(week.milestone.title),
        options: [
          t(week.milestone.type),
          t(week.title),
          t(week.theme),
          t(week.milestone.pass)
        ],
        correct
      };
    });
  }, [WEEKS, t]);

  useEffect(() => {
    if (!started || submitted) return;
    if (secondsLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, started, submitted]);

  const score = useMemo(() => {
    const correctCount = quiz.reduce((acc, item) => (answers[item.id] === item.correct ? acc + 1 : acc), 0);
    return Math.round((correctCount / Math.max(1, quiz.length)) * 100);
  }, [answers, quiz]);

  function formatCountdown(value: number) {
    const min = Math.floor(value / 60).toString().padStart(2, "0");
    const sec = Math.floor(value % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  }

  function resetQuiz() {
    setStarted(false);
    setSubmitted(false);
    setSecondsLeft(12 * 60);
    setAnswers({});
  }

  return (
    <>
      <Breadcrumb
        parts={[
          { label: t(UI.nav_overview), to: "/" },
          { label: t(UI.nav_assessments) }
        ]}
      />

      <section className="page-header">
        <h1>{t(UI.nav_assessments)}</h1>
        <p className="lead">{t(ASSESSMENTS.cadence)}</p>
      </section>

      <section className="card">
        <h3>{t(UI.grading_title)}</h3>
        <p className="muted">{t(ASSESSMENTS.grading)}</p>
        <h4>{t(UI.rubric_title)}</h4>
        <Checklist items={t(ASSESSMENTS.rubricDimensions)} />
      </section>

      <section>
        <h2 className="section-title">{t(UI.ms_schedule)}</h2>
        <div className="card table-wrap">
          <table className="week-table">
            <thead>
              <tr>
                <th>{t(UI.col_wk)}</th>
                <th>{t(UI.col_milestone)}</th>
                <th>{t(UI.col_type)}</th>
                <th>{t(UI.col_pass)}</th>
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((week) => (
                <tr className="row-link" key={week.num} onClick={() => navigate(`/week/${week.num}`)}>
                  <td>
                    <span className={`wk-pill phase-dot-${week.phase}`}>{week.num}</span>
                  </td>
                  <td>
                    <strong>{t(week.milestone.title)}</strong>
                    <div className="muted small">{t(week.milestone.description)}</div>
                  </td>
                  <td>{t(week.milestone.type)}</td>
                  <td>
                    <span className="tag tag-pass">{t(week.milestone.pass)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="action-row">
          <h2>{tx("assess.simulator")}</h2>
          {!started ? <button className="btn" onClick={() => setStarted(true)}>{tx("assess.start")}</button> : null}
          {started && !submitted ? <button className="btn-ghost" onClick={() => setSubmitted(true)}>{tx("assess.submit")}</button> : null}
          {(submitted || !started) ? <button className="btn-ghost" onClick={resetQuiz}>{tx("assess.retake")}</button> : null}
        </div>

        {started ? <p className="muted">{tx("assess.time_left", { time: formatCountdown(secondsLeft) })}</p> : null}
        {submitted ? <p><strong>{tx("assess.score", { score })}</strong></p> : null}

        {started ? (
          <div className="quiz-list">
            {quiz.map((item, idx) => (
              <article className="card" key={item.id}>
                <p>
                  <strong>{tx("assess.question_of", { current: idx + 1, total: quiz.length })}</strong>
                </p>
                <p>{item.question}</p>
                <div className="quiz-options">
                  {item.options.map((option, optionIdx) => (
                    <label key={`${item.id}-${optionIdx}`}>
                      <input
                        type="radio"
                        name={`question-${item.id}`}
                        checked={answers[item.id] === optionIdx}
                        disabled={submitted}
                        onChange={() => setAnswers((prev) => ({ ...prev, [item.id]: optionIdx }))}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
