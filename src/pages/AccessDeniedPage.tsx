import { Link } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { useAuthContext } from "../context/AuthContext";

export function AccessDeniedPage() {
  const { user } = useAuthContext();

  const dashboard = user?.role === "admin" ? PATHS.adminDashboard : PATHS.studentDashboard;

  return (
    <section className="card">
      <h1>Access Denied</h1>
      <p className="muted">You do not have permission to access this page.</p>
      <Link className="btn" to={dashboard}>Back to dashboard</Link>
    </section>
  );
}
