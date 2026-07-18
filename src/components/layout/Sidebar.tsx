import { NavLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import { PATHS } from "../../routes/paths";

function linkClass(baseClass) {
  return ({ isActive }: { isActive: boolean }) => `${baseClass} ${isActive ? "active" : ""}`.trim();
}

export function Sidebar({ phases, weeks, ui }: { phases: any[]; weeks: any[]; ui: any }) {
  const { t, tx, isDone } = useAppContext();
  const { user } = useAuthContext();

  return (
    <aside className="sidebar">
      <nav id="sidebar-nav">
        <NavLink className={linkClass("side-link side-top")} to="/">
          🏠 {t(ui.nav_overview)}
        </NavLink>

        {user?.role === "admin" ? (
          <NavLink className={linkClass("side-link")} to={PATHS.adminDashboard}>
            🛠 {tx("admin.title")}
          </NavLink>
        ) : null}

        {user?.role === "student" ? (
          <NavLink className={linkClass("side-link")} to={PATHS.studentDashboard}>
            🎓 {tx("student.title")}
          </NavLink>
        ) : null}

        {phases.map((phase) => (
          <div className="side-group" key={phase.id}>
            <NavLink className={linkClass(`side-phase ${phase.color}`)} to={`/phase/${phase.id}`}>
              {t(ui.phase_word)} {phase.id} · {t(phase.title)}
            </NavLink>

            {weeks
              .filter((week) => week.phase === phase.id)
              .map((week) => {
                const total = week.days.length;
                const done = week.days.filter((day) => isDone(week.num, day.dayNum)).length;

                return (
                  <NavLink className={linkClass("side-week")} to={`/week/${week.num}`} key={week.num}>
                    <span className="sw-num">{tx("common.week_short")}{week.num}</span>
                    <span className="sw-title">{t(week.title)}</span>
                    <span className={`sw-prog ${done === total ? "complete" : ""}`}>{done}/{total}</span>
                  </NavLink>
                );
              })}
          </div>
        ))}

        <NavLink className={linkClass("side-link")} to="/assessments">
          ★ {t(ui.nav_assessments)}
        </NavLink>
        <NavLink className={linkClass("side-link")} to="/videos">
          🎬 {t(ui.nav_videos)}
        </NavLink>
        <NavLink className={linkClass("side-link")} to="/resources">
          📚 {t(ui.nav_resources)}
        </NavLink>
      </nav>
    </aside>
  );
}
