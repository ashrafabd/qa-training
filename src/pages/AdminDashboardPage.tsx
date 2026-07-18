import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import type { StudentRecord, UserRole } from "../types/auth";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { ToastStack, type ToastItem, type ToastTone } from "../components/common/ToastStack";
import { cohortMetrics, phaseProgress } from "../services/learningInsights";
import { WEEKS } from "../data";

function toDate(value: string | null, lang: "en" | "ar") {
  if (!value) return "-";
  return new Date(value).toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
}

export function AdminDashboardPage() {
  const { tx, lang } = useAppContext();
  const {
    students,
    user,
    logout,
    addStudentRecord,
    updateStudentRecord,
    deleteStudentRecord,
    resetStudentProgressById,
    resetAllProgress
  } = useAuthContext();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "disabled">("all");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "student" as UserRole, assignedCourses: tx("admin.default_course") });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openActionsFor, setOpenActionsFor] = useState<string | null>(null);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".row-action-menu")) {
        setOpenActionsFor(null);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  function pushToast(message: string, tone: ToastTone = "info") {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }

  function requestConfirmation(title: string, message: string, action: () => Promise<void>) {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    try {
      await confirmAction();
    } catch (error: any) {
      pushToast(error?.message || tx("admin.error_action_failed"), "error");
    } finally {
      setConfirmOpen(false);
      setConfirmAction(null);
    }
  }

  const studentOnly = useMemo(() => students.filter((item) => item.role === "student"), [students]);

  const filtered = useMemo(() => {
    return studentOnly.filter((student) => {
      if (filter !== "all" && student.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return student.fullName.toLowerCase().includes(q) || student.email.toLowerCase().includes(q);
    });
  }, [studentOnly, filter, search]);

  const totalStudents = studentOnly.length;
  const activeStudents = studentOnly.filter((student) => student.status === "active").length;
  const averageProgress = totalStudents ? Math.round(studentOnly.reduce((sum, student) => sum + student.progressPct, 0) / totalStudents) : 0;
  const topProgress = [...studentOnly].sort((a, b) => b.progressPct - a.progressPct).slice(0, 3);
  const staleStudents = studentOnly.filter((student) => !student.lastActivity || Date.now() - new Date(student.lastActivity).getTime() > 1000 * 60 * 60 * 24 * 7);
  const cohort = useMemo(() => cohortMetrics(students), [students]);

  const phaseAverages = useMemo(() => {
    const results = [1, 2, 3, 4].map((phaseId) => ({ phaseId, avg: 0 }));
    if (!studentOnly.length) return results;

    results.forEach((item) => {
      const pcts = studentOnly.map((student) => {
        const row = phaseProgress(student, WEEKS).find((entry) => entry.phase === item.phaseId);
        return row?.pct || 0;
      });
      item.avg = Math.round(pcts.reduce((acc, value) => acc + value, 0) / pcts.length);
    });

    return results;
  }, [studentOnly]);

  const recentlyLoggedIn = [...studentOnly]
    .filter((student) => !!student.lastLogin)
    .sort((a, b) => new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime())
    .slice(0, 5);

  function startEdit(student: StudentRecord) {
    setEditingId(student.id);
    setForm({
      fullName: student.fullName,
      email: student.email,
      password: "",
      role: student.role,
      assignedCourses: student.assignedCourses.join(", ")
    });
  }

  function clearForm() {
    setEditingId(null);
    setForm({ fullName: "", email: "", password: "", role: "student", assignedCourses: tx("admin.default_course") });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const rawCourses = form.assignedCourses
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const seen = new Set<string>();
    const assignedCourses = rawCourses.filter((course) => {
      const key = course.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (!fullName || !email) {
      pushToast(tx("admin.error_required"), "error");
      return;
    }

    const duplicateEmail = students.find((student) => student.email.toLowerCase() === email && student.id !== editingId);
    if (duplicateEmail) {
      pushToast(tx("admin.error_duplicate_email"), "error");
      return;
    }

    const payload = {
      fullName,
      email,
      password: form.password,
      role: form.role,
      assignedCourses
    };

    try {
      if (editingId) {
        await updateStudentRecord(editingId, {
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password || undefined,
          role: payload.role,
          assignedCourses: payload.assignedCourses
        });
        pushToast(tx("admin.success_updated"), "success");
      } else {
        await addStudentRecord(payload);
        pushToast(tx("admin.success_added"), "success");
      }
      clearForm();
    } catch (error: any) {
      pushToast(error?.message || tx("admin.error_action_failed"), "error");
    }
  }

  async function onDelete(studentId: string) {
    requestConfirmation(tx("admin.confirm_delete_title"), tx("admin.confirm_delete_message"), async () => {
      await deleteStudentRecord(studentId);
      pushToast(tx("admin.success_deleted"), "success");
    });
    setOpenActionsFor(null);
  }

  async function onToggleStatus(student: StudentRecord) {
    requestConfirmation(
      student.status === "active" ? tx("admin.confirm_disable_title") : tx("admin.confirm_enable_title"),
      student.status === "active"
        ? tx("admin.confirm_disable_message")
        : tx("admin.confirm_enable_message"),
      async () => {
        await updateStudentRecord(student.id, { status: student.status === "active" ? "disabled" : "active" });
        pushToast(tx("admin.success_status"), "success");
      }
    );
    setOpenActionsFor(null);
  }

  async function onResetProgress(studentId: string) {
    requestConfirmation(tx("admin.confirm_reset_student_title"), tx("admin.confirm_reset_student_message"), async () => {
      await resetStudentProgressById(studentId);
      pushToast(tx("admin.success_reset_student"), "success");
    });
    setOpenActionsFor(null);
  }

  async function onResetAll() {
    requestConfirmation(tx("admin.confirm_reset_all_title"), tx("admin.confirm_reset_all_message"), async () => {
      await resetAllProgress();
      pushToast(tx("admin.success_reset_all"), "success");
    });
  }

  return (
    <>
      <section className="page-header">
        <h1>{tx("admin.title")}</h1>
        <p className="lead">{tx("admin.subtitle")}</p>
      </section>

      <section className="stats-grid">
        <article className="card stat-card"><h3>{tx("admin.total_students")}</h3><p className="stat-value">{totalStudents}</p></article>
        <article className="card stat-card"><h3>{tx("admin.active_students")}</h3><p className="stat-value">{activeStudents}</p></article>
        <article className="card stat-card"><h3>{tx("admin.average_progress")}</h3><p className="stat-value">{averageProgress}%</p></article>
        <article className="card stat-card"><h3>{tx("admin.inactive_recently")}</h3><p className="stat-value">{staleStudents.length}</p></article>
      </section>

      <section className="card">
        <h2>{tx("admin.analytics_title")}</h2>
        <div className="stats-grid">
          <article className="card stat-card">
            <h3>{tx("admin.active_7d")}</h3>
            <p className="stat-value">{cohort.active7d}/{cohort.total}</p>
          </article>
          <article className="card stat-card">
            <h3>{tx("admin.risk_students")}</h3>
            <p className="stat-value">{cohort.risk}</p>
          </article>
          <article className="card stat-card">
            <h3>{tx("admin.velocity")}</h3>
            <p className="stat-value">{cohort.velocity}</p>
          </article>
        </div>

        <h3>{tx("admin.phase_performance")}</h3>
        <div className="phase-performance-grid">
          {phaseAverages.map((entry) => (
            <div key={entry.phaseId} className="phase-performance-row">
              <strong>{tx("common.week_short")}P{entry.phaseId}</strong>
              <div className="bar bar-mini"><div className="bar-fill" style={{ width: `${entry.avg}%` }} /></div>
              <span>{entry.avg}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>{editingId ? tx("admin.edit_student") : tx("admin.add_student")}</h2>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>{tx("admin.full_name")}<input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required /></label>
          <label>{tx("admin.email")}<input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required /></label>
          <label>{tx("admin.password")}<input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder={editingId ? tx("admin.password_keep") : tx("admin.password_required")} required={!editingId} /></label>
          <label>{tx("admin.role")}
            <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}>
              <option value="student">{tx("role.student")}</option>
              <option value="admin">{tx("role.admin")}</option>
            </select>
          </label>
          <label>{tx("admin.assigned_courses")}
            <input value={form.assignedCourses} onChange={(e) => setForm((prev) => ({ ...prev, assignedCourses: e.target.value }))} />
          </label>
          <div className="action-row">
            <button type="submit" className="btn">{editingId ? tx("admin.save_changes") : tx("admin.add_student")}</button>
            {editingId ? <button type="button" className="btn-ghost" onClick={clearForm}>{tx("admin.cancel")}</button> : null}
            <button type="button" className="btn-ghost" onClick={onResetAll}>{tx("admin.reset_all_progress")}</button>
            <button type="button" className="btn-ghost" onClick={logout}>{tx("common.logout")}</button>
          </div>
        </form>
      </section>

      <section className="card table-wrap admin-table-wrap">
        <div className="admin-toolbar">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tx("admin.search_placeholder")}
            className="admin-search"
          />
          <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "disabled")}> 
            <option value="all">{tx("admin.filter_all")}</option>
            <option value="active">{tx("admin.filter_active")}</option>
            <option value="disabled">{tx("admin.filter_disabled")}</option>
          </select>
        </div>
        <table className="week-table">
          <thead>
            <tr>
              <th>{tx("admin.col_name")}</th>
              <th>{tx("admin.col_email")}</th>
              <th>{tx("admin.col_status")}</th>
              <th>{tx("admin.col_progress")}</th>
              <th>{tx("admin.col_completed")}</th>
              <th>{tx("admin.col_remaining")}</th>
              <th>{tx("admin.col_last_activity")}</th>
              <th>{tx("admin.col_last_login")}</th>
              <th>{tx("admin.col_registered")}</th>
              <th>{tx("admin.col_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id}>
                <td>{student.fullName}</td>
                <td>{student.email}</td>
                <td>{student.status === "active" ? tx("status.active") : tx("status.disabled")}</td>
                <td>{student.progressPct}%</td>
                <td>{student.completedLessons.length}</td>
                <td>{student.remainingLessons}</td>
                <td>{toDate(student.lastActivity, lang)}</td>
                <td>{toDate(student.lastLogin, lang)}</td>
                <td>{toDate(student.registrationDate, lang)}</td>
                <td className="actions-cell">
                  <div className="row-action-menu">
                    <button
                      className="btn-ghost row-action-trigger"
                      aria-haspopup="menu"
                      aria-expanded={openActionsFor === student.id}
                      onClick={() => setOpenActionsFor((prev) => (prev === student.id ? null : student.id))}
                    >
                      ...
                    </button>

                    {openActionsFor === student.id ? (
                      <div className="row-action-list" role="menu">
                        <button
                          className="btn-ghost"
                          role="menuitem"
                          onClick={() => {
                            startEdit(student);
                            setOpenActionsFor(null);
                          }}
                        >
                          {tx("admin.action_edit")}
                        </button>
                        <button className="btn-ghost" role="menuitem" onClick={() => onToggleStatus(student)}>
                          {student.status === "active" ? tx("admin.action_disable") : tx("admin.action_enable")}
                        </button>
                        <button className="btn-ghost" role="menuitem" onClick={() => onResetProgress(student.id)}>
                          {tx("admin.action_reset_progress")}
                        </button>
                        {user?.id !== student.id ? (
                          <button className="btn-ghost" role="menuitem" onClick={() => onDelete(student.id)}>
                            {tx("admin.action_delete")}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="stats-grid">
        <article className="card">
          <h3>{tx("admin.recently_logged_in")}</h3>
          <ul className="checklist">
            {recentlyLoggedIn.map((student) => <li key={student.id}>{student.fullName}</li>)}
          </ul>
        </article>
        <article className="card">
          <h3>{tx("admin.top_progress")}</h3>
          <ul className="checklist">
            {topProgress.map((student) => <li key={student.id}>{student.fullName} ({student.progressPct}%)</li>)}
          </ul>
        </article>
        <article className="card">
          <h3>{tx("admin.not_active_recently")}</h3>
          <ul className="checklist">
            {staleStudents.slice(0, 5).map((student) => <li key={student.id}>{student.fullName}</li>)}
          </ul>
        </article>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={tx("common.confirm")}
        cancelLabel={tx("common.cancel")}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
        }}
      />
      <ToastStack toasts={toasts} />
    </>
  );
}
