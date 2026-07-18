import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import type { AuthSession, StudentCreateInput, StudentRecord, StudentUpdateInput, UserRole } from "../types/auth";
import {
  addStudent,
  bootstrapStudents,
  deleteStudent,
  findStudentByEmail,
  findStudentById,
  listStudents,
  resetAllStudentsProgress,
  resetStudentProgress,
  updateLastLogin,
  updateStudent,
  updateStudentProgress,
  verifyPassword
} from "../services/studentRepository";

interface AuthContextValue {
  user: StudentRecord | null;
  students: StudentRecord[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  refreshStudents: () => Promise<void>;
  addStudentRecord: (input: StudentCreateInput) => Promise<StudentRecord>;
  updateStudentRecord: (id: string, input: StudentUpdateInput) => Promise<StudentRecord>;
  deleteStudentRecord: (id: string) => Promise<void>;
  resetStudentProgressById: (id: string) => Promise<void>;
  resetAllProgress: () => Promise<void>;
  updateOwnProgress: (completedLessons: string[]) => Promise<void>;
  requireRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthSession | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.authSession) || "null") as AuthSession | null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.authSession);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StudentRecord | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStudents = useCallback(async () => {
    const all = await listStudents();
    setStudents(all);
    return;
  }, []);

  const hydrateSession = useCallback(async () => {
    await bootstrapStudents();
    const all = await listStudents();
    setStudents(all);

    const session = readSession();
    if (!session) {
      setUser(null);
      return;
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      saveSession(null);
      setUser(null);
      return;
    }

    const current = await findStudentById(session.userId);
    if (!current || current.status !== "active") {
      saveSession(null);
      setUser(null);
      return;
    }

    setUser(current);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await hydrateSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrateSession]);

  const login = useCallback(async (email: string, password: string) => {
    const account = await findStudentByEmail(email.trim().toLowerCase());
    if (!account) return { success: false, error: "Invalid email or password." };
    if (account.status !== "active") return { success: false, error: "This account is disabled." };

    const isValid = await verifyPassword(account, password);
    if (!isValid) return { success: false, error: "Invalid email or password." };

    const loggedIn = await updateLastLogin(account.id);
    const session: AuthSession = {
      userId: loggedIn.id,
      role: loggedIn.role,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
    };

    saveSession(session);
    setUser(loggedIn);
    await refreshStudents();
    return { success: true, role: loggedIn.role };
  }, [refreshStudents]);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);

  const addStudentRecord = useCallback(async (input: StudentCreateInput) => {
    const created = await addStudent(input);
    await refreshStudents();
    return created;
  }, [refreshStudents]);

  const updateStudentRecord = useCallback(async (id: string, input: StudentUpdateInput) => {
    const updated = await updateStudent(id, input);
    await refreshStudents();
    setUser((prev) => (prev?.id === id ? updated : prev));
    return updated;
  }, [refreshStudents]);

  const deleteStudentRecord = useCallback(async (id: string) => {
    await deleteStudent(id);
    await refreshStudents();
    setUser((prev) => (prev?.id === id ? null : prev));
  }, [refreshStudents]);

  const resetStudentProgressById = useCallback(async (id: string) => {
    const updated = await resetStudentProgress(id);
    await refreshStudents();
    setUser((prev) => (prev?.id === id ? updated : prev));
  }, [refreshStudents]);

  const resetAllProgress = useCallback(async () => {
    await resetAllStudentsProgress();
    await refreshStudents();
    if (user) {
      const fresh = await findStudentById(user.id);
      setUser(fresh);
    }
  }, [refreshStudents, user]);

  const updateOwnProgress = useCallback(async (completedLessons: string[]) => {
    if (!user) return;
    const updated = await updateStudentProgress(user.id, completedLessons);
    setUser(updated);
    setStudents((prev) => prev.map((student) => (student.id === user.id ? updated : student)));
  }, [user]);

  const requireRole = useCallback((role: UserRole) => user?.role === role, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    students,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    refreshStudents,
    addStudentRecord,
    updateStudentRecord,
    deleteStudentRecord,
    resetStudentProgressById,
    resetAllProgress,
    updateOwnProgress,
    requireRole
  }), [user, students, loading, login, logout, refreshStudents, addStudentRecord, updateStudentRecord, deleteStudentRecord, resetStudentProgressById, resetAllProgress, updateOwnProgress, requireRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}
