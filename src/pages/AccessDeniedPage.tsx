import { Link } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { useAuthContext } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

export function AccessDeniedPage() {
  const { user } = useAuthContext();
  const { tx } = useAppContext();

  const dashboard = user?.role === "admin" ? PATHS.adminDashboard : PATHS.studentDashboard;

  return (
    <section className="card">
      <h1>{tx("access_denied.title")}</h1>
      <p className="muted">{tx("access_denied.message")}</p>
      <Link className="btn" to={dashboard}>{tx("access_denied.back")}</Link>
    </section>
  );
}
