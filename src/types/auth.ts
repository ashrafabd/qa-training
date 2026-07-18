export type UserRole = "admin" | "student";
export type AccountStatus = "active" | "disabled";

export interface StudentRecord {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  registrationDate: string;
  completedLessons: string[];
  remainingLessons: number;
  progressPct: number;
  assignedCourses: string[];
  lastLogin: string | null;
  lastActivity: string | null;
  status: AccountStatus;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  expiresAt: string;
}

export interface StudentCreateInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  assignedCourses: string[];
  status?: AccountStatus;
}

export interface StudentUpdateInput {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  assignedCourses?: string[];
  status?: AccountStatus;
}
