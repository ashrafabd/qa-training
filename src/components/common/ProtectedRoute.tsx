import { Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { PATHS } from "../../routes/paths";
import { useAuthContext } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import type { UserRole } from "../../types/auth";

export function ProtectedRoute({ children, role }: { children: ReactElement; role?: UserRole }) {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuthContext();
  const { tx } = useAppContext();

  if (loading) {
    return <div className="card"><p>{tx("common.loading_session")}</p></div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.login} state={{ from: location.pathname }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={PATHS.accessDenied} replace />;
  }

  return children;
}
