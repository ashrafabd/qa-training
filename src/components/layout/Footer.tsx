import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { PATHS } from "../../routes/paths";

export function Footer({ ui }) {
  const { t, tx } = useAppContext();

  return (
    <footer className="app-footer">
      <span>{t(ui.footer)}</span>
      <span> · </span>
      <Link to={PATHS.about}>{tx("about.nav")}</Link>
    </footer>
  );
}
