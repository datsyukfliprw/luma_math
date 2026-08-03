import { describe, it, expect } from "vitest";
import { applySkillEvidence } from "./applySkillEvidence";
import type { SkillEvidence, SkillProgress } from "../../types/mastery";

function buildSkill(overrides: Partial<SkillProgress> = {}): SkillProgress {
  return {
    skillId: "g3-s-test",
    status: "not_started",
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

function buildEvidence(overrides: Partial<SkillEvidence> & { timestamp: string }): SkillEvidence {
  return {
    skillId: "g3-s-test",
    evidenceType: "procedural",
    source: "test",
    correct: true,
    strength: 1,
    ...overrides,
    timestamp: overrides.timestamp,
  };
}

const TIMESTAMP = "2026-01-15T12:00:00.000Z";

describe("applySkillEvidence", () => {
  it("promotes a non-mastered skill through the canonical evaluator", () => {
    const current = buildSkill({
      status: "introduced",
      totalAttempts: 1,
      totalCorrect: 1,
      currentStreak: 1,
      bestStreak: 1,
      evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "procedural", correct: true, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("developing");
    expect(next.totalAttempts).toBe(2);
    expect(next.totalCorrect).toBe(2);
    expect(next.evidenceCounts.procedural).toBe(2);
  });

  it("regresses developing to introduced when updated evidence falls below the evaluator threshold", () => {
    const current = buildSkill({
      status: "developing",
      totalAttempts: 2,
      totalCorrect: 2,
      currentStreak: 2,
      bestStreak: 2,
      evidenceCounts: { conceptual: 0, procedural: 2, transfer: 0, retention: 0 },
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "procedural", correct: false, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("introduced");
    expect(next.totalAttempts).toBe(3);
    expect(next.totalCorrect).toBe(2);
    expect(next.evidenceCounts.procedural).toBe(3);
    expect(next.bestStreak).toBe(2);
    expect(next.currentStreak).toBe(0);
  });

  it("regresses provisionally_mastered when the evaluator result warrants it", () => {
    const current = buildSkill({
      status: "provisionally_mastered",
      totalAttempts: 3,
      totalCorrect: 3,
      currentStreak: 3,
      bestStreak: 3,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 0, retention: 0 },
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "procedural", correct: false, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("developing");
    expect(next.totalAttempts).toBe(4);
    expect(next.totalCorrect).toBe(3);
    expect(next.evidenceCounts.procedural).toBe(2);
    expect(next.bestStreak).toBe(3);
  });

  it("does not demote mastered with ordinary non-retention evidence", () => {
    const masteredAt = "2026-01-01T00:00:00.000Z";
    const current = buildSkill({
      status: "mastered",
      totalAttempts: 4,
      totalCorrect: 4,
      currentStreak: 4,
      bestStreak: 4,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 1, retention: 0 },
      masteredAt,
      refreshDueAt: "2026-01-01T00:00:00.000Z",
      successfulRetentionCount: 0,
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "procedural", correct: false, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("mastered");
    expect(next.masteredAt).toBe(masteredAt);
    expect(next.refreshDueAt).toBe(current.refreshDueAt);
    expect(next.totalAttempts).toBe(5);
    expect(next.totalCorrect).toBe(4);
  });

  it("does not demote refresh_scheduled with ordinary non-retention evidence", () => {
    const masteredAt = "2026-01-01T00:00:00.000Z";
    const refreshDueAt = "2026-01-01T00:00:00.000Z";
    const current = buildSkill({
      status: "refresh_scheduled",
      totalAttempts: 4,
      totalCorrect: 4,
      currentStreak: 4,
      bestStreak: 4,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 1, retention: 0 },
      masteredAt,
      refreshDueAt,
      successfulRetentionCount: 1,
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "procedural", correct: true, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("refresh_scheduled");
    expect(next.masteredAt).toBe(masteredAt);
    expect(next.refreshDueAt).toBe(refreshDueAt);
    expect(next.successfulRetentionCount).toBe(1);
    expect(next.totalAttempts).toBe(5);
    expect(next.totalCorrect).toBe(5);
  });

  it("reschedules a mastered skill on a successful retention review", () => {
    const masteredAt = "2026-01-01T00:00:00.000Z";
    const current = buildSkill({
      status: "mastered",
      totalAttempts: 4,
      totalCorrect: 4,
      bestStreak: 4,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 1, retention: 0 },
      masteredAt,
      refreshDueAt: "2026-01-10T00:00:00.000Z",
      successfulRetentionCount: 0,
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "retention", correct: true, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("mastered");
    expect(next.masteredAt).toBe(masteredAt);
    expect(next.successfulRetentionCount).toBe(1);
    expect(next.refreshDueAt).toBeDefined();
    expect(next.refreshDueAt).not.toBe(current.refreshDueAt);
  });

  it("regresses mastered to developing on a failed retention review", () => {
    const current = buildSkill({
      status: "mastered",
      totalAttempts: 4,
      totalCorrect: 4,
      bestStreak: 4,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 1, retention: 0 },
      masteredAt: "2026-01-01T00:00:00.000Z",
      refreshDueAt: "2026-01-10T00:00:00.000Z",
      successfulRetentionCount: 0,
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "retention", correct: false, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("developing");
    expect(next.masteredAt).toBeUndefined();
    expect(next.refreshDueAt).toBeUndefined();
    expect(next.successfulRetentionCount).toBe(0);
    expect(next.totalAttempts).toBe(5);
    expect(next.totalCorrect).toBe(4);
  });

  it("regresses refresh_scheduled to developing on a failed retention review", () => {
    const current = buildSkill({
      status: "refresh_scheduled",
      totalAttempts: 4,
      totalCorrect: 4,
      bestStreak: 4,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 1, retention: 0 },
      masteredAt: "2026-01-01T00:00:00.000Z",
      refreshDueAt: "2026-01-10T00:00:00.000Z",
      successfulRetentionCount: 1,
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "retention", correct: false, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("developing");
    expect(next.masteredAt).toBeUndefined();
    expect(next.refreshDueAt).toBeUndefined();
    expect(next.successfulRetentionCount).toBe(0);
  });

  it("returns a mastered skill from refresh_scheduled on a successful retention review", () => {
    const masteredAt = "2026-01-01T00:00:00.000Z";
    const current = buildSkill({
      status: "refresh_scheduled",
      totalAttempts: 4,
      totalCorrect: 4,
      bestStreak: 4,
      evidenceCounts: { conceptual: 1, procedural: 1, transfer: 1, retention: 0 },
      masteredAt,
      refreshDueAt: "2026-01-10T00:00:00.000Z",
      successfulRetentionCount: 1,
    });

    const next = applySkillEvidence(
      current,
      buildEvidence({ evidenceType: "retention", correct: true, timestamp: TIMESTAMP }),
    );

    expect(next.status).toBe("mastered");
    expect(next.masteredAt).toBe(masteredAt);
    expect(next.successfulRetentionCount).toBe(2);
    expect(next.refreshDueAt).toBeDefined();
    expect(next.refreshDueAt).not.toBe(current.refreshDueAt);
  });
});
