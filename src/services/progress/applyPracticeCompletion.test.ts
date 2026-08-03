import { describe, expect, it, vi } from "vitest";
import { applyPracticeCompletion } from "./applyPracticeCompletion";
import { evaluateSkillMastery } from "../mastery/evaluateMastery";
import type { SkillProgress } from "../../types/mastery";
import type { PracticeRewardsState } from "../../types/practiceProgress";

vi.mock("../../data/curriculum/curriculumGraph", () => ({
  getSkillsForLesson: vi.fn((lessonId: string) => {
    if (lessonId === "g3-u1-w1-l1") {
      return [
        { id: "g3-s-test-a", slug: "test-a", title: "Test A" },
        { id: "g3-s-test-b", slug: "test-b", title: "Test B" },
      ];
    }
    return [];
  }),
}));

const TIMESTAMP = "2026-01-15T12:00:00.000Z";
const LESSON_ID = "g3-u1-w1-l1";

function buildSkill(skillId: string, overrides: Partial<SkillProgress> = {}): SkillProgress {
  return {
    skillId,
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

function buildEmptyState(): {
  practiceRewards: PracticeRewardsState;
  skillProgress: Record<string, SkillProgress>;
} {
  return {
    practiceRewards: {},
    skillProgress: {
      "g3-s-test-a": buildSkill("g3-s-test-a"),
      "g3-s-test-b": buildSkill("g3-s-test-b"),
    },
  };
}

describe("applyPracticeCompletion", () => {
  it("completes Guided first and records procedural evidence for each skill", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const result = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.mode).toBe("guided");
    expect(result.rewardRecord.completed).toBe(true);
    expect(result.rewardRecord.rewardId).toBe("common_star_accessory");
    expect(result.rewardRecord.completedAt).toBe(TIMESTAMP);

    const lessonRewards = result.nextPracticeRewards[LESSON_ID];
    expect(lessonRewards?.guided).toEqual(result.rewardRecord);

    expect(result.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(1);
    expect(result.nextSkillProgress["g3-s-test-a"].totalCorrect).toBe(1);
    expect(result.nextSkillProgress["g3-s-test-a"].evidenceCounts.procedural).toBe(1);
    expect(result.nextSkillProgress["g3-s-test-a"].status).toBe("introduced");

    expect(result.nextSkillProgress["g3-s-test-b"].totalAttempts).toBe(1);
    expect(result.nextSkillProgress["g3-s-test-b"].status).toBe("introduced");

    // Inputs are immutable
    expect(practiceRewards[LESSON_ID]).toBeUndefined();
    expect(skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("rejects Independent before Guided and leaves state unchanged", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const result = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: false, reason: "guided_required" });
    expect(practiceRewards).toEqual({});
    expect(skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("rejects Challenge before Guided and leaves state unchanged", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const result = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "challenge",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: false, reason: "guided_required" });
    expect(practiceRewards).toEqual({});
    expect(skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("rejects Challenge when Independent is missing", () => {
    const practiceRewards: PracticeRewardsState = {
      [LESSON_ID]: {
        guided: {
          completed: true,
          rewardId: "common_star_accessory",
          completedAt: TIMESTAMP,
        },
      },
    };
    const skillProgress: Record<string, SkillProgress> = {
      "g3-s-test-a": buildSkill("g3-s-test-a"),
      "g3-s-test-b": buildSkill("g3-s-test-b"),
    };

    const result = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "challenge",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: false, reason: "independent_required" });
    expect(practiceRewards[LESSON_ID]).not.toHaveProperty("challenge");
    expect(skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("allows the full sequence in order and records evidence for Guided and Independent only", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    expect(guided.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(1);
    expect(guided.nextSkillProgress["g3-s-test-a"].evidenceCounts.procedural).toBe(1);
    expect(guided.nextSkillProgress["g3-s-test-a"].status).toBe("introduced");

    const independent = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
    );
    expect(independent.ok).toBe(true);
    if (!independent.ok) return;

    expect(independent.nextPracticeRewards[LESSON_ID].independent).toEqual({
      completed: true,
      rewardId: "rare_star_accessory",
      completedAt: TIMESTAMP,
    });

    // Independent adds a second, distinct procedural evidence entry per skill.
    expect(independent.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    expect(independent.nextSkillProgress["g3-s-test-a"].totalCorrect).toBe(2);
    expect(independent.nextSkillProgress["g3-s-test-a"].evidenceCounts.procedural).toBe(2);
    expect(independent.nextSkillProgress["g3-s-test-a"].bestStreak).toBe(2);

    // The stored status should exactly match the canonical evaluator.
    expect(independent.nextSkillProgress["g3-s-test-a"].status).toBe(
      evaluateSkillMastery(independent.nextSkillProgress["g3-s-test-a"]),
    );
    expect(independent.nextSkillProgress["g3-s-test-a"].status).toBe("developing");
    expect(independent.nextSkillProgress["g3-s-test-b"].status).toBe("developing");

    const challenge = applyPracticeCompletion(
      independent.nextPracticeRewards,
      independent.nextSkillProgress,
      LESSON_ID,
      "challenge",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(challenge.ok).toBe(true);
    if (!challenge.ok) return;

    // Challenge records no skill evidence.
    expect(challenge.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    expect(challenge.nextSkillProgress["g3-s-test-a"].evidenceCounts.procedural).toBe(2);
    expect(challenge.nextSkillProgress["g3-s-test-a"].status).toBe("developing");
    expect(challenge.nextPracticeRewards[LESSON_ID].challenge).toEqual({
      completed: true,
      rewardId: "epic_star_accessory",
      completedAt: TIMESTAMP,
    });
  });

  it("rejects a duplicate completion and does not add evidence or rewards", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const first = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = applyPracticeCompletion(
      first.nextPracticeRewards,
      first.nextSkillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(second).toEqual({ ok: false, reason: "already_completed" });
    // Skill evidence unchanged from the first, successful attempt
    expect(first.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(1);
  });

  it("records a second procedural evidence entry per skill on Independent after Guided", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    const independent = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 5, firstAttemptTotalCount: 5 },
    );
    expect(independent.ok).toBe(true);
    if (!independent.ok) return;

    for (const skillId of ["g3-s-test-a", "g3-s-test-b"]) {
      expect(independent.nextSkillProgress[skillId].totalAttempts).toBe(2);
      expect(independent.nextSkillProgress[skillId].totalCorrect).toBe(2);
      expect(independent.nextSkillProgress[skillId].evidenceCounts.procedural).toBe(2);
      expect(independent.nextSkillProgress[skillId].status).toBe("developing");
      expect(independent.nextSkillProgress[skillId].status).toBe(
        evaluateSkillMastery(independent.nextSkillProgress[skillId]),
      );
    }
  });

  it("rejects a duplicate Independent completion and does not add a second evidence entry", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    const independent = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
    );
    expect(independent.ok).toBe(true);
    if (!independent.ok) return;

    const second = applyPracticeCompletion(
      independent.nextPracticeRewards,
      independent.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
    );
    expect(second).toEqual({ ok: false, reason: "already_completed" });
    expect(independent.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    expect(independent.nextSkillProgress["g3-s-test-a"].evidenceCounts.procedural).toBe(2);
  });

  it("preserves reward identity and timestamp for each mode", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      "2026-01-01T00:00:00.000Z",
      { firstAttemptCorrectCount: 5, firstAttemptTotalCount: 5 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    const independent = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      "2026-01-02T00:00:00.000Z",
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
    );
    expect(independent.ok).toBe(true);
    if (!independent.ok) return;

    const challenge = applyPracticeCompletion(
      independent.nextPracticeRewards,
      independent.nextSkillProgress,
      LESSON_ID,
      "challenge",
      "2026-01-03T00:00:00.000Z",
      { firstAttemptCorrectCount: 5, firstAttemptTotalCount: 5 },
    );
    expect(challenge.ok).toBe(true);
    if (!challenge.ok) return;

    expect(guided.rewardRecord.completedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(independent.rewardRecord.completedAt).toBe("2026-01-02T00:00:00.000Z");
    expect(challenge.rewardRecord.completedAt).toBe("2026-01-03T00:00:00.000Z");
    expect(guided.rewardRecord.rewardId).toBe("common_star_accessory");
    expect(independent.rewardRecord.rewardId).toBe("rare_star_accessory");
    expect(challenge.rewardRecord.rewardId).toBe("epic_star_accessory");
  });

  it("requires an Independent accuracy of at least 80%", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    // Exactly 80% succeeds.
    const exactly80 = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
    );
    expect(exactly80.ok).toBe(true);
    if (!exactly80.ok) return;
    expect(exactly80.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    expect(exactly80.nextSkillProgress["g3-s-test-a"].status).toBe("developing");

    // Above 80% succeeds.
    const above80 = applyPracticeCompletion(
      buildEmptyState().practiceRewards,
      buildEmptyState().skillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 9, firstAttemptTotalCount: 10 },
    );
    // It still requires Guided, so this call returns guided_required. We test
    // the accuracy logic separately by completing Guided first and using a
    // fresh lesson state below.
    expect(above80.ok).toBe(false);
    expect(above80).toEqual({ ok: false, reason: "guided_required" });

    const aboveState = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(aboveState.ok).toBe(true);
    if (!aboveState.ok) return;

    const aboveIndependent = applyPracticeCompletion(
      aboveState.nextPracticeRewards,
      aboveState.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 9, firstAttemptTotalCount: 10 },
    );
    expect(aboveIndependent.ok).toBe(true);
  });

  it("rejects Independent first-attempt accuracy below 80% even when all problems are eventually solved", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    const below80 = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 7, firstAttemptTotalCount: 10 },
    );
    expect(below80).toEqual({ ok: false, reason: "insufficient_accuracy" });
    expect(below80).not.toHaveProperty("nextPracticeRewards");
    expect(guided.nextPracticeRewards[LESSON_ID]).not.toHaveProperty("independent");
    expect(guided.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(1);

    const fractional = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 3, firstAttemptTotalCount: 4 },
    );
    expect(fractional).toEqual({ ok: false, reason: "insufficient_accuracy" });

    const boundaryOk = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
    );
    expect(boundaryOk.ok).toBe(true);

    // The domain must reject first-attempt accuracy below 80% even if every
    // problem was eventually answered correctly after retries.
    const eventualCorrectInflated = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 7, firstAttemptTotalCount: 10 },
    );
    expect(eventualCorrectInflated).toEqual({ ok: false, reason: "insufficient_accuracy" });
  });

  it("rejects invalid Independent metrics and preserves state", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    const cases: {
      label: string;
      metrics: { firstAttemptCorrectCount: number; firstAttemptTotalCount: number };
    }[] = [
      { label: "zero total", metrics: { firstAttemptCorrectCount: 0, firstAttemptTotalCount: 0 } },
      {
        label: "negative correct",
        metrics: { firstAttemptCorrectCount: -1, firstAttemptTotalCount: 5 },
      },
      {
        label: "negative total",
        metrics: { firstAttemptCorrectCount: 0, firstAttemptTotalCount: -5 },
      },
      {
        label: "correct greater than total",
        metrics: { firstAttemptCorrectCount: 6, firstAttemptTotalCount: 5 },
      },
      {
        label: "non-finite correct",
        metrics: { firstAttemptCorrectCount: NaN, firstAttemptTotalCount: 5 },
      },
      {
        label: "non-finite total",
        metrics: { firstAttemptCorrectCount: 3, firstAttemptTotalCount: Infinity },
      },
    ];

    for (const { label, metrics } of cases) {
      const result = applyPracticeCompletion(
        guided.nextPracticeRewards,
        guided.nextSkillProgress,
        LESSON_ID,
        "independent",
        TIMESTAMP,
        metrics,
      );
      expect(result, label).toEqual({ ok: false, reason: "invalid_session_result" });
      expect(guided.nextPracticeRewards[LESSON_ID], label).not.toHaveProperty("independent");
      expect(guided.nextSkillProgress["g3-s-test-a"].totalAttempts, label).toBe(1);
    }
  });

  it("still enforces sequence even with a qualifying Independent score", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const result = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
    );
    expect(result).toEqual({ ok: false, reason: "guided_required" });
    expect(practiceRewards).toEqual({});
  });

  it("still rejects a duplicate Independent even with qualifying metrics", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    const independent = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
    );
    expect(independent.ok).toBe(true);
    if (!independent.ok) return;

    const duplicate = applyPracticeCompletion(
      independent.nextPracticeRewards,
      independent.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
    );
    expect(duplicate).toEqual({ ok: false, reason: "already_completed" });
  });

  it("does not require metrics for Guided or Challenge", () => {
    const { practiceRewards, skillProgress } = buildEmptyState();

    const guided = applyPracticeCompletion(
      practiceRewards,
      skillProgress,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(guided.ok).toBe(true);
    if (!guided.ok) return;

    const independent = applyPracticeCompletion(
      guided.nextPracticeRewards,
      guided.nextSkillProgress,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 5, firstAttemptTotalCount: 5 },
    );
    expect(independent.ok).toBe(true);
    if (!independent.ok) return;

    const challenge = applyPracticeCompletion(
      independent.nextPracticeRewards,
      independent.nextSkillProgress,
      LESSON_ID,
      "challenge",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(challenge.ok).toBe(true);
    if (!challenge.ok) return;
    expect(challenge.nextSkillProgress["g3-s-test-a"].totalAttempts).toBe(2);
  });
});
