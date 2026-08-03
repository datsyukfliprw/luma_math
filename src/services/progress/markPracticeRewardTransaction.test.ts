import { describe, expect, it, vi } from "vitest";
import { markPracticeRewardTransaction } from "./markPracticeRewardTransaction";
import type { StudentState } from "../../contexts/StudentProgressContext";
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

function buildStudentState(overrides: Partial<StudentState> = {}): StudentState {
  return {
    lessonProgress: {},
    skillProgress: {
      "g3-s-test-a": buildSkill("g3-s-test-a"),
      "g3-s-test-b": buildSkill("g3-s-test-b"),
    },
    flashcardProgress: {},
    practiceRewards: {},
    starProfile: {
      studentName: "",
      grade: 3,
      starName: "",
      ownedItemIds: [],
      equipped: {},
      updatedAt: TIMESTAMP,
    },
    ...overrides,
  };
}

describe("markPracticeRewardTransaction", () => {
  it("atomically completes Guided and updates reward, evidence, mastery, and lesson progress", () => {
    const state = buildStudentState({
      lessonProgress: {
        [LESSON_ID]: {
          lessonId: LESSON_ID,
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: true,
          practiceComplete: false,
          lessonComplete: false,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: TIMESTAMP,
        },
      },
    });

    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "guided",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: true, mode: "guided" });

    expect(nextState.practiceRewards[LESSON_ID].guided).toEqual({
      completed: true,
      rewardId: "common_star_accessory",
      completedAt: TIMESTAMP,
    });

    expect(nextState.lessonProgress[LESSON_ID].practiceComplete).toBe(true);
    expect(nextState.lessonProgress[LESSON_ID].lessonComplete).toBe(true);
    expect(nextState.lessonProgress[LESSON_ID].updatedAt).toBe(TIMESTAMP);

    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(1);
    expect(nextState.skillProgress["g3-s-test-a"].status).toBe("introduced");
    expect(nextState.skillProgress["g3-s-test-b"].totalAttempts).toBe(1);
    expect(nextState.skillProgress["g3-s-test-b"].status).toBe("introduced");

    // Original state is untouched
    expect(state.practiceRewards).toEqual({});
    expect(state.lessonProgress[LESSON_ID].practiceComplete).toBe(false);
    expect(state.skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("rejects Independent before Guided and returns the same state", () => {
    const state = buildStudentState();

    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: false, reason: "guided_required" });
    expect(nextState).toBe(state);
    expect(nextState.practiceRewards).toEqual({});
    expect(nextState.lessonProgress).toEqual({});
    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("rejects Challenge when Independent is missing and returns the same state", () => {
    const state = buildStudentState({
      practiceRewards: {
        [LESSON_ID]: {
          guided: {
            completed: true,
            rewardId: "common_star_accessory",
            completedAt: TIMESTAMP,
          },
        },
      },
    });

    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "challenge",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: false, reason: "independent_required" });
    expect(nextState).toBe(state);
    expect(nextState.practiceRewards[LESSON_ID].challenge).toBeUndefined();
    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("succeeds for Independent after Guided, records evidence, and leaves lesson progress unchanged", () => {
    const state = buildStudentState({
      practiceRewards: {
        [LESSON_ID]: {
          guided: {
            completed: true,
            rewardId: "common_star_accessory",
            completedAt: TIMESTAMP,
          },
        },
      },
      lessonProgress: {
        [LESSON_ID]: {
          lessonId: LESSON_ID,
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: true,
          practiceComplete: true,
          lessonComplete: true,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: TIMESTAMP,
        },
      },
      skillProgress: {
        "g3-s-test-a": buildSkill("g3-s-test-a", {
          totalAttempts: 1,
          totalCorrect: 1,
          currentStreak: 1,
          bestStreak: 1,
          status: "introduced",
          evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
        }),
        "g3-s-test-b": buildSkill("g3-s-test-b", {
          totalAttempts: 1,
          totalCorrect: 1,
          currentStreak: 1,
          bestStreak: 1,
          status: "introduced",
          evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
        }),
      },
    });

    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
    );

    expect(result).toEqual({ ok: true, mode: "independent" });
    expect(nextState.practiceRewards[LESSON_ID].independent).toEqual({
      completed: true,
      rewardId: "rare_star_accessory",
      completedAt: TIMESTAMP,
    });

    // Lesson progress is not touched by Independent Practice.
    expect(nextState.lessonProgress).toBe(state.lessonProgress);
    expect(nextState.lessonProgress[LESSON_ID].practiceComplete).toBe(true);
    expect(nextState.lessonProgress[LESSON_ID].lessonComplete).toBe(true);

    // Independent adds a second procedural evidence entry and advances mastery.
    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    expect(nextState.skillProgress["g3-s-test-a"].totalCorrect).toBe(2);
    expect(nextState.skillProgress["g3-s-test-a"].evidenceCounts.procedural).toBe(2);
    expect(nextState.skillProgress["g3-s-test-a"].status).toBe("developing");
    expect(nextState.skillProgress["g3-s-test-b"].status).toBe("developing");
  });

  it("succeeds for Challenge after Guided and Independent with transfer evidence and unchanged lesson progress", () => {
    const state = buildStudentState({
      practiceRewards: {
        [LESSON_ID]: {
          guided: {
            completed: true,
            rewardId: "common_star_accessory",
            completedAt: TIMESTAMP,
          },
          independent: {
            completed: true,
            rewardId: "rare_star_accessory",
            completedAt: TIMESTAMP,
          },
        },
      },
      lessonProgress: {
        [LESSON_ID]: {
          lessonId: LESSON_ID,
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: true,
          practiceComplete: true,
          lessonComplete: true,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: TIMESTAMP,
        },
      },
    });

    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "challenge",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: true, mode: "challenge" });
    expect(nextState.practiceRewards[LESSON_ID].challenge).toEqual({
      completed: true,
      rewardId: "epic_star_accessory",
      completedAt: TIMESTAMP,
    });
    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(1);
    expect(nextState.skillProgress["g3-s-test-a"].evidenceCounts.transfer).toBe(1);
    expect(nextState.skillProgress["g3-s-test-b"].evidenceCounts.transfer).toBe(1);
    expect(nextState.lessonProgress).toBe(state.lessonProgress);
  });

  it("rejects Independent before Guided and records no evidence or lesson progress", () => {
    const state = buildStudentState({
      lessonProgress: {
        [LESSON_ID]: {
          lessonId: LESSON_ID,
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: true,
          practiceComplete: true,
          lessonComplete: true,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: TIMESTAMP,
        },
      },
    });

    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: false, reason: "guided_required" });
    expect(nextState).toBe(state);
    expect(nextState.practiceRewards).toEqual({});
    expect(nextState.lessonProgress[LESSON_ID].practiceComplete).toBe(true);
    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("prevents duplicate Independent rewards and evidence when called twice in rapid succession", () => {
    const state = buildStudentState({
      practiceRewards: {
        [LESSON_ID]: {
          guided: {
            completed: true,
            rewardId: "common_star_accessory",
            completedAt: TIMESTAMP,
          },
        },
      },
      lessonProgress: {
        [LESSON_ID]: {
          lessonId: LESSON_ID,
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: true,
          practiceComplete: true,
          lessonComplete: true,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: TIMESTAMP,
        },
      },
      skillProgress: {
        "g3-s-test-a": buildSkill("g3-s-test-a", {
          totalAttempts: 1,
          totalCorrect: 1,
          currentStreak: 1,
          bestStreak: 1,
          status: "introduced",
          evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
        }),
        "g3-s-test-b": buildSkill("g3-s-test-b", {
          totalAttempts: 1,
          totalCorrect: 1,
          currentStreak: 1,
          bestStreak: 1,
          status: "introduced",
          evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
        }),
      },
    });

    const first = markPracticeRewardTransaction(state, LESSON_ID, "independent", TIMESTAMP, {
      firstAttemptCorrectCount: 8,
      firstAttemptTotalCount: 10,
    });
    expect(first.result).toEqual({ ok: true, mode: "independent" });
    expect(first.nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    expect(first.nextState.skillProgress["g3-s-test-a"].status).toBe("developing");

    const second = markPracticeRewardTransaction(
      first.nextState,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );
    expect(second.result).toEqual({ ok: false, reason: "already_completed" });
    expect(second.nextState).toBe(first.nextState);
    expect(second.nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    expect(second.nextState.skillProgress["g3-s-test-a"].evidenceCounts.procedural).toBe(2);
  });

  it("preserves historical out-of-order progress and rejects new invalid attempts", () => {
    const historicalRewards: PracticeRewardsState = {
      [LESSON_ID]: {
        independent: {
          completed: true,
          rewardId: "rare_star_accessory",
          completedAt: TIMESTAMP,
        },
      },
    };

    const state = buildStudentState({ practiceRewards: historicalRewards });

    // A new Challenge attempt on the historical state still requires Guided.
    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "challenge",
      TIMESTAMP,
      { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
    );

    expect(result).toEqual({ ok: false, reason: "guided_required" });
    expect(nextState.practiceRewards[LESSON_ID]).toEqual(historicalRewards[LESSON_ID]);
    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(0);
  });

  it("rejects Independent below 80% and preserves the entire StudentState", () => {
    const state = buildStudentState({
      practiceRewards: {
        [LESSON_ID]: {
          guided: {
            completed: true,
            rewardId: "common_star_accessory",
            completedAt: TIMESTAMP,
          },
        },
      },
      skillProgress: {
        "g3-s-test-a": buildSkill("g3-s-test-a", {
          totalAttempts: 1,
          totalCorrect: 1,
          currentStreak: 1,
          bestStreak: 1,
          status: "introduced",
          evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
        }),
        "g3-s-test-b": buildSkill("g3-s-test-b", {
          totalAttempts: 1,
          totalCorrect: 1,
          currentStreak: 1,
          bestStreak: 1,
          status: "introduced",
          evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
        }),
      },
    });

    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 7, firstAttemptTotalCount: 10 },
    );

    expect(result).toEqual({
      ok: false,
      reason: "insufficient_accuracy",
      accuracy: 0.7,
      requiredAccuracy: 0.8,
    });
    expect(nextState).toBe(state);
    expect(nextState.practiceRewards[LESSON_ID]).not.toHaveProperty("independent");
    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(1);
    expect(nextState.skillProgress["g3-s-test-a"].status).toBe("introduced");
  });

  it("rejects invalid Independent metrics and preserves the entire StudentState", () => {
    const state = buildStudentState({
      practiceRewards: {
        [LESSON_ID]: {
          guided: {
            completed: true,
            rewardId: "common_star_accessory",
            completedAt: TIMESTAMP,
          },
        },
      },
    });

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
        label: "correct greater than total",
        metrics: { firstAttemptCorrectCount: 6, firstAttemptTotalCount: 5 },
      },
      {
        label: "non-finite values",
        metrics: { firstAttemptCorrectCount: NaN, firstAttemptTotalCount: 5 },
      },
    ];

    for (const { label, metrics } of cases) {
      const { result, nextState } = markPracticeRewardTransaction(
        state,
        LESSON_ID,
        "independent",
        TIMESTAMP,
        metrics,
      );
      expect(result, label).toEqual({ ok: false, reason: "invalid_session_result" });
      expect(nextState, label).toBe(state);
      expect(nextState.practiceRewards[LESSON_ID], label).not.toHaveProperty("independent");
      expect(nextState.skillProgress["g3-s-test-a"].totalAttempts, label).toBe(0);
    }
  });

  it("atomically records a qualifying Independent reward, evidence, and mastery in one state", () => {
    const state = buildStudentState({
      practiceRewards: {
        [LESSON_ID]: {
          guided: {
            completed: true,
            rewardId: "common_star_accessory",
            completedAt: TIMESTAMP,
          },
        },
      },
      skillProgress: {
        "g3-s-test-a": buildSkill("g3-s-test-a", {
          totalAttempts: 1,
          totalCorrect: 1,
          currentStreak: 1,
          bestStreak: 1,
          status: "introduced",
          evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
        }),
        "g3-s-test-b": buildSkill("g3-s-test-b", {
          totalAttempts: 1,
          totalCorrect: 1,
          currentStreak: 1,
          bestStreak: 1,
          status: "introduced",
          evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
        }),
      },
    });

    const { result, nextState } = markPracticeRewardTransaction(
      state,
      LESSON_ID,
      "independent",
      TIMESTAMP,
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
    );

    expect(result).toEqual({ ok: true, mode: "independent" });
    expect(nextState.practiceRewards[LESSON_ID].independent).toEqual({
      completed: true,
      rewardId: "rare_star_accessory",
      completedAt: TIMESTAMP,
    });
    expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    expect(nextState.skillProgress["g3-s-test-a"].status).toBe("developing");
    expect(nextState.lessonProgress).toBe(state.lessonProgress);
  });

  describe("Challenge transaction", () => {
    it("succeeds after Guided and Independent and creates a Challenge reward with transfer evidence and mastery reevaluation", () => {
      const state = buildStudentState({
        practiceRewards: {
          [LESSON_ID]: {
            guided: {
              completed: true,
              rewardId: "common_star_accessory",
              completedAt: TIMESTAMP,
            },
            independent: {
              completed: true,
              rewardId: "rare_star_accessory",
              completedAt: TIMESTAMP,
            },
          },
        },
        skillProgress: {
          "g3-s-test-a": buildSkill("g3-s-test-a", {
            totalAttempts: 2,
            totalCorrect: 2,
            currentStreak: 2,
            bestStreak: 2,
            status: "developing",
            evidenceCounts: { conceptual: 0, procedural: 2, transfer: 0, retention: 0 },
          }),
          "g3-s-test-b": buildSkill("g3-s-test-b", {
            totalAttempts: 2,
            totalCorrect: 2,
            currentStreak: 2,
            bestStreak: 2,
            status: "developing",
            evidenceCounts: { conceptual: 0, procedural: 2, transfer: 0, retention: 0 },
          }),
        },
      });

      const { result, nextState } = markPracticeRewardTransaction(
        state,
        LESSON_ID,
        "challenge",
        TIMESTAMP,
        { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
      );

      expect(result).toEqual({ ok: true, mode: "challenge" });
      expect(nextState.practiceRewards[LESSON_ID].challenge).toEqual({
        completed: true,
        rewardId: "epic_star_accessory",
        completedAt: TIMESTAMP,
      });
      expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(3);
      expect(nextState.skillProgress["g3-s-test-a"].totalCorrect).toBe(3);
      expect(nextState.skillProgress["g3-s-test-a"].bestStreak).toBe(3);
      expect(nextState.skillProgress["g3-s-test-a"].evidenceCounts.procedural).toBe(2);
      expect(nextState.skillProgress["g3-s-test-a"].evidenceCounts.transfer).toBe(1);
      expect(nextState.skillProgress["g3-s-test-b"].evidenceCounts.transfer).toBe(1);
      expect(nextState.skillProgress["g3-s-test-a"].status).toBe("developing");
      expect(nextState.lessonProgress).toBe(state.lessonProgress);
    });

    it("rejects Challenge below 80% first-attempt accuracy and preserves the entire StudentState", () => {
      const state = buildStudentState({
        practiceRewards: {
          [LESSON_ID]: {
            guided: {
              completed: true,
              rewardId: "common_star_accessory",
              completedAt: TIMESTAMP,
            },
            independent: {
              completed: true,
              rewardId: "rare_star_accessory",
              completedAt: TIMESTAMP,
            },
          },
        },
        skillProgress: {
          "g3-s-test-a": buildSkill("g3-s-test-a", {
            totalAttempts: 2,
            totalCorrect: 2,
            currentStreak: 2,
            bestStreak: 2,
            status: "developing",
            evidenceCounts: { conceptual: 0, procedural: 2, transfer: 0, retention: 0 },
          }),
        },
      });

      const { result, nextState } = markPracticeRewardTransaction(
        state,
        LESSON_ID,
        "challenge",
        TIMESTAMP,
        { firstAttemptCorrectCount: 7, firstAttemptTotalCount: 10 },
      );

      expect(result).toEqual({
        ok: false,
        reason: "insufficient_accuracy",
        accuracy: 0.7,
        requiredAccuracy: 0.8,
      });
      expect(nextState).toBe(state);
      expect(nextState.practiceRewards[LESSON_ID]).not.toHaveProperty("challenge");
      expect(nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(2);
    });

    it("rejects invalid Challenge metrics and preserves the entire StudentState", () => {
      const state = buildStudentState({
        practiceRewards: {
          [LESSON_ID]: {
            guided: {
              completed: true,
              rewardId: "common_star_accessory",
              completedAt: TIMESTAMP,
            },
            independent: {
              completed: true,
              rewardId: "rare_star_accessory",
              completedAt: TIMESTAMP,
            },
          },
        },
      });

      const { result, nextState } = markPracticeRewardTransaction(
        state,
        LESSON_ID,
        "challenge",
        TIMESTAMP,
        { firstAttemptCorrectCount: 6, firstAttemptTotalCount: 5 },
      );

      expect(result).toEqual({ ok: false, reason: "invalid_session_result" });
      expect(nextState).toBe(state);
      expect(nextState.practiceRewards[LESSON_ID]).not.toHaveProperty("challenge");
    });

    it("prevents duplicate Challenge rewards when called twice in rapid succession", () => {
      const state = buildStudentState({
        practiceRewards: {
          [LESSON_ID]: {
            guided: {
              completed: true,
              rewardId: "common_star_accessory",
              completedAt: TIMESTAMP,
            },
            independent: {
              completed: true,
              rewardId: "rare_star_accessory",
              completedAt: TIMESTAMP,
            },
          },
        },
      });

      const first = markPracticeRewardTransaction(state, LESSON_ID, "challenge", TIMESTAMP, {
        firstAttemptCorrectCount: 8,
        firstAttemptTotalCount: 10,
      });
      expect(first.result).toEqual({ ok: true, mode: "challenge" });
      expect(first.nextState.practiceRewards[LESSON_ID].challenge).toEqual({
        completed: true,
        rewardId: "epic_star_accessory",
        completedAt: TIMESTAMP,
      });
      expect(first.nextState.skillProgress["g3-s-test-a"].totalAttempts).toBe(1);
      expect(first.nextState.skillProgress["g3-s-test-a"].evidenceCounts.transfer).toBe(1);

      const second = markPracticeRewardTransaction(
        first.nextState,
        LESSON_ID,
        "challenge",
        TIMESTAMP,
        { firstAttemptCorrectCount: 1, firstAttemptTotalCount: 1 },
      );
      expect(second.result).toEqual({ ok: false, reason: "already_completed" });
      expect(second.nextState).toBe(first.nextState);
      expect(second.nextState.skillProgress["g3-s-test-a"].evidenceCounts.transfer).toBe(1);
    });

    it("rejects Challenge before Guided and before Independent", () => {
      const missingGuided = markPracticeRewardTransaction(
        buildStudentState(),
        LESSON_ID,
        "challenge",
        TIMESTAMP,
        { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
      );
      expect(missingGuided.result).toEqual({ ok: false, reason: "guided_required" });
      expect(missingGuided.nextState.practiceRewards).toEqual({});

      const missingIndependent = markPracticeRewardTransaction(
        buildStudentState({
          practiceRewards: {
            [LESSON_ID]: {
              guided: {
                completed: true,
                rewardId: "common_star_accessory",
                completedAt: TIMESTAMP,
              },
            },
          },
        }),
        LESSON_ID,
        "challenge",
        TIMESTAMP,
        { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
      );
      expect(missingIndependent.result).toEqual({
        ok: false,
        reason: "independent_required",
      });
    });
  });
});
