import { useNavigate } from "react-router-dom";
import { useScrollTop } from "../hooks/useScrollTop";
import { useAppContext } from "../context/AppContext";
import { Breadcrumb } from "../components/common/Breadcrumb";

function Checklist({ items }) {
  return (
    <ul className="checklist">
      {items.map((item, index) => (
        <li key={`ass-r-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export function AssessmentsPage({ curriculum }) {
  const { ASSESSMENTS, UI, WEEKS } = curriculum;
  const { t } = useAppContext();
  const navigate = useNavigate();

  useScrollTop([]);

  return (
    <>
      <Breadcrumb
        parts={[
          { label: t(UI.nav_overview), to: "/" },
          { label: t(UI.nav_assessments) }
        ]}
      />

      <section className="page-header">
        <h1>{t(UI.nav_assessments)}</h1>
        <p className="lead">{t(ASSESSMENTS.cadence)}</p>
      </section>

      <section className="card">
        <h3>{t(UI.grading_title)}</h3>
        <p className="muted">{t(ASSESSMENTS.grading)}</p>
        <h4>{t(UI.rubric_title)}</h4>
        <Checklist items={t(ASSESSMENTS.rubricDimensions)} />
      </section>

      <section>
        <h2 className="section-title">{t(UI.ms_schedule)}</h2>
        <div className="card table-wrap">
          <table className="week-table">
            <thead>
              <tr>
                <th>{t(UI.col_wk)}</th>
                <th>{t(UI.col_milestone)}</th>
                <th>{t(UI.col_type)}</th>
                <th>{t(UI.col_pass)}</th>
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((week) => (
                <tr className="row-link" key={week.num} onClick={() => navigate(`/week/${week.num}`)}>
                  <td>
                    <span className={`wk-pill phase-dot-${week.phase}`}>{week.num}</span>
                  </td>
                  <td>
                    <strong>{t(week.milestone.title)}</strong>
                    <div className="muted small">{t(week.milestone.description)}</div>
                  </td>
                  <td>{t(week.milestone.type)}</td>
                  <td>
                    <span className="tag tag-pass">{t(week.milestone.pass)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
