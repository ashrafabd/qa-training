import { useAppContext } from "../context/AppContext";
import { Breadcrumb } from "../components/common/Breadcrumb";

export function AboutProgramPage() {
  const { tx } = useAppContext();

  return (
    <>
      <Breadcrumb parts={[{ label: tx("about.nav") }]} />

      <section className="page-header">
        <h1>{tx("about.title")}</h1>
        <p className="lead">{tx("about.lead")}</p>
      </section>

      <section className="card">
        <h2>{tx("about.mission_title")}</h2>
        <p>{tx("about.mission_text")}</p>
      </section>

      <section className="card">
        <h2>{tx("about.method_title")}</h2>
        <ul className="checklist">
          <li>{tx("about.method_1")}</li>
          <li>{tx("about.method_2")}</li>
          <li>{tx("about.method_3")}</li>
        </ul>
      </section>

      <section className="stats-grid">
        <article className="card">
          <h3>{tx("about.faq_title")}</h3>
          <p><strong>{tx("about.faq_q1")}</strong></p>
          <p className="muted">{tx("about.faq_a1")}</p>
          <p><strong>{tx("about.faq_q2")}</strong></p>
          <p className="muted">{tx("about.faq_a2")}</p>
        </article>

        <article className="card">
          <h3>{tx("about.changelog_title")}</h3>
          <ul className="checklist">
            <li>{tx("about.change_1")}</li>
            <li>{tx("about.change_2")}</li>
            <li>{tx("about.change_3")}</li>
          </ul>
        </article>
      </section>
    </>
  );
}
