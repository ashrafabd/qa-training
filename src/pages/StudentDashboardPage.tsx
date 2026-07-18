import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuthContext } from "../context/AuthContext";
import { WEEKS } from "../data";

export function StudentDashboardPage() {
  const { user, logout } = useAuthContext();

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

  if (!user) return null;

  return (
    <>
      <section className="page-header">
        <h1>Student Dashboard</h1>
        <p className="lead">Welcome back, {user.fullName}</p>
      </section>

      <section className="stats-grid">
        <article className="card stat-card">
          <h3>Progress</h3>
          <p className="stat-value">{user.progressPct}%</p>
        </article>
        <article className="card stat-card">
          <h3>Completed Lessons</h3>
          <p className="stat-value">{completed}</p>
        </article>
        <article className="card stat-card">
          <h3>Remaining Lessons</h3>
          <p className="stat-value">{remaining}</p>
        </article>
        <article className="card stat-card">
          <h3>Status</h3>
          <p className="stat-value">{user.status}</p>
        </article>
      </section>

      <section className="card">
        <h2>Assigned Courses</h2>
        <ul className="checklist">
          {user.assignedCourses.map((course) => (
            <li key={course}>{course}</li>
          ))}
        </ul>
      </section>

      <section className="card table-wrap">
        <h2>Weekly Progress</h2>
        <table className="week-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Completed</th>
              <th>Remaining</th>
              <th>Percent</th>
            </tr>
          </thead>
          <tbody>
            {completedByWeek.map((week) => {
              const pct = Math.round((week.done / week.total) * 100);
              return (
                <tr key={week.weekNum}>
                  <td>
                    <Link to={`/week/${week.weekNum}`}>Week {week.weekNum}</Link>
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
          <Link to="/" className="btn">Open Curriculum</Link>
          <button className="btn-ghost" onClick={logout}>Logout</button>
        </div>
      </section>
    </>
  );
}
