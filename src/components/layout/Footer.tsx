import { useAppContext } from "../../context/AppContext";

export function Footer({ ui }) {
  const { t } = useAppContext();

  return (
    <footer className="app-footer">
      <span>{t(ui.footer)}</span>
    </footer>
  );
}
