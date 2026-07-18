import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../../assets/icons";
import { useAppContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import { PATHS } from "../../routes/paths";

export function Header({ ui }: { ui: any }) {
  const {
    t,
    lang,
    theme,
    setLang,
    setTheme,
    progressPct,
    navOpen,
    navCollapsed,
    setNavOpen,
    setNavCollapsed
  } = useAppContext();

  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  const navExpanded = isMobile ? navOpen : !navCollapsed;

  return (
    <header className="app-header">
      <button
        id="nav-toggle"
        className="icon-btn nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={navExpanded}
        aria-controls="sidebar-nav"
        onClick={() => {
          if (isMobile) {
            setNavOpen(!navOpen);
          } else {
            setNavCollapsed(!navCollapsed);
          }
        }}
      >
        <span className="nav-toggle-bars" aria-hidden="true" />
      </button>

      <Link className="brand" to="/">
        <span className="logo">QA</span>
        <span className="brand-text">
          <span>{t(ui.brand_title)}</span>
          <small>{t(ui.brand_sub)}</small>
        </span>
      </Link>

      <div className="header-spacer" />

      <span className="progress-pill" title="Overall completion">
        <span className="pp-dot" />
        <span>{progressPct}%</span>
      </span>

      <div className="search-wrap">
        <input
          id="search-input"
          type="search"
          value={query}
          placeholder={t(ui.search_placeholder)}
          aria-label="Search the curriculum"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && query.trim()) {
              navigate(`/search/${encodeURIComponent(query.trim())}`);
            }
          }}
        />
      </div>

      {user ? (
        <Link className="icon-btn text-btn" to={user.role === "admin" ? PATHS.adminDashboard : PATHS.studentDashboard}>
          {user.role === "admin" ? "Admin" : "Student"}
        </Link>
      ) : null}

      <button
        id="lang-btn"
        className="icon-btn text-btn"
        title="Language / اللغة"
        onClick={() => setLang(lang === "en" ? "ar" : "en")}
      >
        {t(ui.lang_btn)}
      </button>

      <button
        id="theme-btn"
        className="icon-btn text-btn"
        title="Theme"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "dark" ? "☀" : "🌙"} {theme === "dark" ? t(ui.theme_light) : t(ui.theme_dark)}
      </button>

      <button
        id="print-btn"
        className="icon-btn"
        title={t(ui.print_title)}
        aria-label={t(ui.print_title)}
        onClick={() => window.print()}
      >
        <Icons.Print />
      </button>

      {user ? (
        <button
          className="icon-btn text-btn"
          onClick={() => {
            logout();
            navigate(PATHS.login);
          }}
        >
          Logout
        </button>
      ) : null}
    </header>
  );
}
