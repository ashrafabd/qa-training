import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { PATHS } from "../routes/paths";

export function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "Login failed.");
        return;
      }

      if (from && from !== PATHS.login) {
        navigate(from, { replace: true });
        return;
      }

      if (result.role === "admin") {
        navigate(PATHS.adminDashboard, { replace: true });
      } else {
        navigate(PATHS.studentDashboard, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page-wrap">
      <section className="card auth-card">
        <h1>Login</h1>
        <p className="muted">Use your account to access the curriculum dashboard.</p>
        <p className="small muted">Demo Admin: admin@qa.local / admin123</p>
        <p className="small muted">Demo Student: student@qa.local / student123</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
