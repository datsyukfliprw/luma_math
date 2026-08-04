import { describe, it, expect } from "vitest";
import { applyEvaluationCompletion } from "./applyEvaluationCompletion";
import type { StudentState } from "../../contexts/StudentProgressContext";
import type { EvaluationCompletionMetrics } from "../../types/evaluationProgress";

function emptyState(overrides?: Partial<StudentState>): StudentState {
  return {
    lessonProgress: {},
    skillProgress: {},
    flashcardProgress: {},
    practiceRewards: {},
    evaluationCompletions: {},
    starProfile: {
      studentName: "",
      grade: 3,
      starName: "",
      ownedItemIds: [],
      equipped: {},
      updatedAt: "2026-01-01T12:00:00.000Z",
    },
    ...overrides,
  };
}

const timestamp = "2026-01-01T12:00:00.000Z";

describe("applyEvaluationCompletion", () => {
  it("passes at exactly 80% (4 / 5)", () => {
    const state = emptyState();
    const metrics: EvaluationCompletionMetrics = {
      firstAttemptCorrectCount: 4,
      firstAttemptTotalCount: 5,
    };

    const { result, nextState } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      metrics,
      timestamp,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Unexpected failure");
    expect(result.accuracy).toBe(0.8);
    expect(result.requiredAccuracy).toBe(0.8);
    expect(result.evaluationLessonId).toBe("g3-u1-w1-eval");
    expect(nextState.evaluationCompletions["g3-u1-w1-eval"]).toBeDefined();
    expect(nextState.evaluationCompletions["g3-u1-w1-eval"].firstAttemptCorrectCount).toBe(4);
    expect(nextState.evaluationCompletions["g3-u1-w1-eval"].firstAttemptTotalCount).toBe(5);
  });

  it("passes at 8 / 10", () => {
    const state = emptyState();
    const { result } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
      timestamp,
    );
    expect(result.ok).toBe(true);
  });

  it("passes at 9 / 10", () => {
    const state = emptyState();
    const { result } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 9, firstAttemptTotalCount: 10 },
      timestamp,
    );
    expect(result.ok).toBe(true);
  });

  it("fails below 80% (3 / 5)", () => {
    const state = emptyState();
    const { result, nextState } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 3, firstAttemptTotalCount: 5 },
      timestamp,
    );

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Unexpected success");
    expect(result.reason).toBe("insufficient_accuracy");
    expect(result.accuracy).toBe(0.6);
    expect(result.requiredAccuracy).toBe(0.8);
    expect(nextState).toBe(state);
    expect(nextState.evaluationCompletions["g3-u1-w1-eval"]).toBeUndefined();
  });

  it("fails at 7 / 9 and passes at 8 / 9", () => {
    const state = emptyState();
    const fail = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 7, firstAttemptTotalCount: 9 },
      timestamp,
    );
    expect(fail.result.ok).toBe(false);
    if (!fail.result.ok) {
      expect(fail.result.reason).toBe("insufficient_accuracy");
    }

    const pass = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 9 },
      timestamp,
    );
    expect(pass.result.ok).toBe(true);
  });

  it("rejects zero total count", () => {
    const state = emptyState();
    const { result } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 0, firstAttemptTotalCount: 0 },
      timestamp,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid_session_result");
  });

  it("rejects negative correct count", () => {
    const state = emptyState();
    const { result } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: -1, firstAttemptTotalCount: 5 },
      timestamp,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid_session_result");
  });

  it("rejects correct count greater than total", () => {
    const state = emptyState();
    const { result } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 6, firstAttemptTotalCount: 5 },
      timestamp,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid_session_result");
  });

  it("rejects NaN and Infinity values", () => {
    const state = emptyState();
    const nan = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: NaN, firstAttemptTotalCount: 5 },
      timestamp,
    );
    expect(nan.result.ok).toBe(false);

    const infinity = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: Infinity },
      timestamp,
    );
    expect(infinity.result.ok).toBe(false);
  });

  it("rejects fractional counts", () => {
    const state = emptyState();
    const { result } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 4.5, firstAttemptTotalCount: 5 },
      timestamp,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid_session_result");
  });

  it("rejects unknown lesson ID", () => {
    const state = emptyState();
    const { result } = applyEvaluationCompletion(
      state,
      "g3-u999-w1-eval",
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
      timestamp,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("evaluation_not_found");
  });

  it("rejects a non-evaluation lesson", () => {
    const state = emptyState();
    const { result } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-l1",
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
      timestamp,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not_an_evaluation");
  });

  it("is idempotent for duplicate completion", () => {
    const first = applyEvaluationCompletion(
      emptyState(),
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
      timestamp,
    );
    expect(first.result.ok).toBe(true);

    const second = applyEvaluationCompletion(
      first.nextState,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 0, firstAttemptTotalCount: 0 },
      timestamp,
    );

    expect(second.result.ok).toBe(false);
    if (!second.result.ok) expect(second.result.reason).toBe("already_completed");
    expect(second.nextState).toBe(first.nextState);
  });

  it("does not alter practice rewards, skill progress, lesson progress, or flashcard progress", () => {
    const state = emptyState({
      lessonProgress: {
        "g3-u1-w1-l1": {
          lessonId: "g3-u1-w1-l1",
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: true,
          practiceComplete: true,
          lessonComplete: true,
          correctAnswers: 5,
          totalQuestions: 5,
          updatedAt: timestamp,
        },
      },
      practiceRewards: {
        "g3-u1-w1-l1": {
          guided: { completed: true, rewardId: "common_star_accessory", completedAt: timestamp },
        },
      },
    });

    const { nextState } = applyEvaluationCompletion(
      state,
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 4, firstAttemptTotalCount: 5 },
      timestamp,
    );

    expect(nextState.lessonProgress).toBe(state.lessonProgress);
    expect(nextState.practiceRewards).toBe(state.practiceRewards);
    expect(nextState.skillProgress).toBe(state.skillProgress);
    expect(nextState.flashcardProgress).toBe(state.flashcardProgress);
  });
});
