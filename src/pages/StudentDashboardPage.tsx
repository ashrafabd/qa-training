import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { WEEKS } from "../data";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { estimateWeeksRemaining, lessonsPerWeek, nextIncompleteWeek, weakestPhase } from "../services/learningInsights";

type LearningGoal = "beginner" | "job" | "fast";

function goalLabel(tx: (key: any, vars?: Record<string, string | number>) => string, goal: LearningGoal) {
  if (goal === "beginner") return tx("student.goal_beginner");
  if (goal === "job") return tx("student.goal_job");
  return tx("student.goal_fast");
}

export function StudentDashboardPage() {
  const { user, logout } = useAuthContext();
  const { tx } = useAppContext();
  const [goal, setGoal] = useState<LearningGoal>("job");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.learningGoal);
    if (saved === "beginner" || saved === "job" || saved === "fast") {
      setGoal(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.learningGoal, goal);
  }, [goal]);

  const completed = user?.completedLessons.length || 0;
  const total = WEEKS.reduce((sum, week) => sum + week.days.length, 0);
  const remaining = Math.max(0, total - completed);

  const completedByWeek = useMemo(() => {
    if (!user) return [] as Array<{ weekNum: number; total: number; done: number }>;
    return WEEKS.map((week) => {
      const totalDays = week.days.length;
      const done = week.days.filter((day) => user.completedLessons.includes(`w${week.num}d${day.dayNum}`)).length;
      return { weekNum: week.num, total: totalDays, done };
    });
  }, [user]);

  const nextWeek = useMemo(() => (user ? nextIncompleteWeek(user, WEEKS) : null), [user]);
  const weakest = useMemo(() => (user ? weakestPhase(user, WEEKS) : null), [user]);
  const pace = useMemo(() => (user ? lessonsPerWeek(user) : 0), [user]);
  const etaWeeks = useMemo(() => (user ? estimateWeeksRemaining(user) : 0), [user]);

  const recommendation = useMemo(() => {
    if (!nextWeek) return tx("common.not_available");
    const base = `${tx("student.col_week")} ${nextWeek.num}`;
    if (goal === "fast") return `${base} • ${tx("student.goal_fast")}`;
    if (goal === "beginner") return `${base} • ${tx("student.goal_beginner")}`;
    return `${base} • ${tx("student.goal_job")}`;
  }, [goal, nextWeek, tx]);

  function exportReport() {
    if (!user) return;

    const popup = window.open("", "_blank", "width=980,height=720");
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>QA Student Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f1b2d; }
            h1 { margin-bottom: 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 12px; margin-bottom: 18px; }
            .card { border: 1px solid #d9e2ef; border-radius: 10px; padding: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e5eaf2; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>${tx("student.title")}</h1>
          <p>${tx("student.welcome", { name: user.fullName })}</p>
          <div class="grid">
            <div class="card"><strong>${tx("student.progress")}</strong><div>${user.progressPct}%</div></div>
            <div class="card"><strong>${tx("student.completed_lessons")}</strong><div>${completed}</div></div>
            <div class="card"><strong>${tx("student.remaining_lessons")}</strong><div>${remaining}</div></div>
            <div class="card"><strong>${tx("student.eta")}</strong><div>${tx("student.eta_weeks", { count: etaWeeks })}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>${tx("student.col_week")}</th>
                <th>${tx("student.col_completed")}</th>
                <th>${tx("student.col_remaining")}</th>
                <th>${tx("student.col_percent")}</th>
              </tr>
            </thead>
            <tbody>
              ${completedByWeek
                .map((week) => {
                  const pct = Math.round((week.done / week.total) * 100);
                  return `<tr><td>${week.weekNum}</td><td>${week.done}</td><td>${week.total - week.done}</td><td>${pct}%</td></tr>`;
                })
                .join("")}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
  }

  if (!user) return null;

  return (
    <>
      <section className="page-header">
        <h1>{tx("student.title")}</h1>
        <p className="lead">{tx("student.welcome", { name: user.fullName })}</p>
      </section>

      <section className="stats-grid">
        <article className="card stat-card">
          <h3>{tx("student.progress")}</h3>
          <p className="stat-value">{user.progressPct}%</p>
        </article>
        <article className="card stat-card">
          <h3>{tx("student.completed_lessons")}</h3>
          <p className="stat-value">{completed}</p>
        </article>
        <article className="card stat-card">
          <h3>{tx("student.remaining_lessons")}</h3>
          <p className="stat-value">{remaining}</p>
        </article>
        <article className="card stat-card">
          <h3>{tx("student.status")}</h3>
          <p className="stat-value">{user.status === "active" ? tx("status.active") : tx("status.disabled")}</p>
        </article>
      </section>

      <section className="stats-grid">
        <article className="card">
          <h3>{tx("student.next_action")}</h3>
          <p><strong>{tx("student.recommendation")}:</strong> {recommendation}</p>
          <p className="muted"><strong>{tx("student.weak_phase")}:</strong> {weakest?.name || tx("common.not_available")}</p>
        </article>

        <article className="card">
          <h3>{tx("student.learning_goal")}</h3>
          <select value={goal} onChange={(event) => setGoal(event.target.value as LearningGoal)}>
            <option value="beginner">{tx("student.goal_beginner")}</option>
            <option value="job">{tx("student.goal_job")}</option>
            <option value="fast">{tx("student.goal_fast")}</option>
          </select>
          <p className="muted">{goalLabel(tx, goal)}</p>
        </article>

        <article className="card">
          <h3>{tx("student.eta")}</h3>
          <p>{tx("student.eta_weeks", { count: etaWeeks })}</p>
          <p className="muted">{tx("student.daily_pace")}: {tx("student.lessons_per_week", { count: pace })}</p>
          <p className="muted">{tx("student.week_target")}: {Math.max(4, pace + 1)}</p>
        </article>
      </section>

      <section className="card">
        <h2>{tx("student.assigned_courses")}</h2>
        <ul className="checklist">
          {user.assignedCourses.map((course) => (
            <li key={course}>{course}</li>
          ))}
        </ul>
      </section>

      <section className="card table-wrap">
        <h2>{tx("student.weekly_progress")}</h2>
        <table className="week-table">
          <thead>
            <tr>
              <th>{tx("student.col_week")}</th>
              <th>{tx("student.col_completed")}</th>
              <th>{tx("student.col_remaining")}</th>
              <th>{tx("student.col_percent")}</th>
            </tr>
          </thead>
          <tbody>
            {completedByWeek.map((week) => {
              const pct = Math.round((week.done / week.total) * 100);
              return (
                <tr key={week.weekNum}>
                  <td>
                    <Link to={`/week/${week.weekNum}`}>{tx("student.col_week")} {week.weekNum}</Link>
                  </td>
                  <td>{week.done}</td>
                  <td>{week.total - week.done}</td>
                  <td>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <div className="action-row">
          <Link to="/" className="btn">{tx("student.open_curriculum")}</Link>
          <button className="btn" onClick={exportReport}>{tx("common.export_report")}</button>
          <button className="btn-ghost" onClick={logout}>{tx("common.logout")}</button>
        </div>
      </section>
    </>
  );
}
