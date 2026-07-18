import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { PublicRoute } from "./components/common/PublicRoute";
import { useFxEnhancements } from "./hooks/useFxEnhancements";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AssessmentsPage } from "./pages/AssessmentsPage";
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PhasePage } from "./pages/PhasePage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { SearchPage } from "./pages/SearchPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { VideosPage } from "./pages/VideosPage";
import { WeekPage } from "./pages/WeekPage";
import { PATHS } from "./routes/paths";
import * as curriculum from "./data";

export default function App() {
  useFxEnhancements();

  return (
    <Routes>
      <Route
        path={PATHS.login}
        element={(
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        )}
      />

      <Route
        element={(
          <ProtectedRoute>
            <AppLayout curriculum={curriculum} />
          </ProtectedRoute>
        )}
      >
        <Route path={PATHS.home} element={<OverviewPage curriculum={curriculum} />} />
        <Route path={PATHS.phase} element={<PhasePage curriculum={curriculum} />} />
        <Route path={PATHS.week} element={<WeekPage curriculum={curriculum} />} />
        <Route path={PATHS.resources} element={<ResourcesPage curriculum={curriculum} />} />
        <Route path={PATHS.videos} element={<VideosPage curriculum={curriculum} />} />
        <Route path={PATHS.assessments} element={<AssessmentsPage curriculum={curriculum} />} />
        <Route path={PATHS.search} element={<SearchPage curriculum={curriculum} />} />

        <Route
          path={PATHS.studentDashboard}
          element={(
            <ProtectedRoute role="student">
              <StudentDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path={PATHS.adminDashboard}
          element={(
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route path={PATHS.accessDenied} element={<AccessDeniedPage />} />
        <Route path="*" element={<Navigate to={PATHS.home} replace />} />
      </Route>

      <Route path="*" element={<Navigate to={PATHS.login} replace />} />
    </Routes>
  );
}
