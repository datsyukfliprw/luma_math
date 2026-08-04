import { describe, it, expect } from "vitest";
import { getAllCurricula } from "../curriculum";
import { applyEvaluationCompletion } from "../../services/progress/applyEvaluationCompletion";
import {
  getPreviousUnitEvaluationLessonId,
  isFirstLessonOfUnitUnlocked,
} from "../../services/progress/evaluationProgression";
import type { StudentState } from "../../contexts/StudentProgressContext";

function baseStarProfile() {
  return {
    studentName: "",
    grade: 3,
    starName: "",
    ownedItemIds: [],
    equipped: {},
    updatedAt: "2026-01-01T12:00:00.000Z",
  };
}

function emptyState(): StudentState {
  return {
    lessonProgress: {},
    skillProgress: {},
    flashcardProgress: {},
    practiceRewards: {},
    evaluationCompletions: {},
    starProfile: baseStarProfile(),
  };
}

const timestamp = "2026-01-01T12:00:00.000Z";

describe("Grade 3 evaluation completion contract", () => {
  const grade3 = getAllCurricula().filter((c) => c.grade_level === 3);
  const evaluationLessons = grade3.flatMap((unit) =>
    unit.weeks.flatMap((week) =>
      week.lessons
        .filter((lesson) => lesson.lesson_type === "evaluation")
        .map((lesson) => ({ unit: unit.unit_number, lesson })),
    ),
  );

  it("discovers all 36 Grade 3 evaluations", () => {
    expect(evaluationLessons).toHaveLength(36);
  });

  it.each(evaluationLessons.map((entry) => [entry.unit, entry.lesson.lesson_id]))(
    "Unit %s evaluation %s accepts passing metrics and records a completion",
    (_unit, lessonId) => {
      const count = (lessonId as string).startsWith("g3-u36") ? 10 : 8;
      const { result, nextState } = applyEvaluationCompletion(
        emptyState(),
        lessonId as string,
        { firstAttemptCorrectCount: count - 1, firstAttemptTotalCount: count },
        timestamp,
      );

      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(`Unexpected failure for ${lessonId}`);

      expect(result.evaluationLessonId).toBe(lessonId);
      expect(result.accuracy).toBeGreaterThanOrEqual(0.8);
      expect(result.completion.firstAttemptCorrectCount).toBe(count - 1);
      expect(result.completion.firstAttemptTotalCount).toBe(count);
      expect(nextState.evaluationCompletions[lessonId as string]).toBeDefined();
    },
  );

  it.each(evaluationLessons.map((entry) => [entry.unit, entry.lesson.lesson_id]))(
    "Unit %s evaluation %s rejects failing metrics and leaves state unchanged",
    (_unit, lessonId) => {
      const count = (lessonId as string).startsWith("g3-u36") ? 10 : 8;
      const state = emptyState();
      const { result, nextState } = applyEvaluationCompletion(
        state,
        lessonId as string,
        { firstAttemptCorrectCount: 1, firstAttemptTotalCount: count },
        timestamp,
      );

      expect(result.ok).toBe(false);
      if (result.ok) throw new Error(`Unexpected success for ${lessonId}`);
      expect(result.reason).toBe("insufficient_accuracy");
      expect(nextState).toBe(state);
    },
  );

  it("maps each unit 1–35 evaluation to the correct next unit unlock", () => {
    for (let unit = 1; unit <= 35; unit += 1) {
      const evalId = `g3-u${unit}-w1-eval`;
      const { nextState } = applyEvaluationCompletion(
        emptyState(),
        evalId,
        { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 8 },
        timestamp,
      );

      expect(getPreviousUnitEvaluationLessonId(unit + 1)).toBe(evalId);
      expect(isFirstLessonOfUnitUnlocked(nextState, unit + 1)).toBe(true);
    }
  });

  it("does not unlock units beyond the next one", () => {
    const { nextState } = applyEvaluationCompletion(
      emptyState(),
      "g3-u1-w1-eval",
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 8 },
      timestamp,
    );

    expect(isFirstLessonOfUnitUnlocked(nextState, 2)).toBe(true);
    expect(isFirstLessonOfUnitUnlocked(nextState, 3)).toBe(false);
  });

  it("safely handles the Unit 36 boundary", () => {
    const { result, nextState } = applyEvaluationCompletion(
      emptyState(),
      "g3-u36-w1-eval",
      { firstAttemptCorrectCount: 8, firstAttemptTotalCount: 10 },
      timestamp,
    );

    expect(result.ok).toBe(true);
    expect(getPreviousUnitEvaluationLessonId(37)).toBeUndefined();
    expect(isFirstLessonOfUnitUnlocked(nextState, 37)).toBe(false);

    // Unit 36 first lesson becomes available only after Unit 35 evaluation.
    const stateWithUnit35Complete = {
      ...nextState,
      evaluationCompletions: {
        ...nextState.evaluationCompletions,
        "g3-u35-w1-eval": {
          evaluationLessonId: "g3-u35-w1-eval",
          firstAttemptCorrectCount: 8,
          firstAttemptTotalCount: 8,
          accuracy: 0.8,
          completedAt: timestamp,
        },
      },
    };
    expect(isFirstLessonOfUnitUnlocked(stateWithUnit35Complete, 36)).toBe(true);
  });
});
