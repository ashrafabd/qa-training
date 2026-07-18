import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { PATHS } from "../../routes/paths";
import { useAuthContext } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";

export function PublicRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, user, loading } = useAuthContext();
  const { tx } = useAppContext();

  if (loading) {
    return <div className="card"><p>{tx("common.loading_session")}</p></div>;
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "admin" ? PATHS.adminDashboard : PATHS.studentDashboard} replace />;
  }

  return children;
}
