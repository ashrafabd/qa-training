import { useScrollTop } from "../hooks/useScrollTop";
import { useAppContext } from "../context/AppContext";
import { RES_ICON } from "../constants/appConfig";
import { logoNode } from "../components/common/LogoAsset";
import { Breadcrumb } from "../components/common/Breadcrumb";

export function ResourcesPage({ curriculum }) {
  const { RESOURCES, UI } = curriculum;
  const { t } = useAppContext();

  useScrollTop([]);

  return (
    <>
      <Breadcrumb
        parts={[
          { label: t(UI.nav_overview), to: "/" },
          { label: t(UI.nav_resources) }
        ]}
      />

      <section className="page-header">
        <h1>{t(UI.nav_resources)}</h1>
        <p className="lead">{t(UI.resources_lead)}</p>
        <p className="muted small">{t(UI.resources_note)}</p>
      </section>

      <div className="res-grid">
        {RESOURCES.map((group, index) => (
          <div className="card res-card" key={t(group.cat)}>
            <h3>
              <span className="res-icon">{logoNode(RES_ICON[index] || "youtube", 20)}</span>
              {t(group.cat)}
            </h3>
            <ul className="res-list">
              {group.items.map((item) => (
                <li key={`${item.name}-${item.url || "none"}`}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.name}
                    </a>
                  ) : (
                    <strong>{item.name}</strong>
                  )}
                  <div className="muted small">{t(item.note)}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
