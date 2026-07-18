import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { PATHS } from "../routes/paths";

export function LoginPage() {
  const { login } = useAuthContext();
  const { tx } = useAppContext();
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
        setError(tx(result.errorKey || "auth.login_failed"));
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
        <h1>{tx("auth.login_title")}</h1>
        <p className="muted">{tx("auth.login_subtitle")}</p>
        <p className="small muted">{tx("auth.demo_admin")}</p>
        <p className="small muted">{tx("auth.demo_student")}</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            {tx("auth.email")}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          </label>

          <label>
            {tx("auth.password")}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? tx("auth.signing_in") : tx("auth.sign_in")}
          </button>
        </form>
      </section>
    </div>
  );
}
