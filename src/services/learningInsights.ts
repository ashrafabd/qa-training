import type { StudentRecord } from "../types/auth";

interface WeekLike {
  num: number;
  phase: number;
  days: Array<{ dayNum: number }>;
  title?: any;
}

const PHASE_NAMES: Record<number, string> = {
  1: "ISTQB Foundation",
  2: "JavaScript Core",
  3: "Cypress Automation",
  4: "API Testing"
};

export function lessonsPerWeek(student: StudentRecord): number {
  if (!student.registrationDate) return 0;
  const started = new Date(student.registrationDate).getTime();
  const weeks = Math.max(1, (Date.now() - started) / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, Math.round(student.completedLessons.length / weeks));
}

export function estimateWeeksRemaining(student: StudentRecord): number {
  const pace = Math.max(1, lessonsPerWeek(student));
  return Math.ceil(student.remainingLessons / pace);
}

export function phaseProgress(student: StudentRecord, weeks: WeekLike[]) {
  const byPhase = new Map<number, { total: number; done: number }>();

  weeks.forEach((week) => {
    const state = byPhase.get(week.phase) || { total: 0, done: 0 };
    week.days.forEach((day) => {
      state.total += 1;
      if (student.completedLessons.includes(`w${week.num}d${day.dayNum}`)) {
        state.done += 1;
      }
    });
    byPhase.set(week.phase, state);
  });

  return [...byPhase.entries()]
    .map(([phase, value]) => ({
      phase,
      name: PHASE_NAMES[phase] || `Phase ${phase}`,
      pct: value.total ? Math.round((value.done / value.total) * 100) : 0,
      total: value.total,
      done: value.done
    }))
    .sort((a, b) => a.phase - b.phase);
}

export function weakestPhase(student: StudentRecord, weeks: WeekLike[]) {
  const phases = phaseProgress(student, weeks).filter((p) => p.total > 0);
  return phases.sort((a, b) => a.pct - b.pct)[0] || null;
}

export function nextIncompleteWeek(student: StudentRecord, weeks: WeekLike[]) {
  for (const week of weeks) {
    const allDone = week.days.every((day) => student.completedLessons.includes(`w${week.num}d${day.dayNum}`));
    if (!allDone) return week;
  }
  return null;
}

export function cohortMetrics(students: StudentRecord[]) {
  const studentOnly = students.filter((s) => s.role === "student");
  const active7d = studentOnly.filter((s) => {
    if (!s.lastActivity) return false;
    return Date.now() - new Date(s.lastActivity).getTime() <= 1000 * 60 * 60 * 24 * 7;
  }).length;

  const risk = studentOnly.filter((s) => s.progressPct < 35 || s.status !== "active").length;
  const velocity = studentOnly.length
    ? Math.round(studentOnly.reduce((acc, item) => acc + lessonsPerWeek(item), 0) / studentOnly.length)
    : 0;

  return {
    total: studentOnly.length,
    active7d,
    risk,
    velocity
  };
}
