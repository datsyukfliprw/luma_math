import { describe, it, expect } from "vitest";
import { evaluateSkillMastery } from "./evaluateMastery";
import type { SkillProgress } from "../../types/mastery";

function buildSkill(overrides: Partial<SkillProgress> = {}): SkillProgress {
  return {
    skillId: "g3-s-test",
    status: overrides.status ?? "not_started",
    evidenceCounts: { conceptual: 0, procedural: 0, transfer: 0, retention: 0 },
    totalCorrect: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    masteryCheckAttempts: 0,
    masteryCheckPassed: false,
    successfulRetentionCount: 0,
    ...overrides,
  };
}

describe("evaluateSkillMastery", () => {
  it("stays not_started with no attempts", () => {
    expect(evaluateSkillMastery(buildSkill())).toBe("not_started");
  });

  it("becomes introduced after one correct attempt", () => {
    const progress = buildSkill({
      totalAttempts: 1,
      totalCorrect: 1,
      currentStreak: 1,
      bestStreak: 1,
      evidenceCounts: { conceptual: 1, procedural: 0, transfer: 0, retention: 0 },
    });

    expect(evaluateSkillMastery(progress)).toBe("introduced");
  });

  it("becomes developing after two correct attempts with procedural evidence", () => {
    const progress = buildSkill({
      totalAttempts: 2,
      totalCorrect: 2,
      currentStreak: 2,
      bestStreak: 2,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 0, retention: 0 },
    });

    expect(evaluateSkillMastery(progress)).toBe("developing");
  });

  it("becomes provisionally mastered after three strong attempts with conceptual and procedural evidence", () => {
    const progress = buildSkill({
      totalAttempts: 3,
      totalCorrect: 3,
      currentStreak: 3,
      bestStreak: 3,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 0, retention: 0 },
    });

    expect(evaluateSkillMastery(progress)).toBe("provisionally_mastered");
  });

  it("becomes mastered only after transfer evidence and high accuracy", () => {
    const progress = buildSkill({
      totalAttempts: 4,
      totalCorrect: 4,
      currentStreak: 4,
      bestStreak: 4,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 1, retention: 0 },
    });

    expect(evaluateSkillMastery(progress)).toBe("mastered");
  });
});
