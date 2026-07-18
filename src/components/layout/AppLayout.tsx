import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export function AppLayout({ curriculum }: { curriculum: any }) {
  const location = useLocation();
  const { setNavOpen } = useAppContext();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, setNavOpen]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [setNavOpen]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header ui={curriculum.UI} />
      <div className="layout">
        <Sidebar phases={curriculum.PHASES} weeks={curriculum.WEEKS} ui={curriculum.UI} />
        <main id="main" className="content">
          <Outlet />
        </main>
      </div>
      <div id="nav-backdrop" className="nav-backdrop" onClick={() => setNavOpen(false)} />
      <Footer ui={curriculum.UI} />
    </>
  );
}
