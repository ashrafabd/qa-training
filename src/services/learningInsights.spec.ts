import { describe, expect, it } from "vitest";
import { estimateWeeksRemaining, lessonsPerWeek } from "./learningInsights";

describe("learningInsights", () => {
  it("calculates a safe weekly pace and ETA", () => {
    const student = {
      registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      completedLessons: ["w1d1", "w1d2", "w1d3", "w1d4"],
      remainingLessons: 12
    } as any;

    const pace = lessonsPerWeek(student);
    const eta = estimateWeeksRemaining(student);

    expect(pace).toBeGreaterThan(0);
    expect(eta).toBeGreaterThan(0);
  });
});
