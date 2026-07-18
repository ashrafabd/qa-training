import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import type { StudentRecord, UserRole } from "../types/auth";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { ToastStack, type ToastItem, type ToastTone } from "../components/common/ToastStack";

function toDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function AdminDashboardPage() {
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
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "student" as UserRole, assignedCourses: "QA Automation Engineer 16-Week Track" });
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
      pushToast(error?.message || "Action failed.", "error");
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
    setForm({ fullName: "", email: "", password: "", role: "student", assignedCourses: "QA Automation Engineer 16-Week Track" });
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
      pushToast("Full name and email are required.", "error");
      return;
    }

    const duplicateEmail = students.find((student) => student.email.toLowerCase() === email && student.id !== editingId);
    if (duplicateEmail) {
      pushToast("A student with this email already exists.", "error");
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
        pushToast("Student updated successfully.", "success");
      } else {
        await addStudentRecord(payload);
        pushToast("Student added successfully.", "success");
      }
      clearForm();
    } catch (error: any) {
      pushToast(error?.message || "Action failed.", "error");
    }
  }

  async function onDelete(studentId: string) {
    requestConfirmation("Delete Student", "Delete this student account? This action cannot be undone.", async () => {
      await deleteStudentRecord(studentId);
      pushToast("Student deleted successfully.", "success");
    });
    setOpenActionsFor(null);
  }

  async function onToggleStatus(student: StudentRecord) {
    requestConfirmation(
      student.status === "active" ? "Disable Account" : "Enable Account",
      student.status === "active"
        ? "Disable this account? The student will not be able to log in."
        : "Enable this account so the student can log in again?",
      async () => {
        await updateStudentRecord(student.id, { status: student.status === "active" ? "disabled" : "active" });
        pushToast("Student status updated.", "success");
      }
    );
    setOpenActionsFor(null);
  }

  async function onResetProgress(studentId: string) {
    requestConfirmation("Reset Student Progress", "Reset this student's progress to zero?", async () => {
      await resetStudentProgressById(studentId);
      pushToast("Student progress reset.", "success");
    });
    setOpenActionsFor(null);
  }

  async function onResetAll() {
    requestConfirmation("Reset All Progress", "Reset progress for ALL students? This affects every account.", async () => {
      await resetAllProgress();
      pushToast("All student progress was reset.", "success");
    });
  }

  return (
    <>
      <section className="page-header">
        <h1>Admin Dashboard</h1>
        <p className="lead">Manage student accounts, progress, and access.</p>
      </section>

      <section className="stats-grid">
        <article className="card stat-card"><h3>Total Students</h3><p className="stat-value">{totalStudents}</p></article>
        <article className="card stat-card"><h3>Active Students</h3><p className="stat-value">{activeStudents}</p></article>
        <article className="card stat-card"><h3>Average Progress</h3><p className="stat-value">{averageProgress}%</p></article>
        <article className="card stat-card"><h3>Inactive Recently</h3><p className="stat-value">{staleStudents.length}</p></article>
      </section>

      <section className="card">
        <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>Full name<input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required /></label>
          <label>Password<input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder={editingId ? "Leave empty to keep current password" : "Required"} required={!editingId} /></label>
          <label>Role
            <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>Assigned courses (comma separated)
            <input value={form.assignedCourses} onChange={(e) => setForm((prev) => ({ ...prev, assignedCourses: e.target.value }))} />
          </label>
          <div className="action-row">
            <button type="submit" className="btn">{editingId ? "Save Changes" : "Add Student"}</button>
            {editingId ? <button type="button" className="btn-ghost" onClick={clearForm}>Cancel</button> : null}
            <button type="button" className="btn-ghost" onClick={onResetAll}>Reset All Progress</button>
            <button type="button" className="btn-ghost" onClick={logout}>Logout</button>
          </div>
        </form>
      </section>

      <section className="card table-wrap admin-table-wrap">
        <div className="admin-toolbar">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name or email"
            className="admin-search"
          />
          <select className="admin-filter-select" value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "disabled")}> 
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <table className="week-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Completed</th>
              <th>Remaining</th>
              <th>Last Activity</th>
              <th>Last Login</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id}>
                <td>{student.fullName}</td>
                <td>{student.email}</td>
                <td>{student.status}</td>
                <td>{student.progressPct}%</td>
                <td>{student.completedLessons.length}</td>
                <td>{student.remainingLessons}</td>
                <td>{toDate(student.lastActivity)}</td>
                <td>{toDate(student.lastLogin)}</td>
                <td>{toDate(student.registrationDate)}</td>
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
                          Edit
                        </button>
                        <button className="btn-ghost" role="menuitem" onClick={() => onToggleStatus(student)}>
                          {student.status === "active" ? "Disable" : "Enable"}
                        </button>
                        <button className="btn-ghost" role="menuitem" onClick={() => onResetProgress(student.id)}>
                          Reset Progress
                        </button>
                        {user?.id !== student.id ? (
                          <button className="btn-ghost" role="menuitem" onClick={() => onDelete(student.id)}>
                            Delete
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
          <h3>Recently Logged In</h3>
          <ul className="checklist">
            {recentlyLoggedIn.map((student) => <li key={student.id}>{student.fullName}</li>)}
          </ul>
        </article>
        <article className="card">
          <h3>Top Progress Students</h3>
          <ul className="checklist">
            {topProgress.map((student) => <li key={student.id}>{student.fullName} ({student.progressPct}%)</li>)}
          </ul>
        </article>
        <article className="card">
          <h3>Not Active Recently</h3>
          <ul className="checklist">
            {staleStudents.slice(0, 5).map((student) => <li key={student.id}>{student.fullName}</li>)}
          </ul>
        </article>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
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
