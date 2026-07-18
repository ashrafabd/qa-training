import { WEEKS } from "../data";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { hasSupabaseConfig, supabase } from "./supabaseClient";
import type { StudentCreateInput, StudentRecord, StudentUpdateInput } from "../types/auth";

const TOTAL_DAYS = WEEKS.reduce((total, week) => total + week.days.length, 0);

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === "function") {
    return randomUUID.call(globalThis.crypto);
  }

  const ts = Date.now().toString(36);
  const rnd = Math.floor(Math.random() * 1e12).toString(36);
  return `id-${ts}-${rnd}`;
}

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const subtle = globalThis.crypto?.subtle;

  if (subtle) {
    const digest = await subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  // Fallback for environments where Web Crypto is not available.
  let hash = 2166136261;
  for (let i = 0; i < password.length; i += 1) {
    hash ^= password.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fallback-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function computeProgress(completedLessons: string[]) {
  const completed = completedLessons.length;
  const progressPct = Math.round((completed / TOTAL_DAYS) * 100);
  return {
    completedLessons,
    remainingLessons: Math.max(0, TOTAL_DAYS - completed),
    progressPct
  };
}

function readLocalStudents() {
  try {
    return (JSON.parse(localStorage.getItem(STORAGE_KEYS.students) || "[]") as StudentRecord[]) || [];
  } catch {
    return [];
  }
}

function writeLocalStudents(students: StudentRecord[]) {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

function toDbStudent(row: any): StudentRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    registrationDate: row.registration_date,
    completedLessons: row.completed_lessons || [],
    remainingLessons: row.remaining_lessons ?? 0,
    progressPct: row.progress_pct ?? 0,
    assignedCourses: row.assigned_courses || [],
    lastLogin: row.last_login,
    lastActivity: row.last_activity,
    status: row.status
  };
}

function toDbPayload(input: Partial<StudentRecord>) {
  const payload: Record<string, any> = {};
  if (input.fullName !== undefined) payload.full_name = input.fullName;
  if (input.email !== undefined) payload.email = input.email;
  if (input.passwordHash !== undefined) payload.password_hash = input.passwordHash;
  if (input.role !== undefined) payload.role = input.role;
  if (input.registrationDate !== undefined) payload.registration_date = input.registrationDate;
  if (input.completedLessons !== undefined) payload.completed_lessons = input.completedLessons;
  if (input.remainingLessons !== undefined) payload.remaining_lessons = input.remainingLessons;
  if (input.progressPct !== undefined) payload.progress_pct = input.progressPct;
  if (input.assignedCourses !== undefined) payload.assigned_courses = input.assignedCourses;
  if (input.lastLogin !== undefined) payload.last_login = input.lastLogin;
  if (input.lastActivity !== undefined) payload.last_activity = input.lastActivity;
  if (input.status !== undefined) payload.status = input.status;
  return payload;
}

async function ensureSeedData() {
  let students = await listStudents();
  if (students.length > 0) return;

  const adminPwd = await hashPassword("admin123");
  const studentPwd = await hashPassword("student123");

  const baseDate = nowIso();
  const seed: StudentRecord[] = [
    {
      id: createId(),
      fullName: "Admin User",
      email: "admin@qa.local",
      passwordHash: adminPwd,
      role: "admin",
      registrationDate: baseDate,
      completedLessons: [],
      remainingLessons: TOTAL_DAYS,
      progressPct: 0,
      assignedCourses: ["QA Automation Engineer 16-Week Track"],
      lastLogin: null,
      lastActivity: null,
      status: "active"
    },
    {
      id: createId(),
      fullName: "Student User",
      email: "student@qa.local",
      passwordHash: studentPwd,
      role: "student",
      registrationDate: baseDate,
      completedLessons: [],
      remainingLessons: TOTAL_DAYS,
      progressPct: 0,
      assignedCourses: ["QA Automation Engineer 16-Week Track"],
      lastLogin: null,
      lastActivity: null,
      status: "active"
    }
  ];

  if (hasSupabaseConfig && supabase) {
    await supabase.from("students").insert(seed.map((row) => toDbPayload(row)));
  } else {
    writeLocalStudents(seed);
  }
}

export async function bootstrapStudents() {
  await ensureSeedData();
}

export async function listStudents() {
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase.from("students").select("*").order("registration_date", { ascending: true });
    if (error) throw error;
    return (data || []).map(toDbStudent);
  }
  return readLocalStudents();
}

export async function findStudentById(id: string) {
  const students = await listStudents();
  return students.find((student) => student.id === id) || null;
}

export async function findStudentByEmail(email: string) {
  const students = await listStudents();
  return students.find((student) => student.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function addStudent(input: StudentCreateInput) {
  const existing = await findStudentByEmail(input.email);
  if (existing) throw new Error("A student with this email already exists.");

  const passwordHash = await hashPassword(input.password);
  const base: StudentRecord = {
    id: createId(),
    fullName: input.fullName,
    email: input.email.trim().toLowerCase(),
    passwordHash,
    role: input.role,
    registrationDate: nowIso(),
    completedLessons: [],
    remainingLessons: TOTAL_DAYS,
    progressPct: 0,
    assignedCourses: input.assignedCourses,
    lastLogin: null,
    lastActivity: null,
    status: input.status || "active"
  };

  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase.from("students").insert(toDbPayload(base)).select("*").single();
    if (error) throw error;
    return toDbStudent(data);
  }

  const students = readLocalStudents();
  students.push(base);
  writeLocalStudents(students);
  return base;
}

export async function updateStudent(id: string, input: StudentUpdateInput) {
  const current = await findStudentById(id);
  if (!current) throw new Error("Student not found.");

  if (input.email) {
    const requestedEmail = input.email.trim().toLowerCase();
    const duplicate = (await listStudents()).find((student) => student.email.toLowerCase() === requestedEmail && student.id !== id);
    if (duplicate) {
      throw new Error("A student with this email already exists.");
    }
  }

  const next: StudentRecord = {
    ...current,
    fullName: input.fullName ?? current.fullName,
    email: input.email?.trim().toLowerCase() ?? current.email,
    role: input.role ?? current.role,
    assignedCourses: input.assignedCourses ?? current.assignedCourses,
    status: input.status ?? current.status
  };

  if (input.password) {
    next.passwordHash = await hashPassword(input.password);
  }

  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase.from("students").update(toDbPayload(next)).eq("id", id).select("*").single();
    if (error) throw error;
    return toDbStudent(data);
  }

  const students = readLocalStudents().map((student) => (student.id === id ? next : student));
  writeLocalStudents(students);
  return next;
}

export async function deleteStudent(id: string) {
  if (hasSupabaseConfig && supabase) {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) throw error;
    return;
  }

  const students = readLocalStudents().filter((student) => student.id !== id);
  writeLocalStudents(students);
}

export async function updateStudentProgress(id: string, completedLessons: string[]) {
  const current = await findStudentById(id);
  if (!current) throw new Error("Student not found.");

  const metrics = computeProgress(completedLessons);
  const next: StudentRecord = {
    ...current,
    ...metrics,
    lastActivity: nowIso()
  };

  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase
      .from("students")
      .update(toDbPayload({ completedLessons: metrics.completedLessons, remainingLessons: metrics.remainingLessons, progressPct: metrics.progressPct, lastActivity: next.lastActivity }))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return toDbStudent(data);
  }

  const students = readLocalStudents().map((student) => (student.id === id ? next : student));
  writeLocalStudents(students);
  return next;
}

export async function resetStudentProgress(id: string) {
  return updateStudentProgress(id, []);
}

export async function resetAllStudentsProgress() {
  const students = await listStudents();
  const updated = await Promise.all(students.map((student) => updateStudentProgress(student.id, [])));
  return updated;
}

export async function updateLastLogin(id: string) {
  const current = await findStudentById(id);
  if (!current) throw new Error("Student not found.");

  const timestamp = nowIso();
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase.from("students").update({ last_login: timestamp }).eq("id", id).select("*").single();
    if (error) throw error;
    return toDbStudent(data);
  }

  const next = { ...current, lastLogin: timestamp, lastActivity: timestamp };
  const students = readLocalStudents().map((student) => (student.id === id ? next : student));
  writeLocalStudents(students);
  return next;
}

export async function verifyPassword(student: StudentRecord, password: string) {
  const hashed = await hashPassword(password);
  return student.passwordHash === hashed;
}

export { TOTAL_DAYS };
