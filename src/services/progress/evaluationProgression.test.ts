import { describe, it, expect } from "vitest";
import {
  getEvaluationForUnit,
  getPreviousUnitEvaluationLessonId,
  isFirstLessonOfUnitUnlocked,
  isUnitGrandfathered,
  findCurriculumLessonByIdFromConceptId,
} from "./evaluationProgression";
import { getConceptByLessonId, getConceptById } from "../../data/curriculum/curriculumGraph";
import { getConceptUnlockState } from "../prerequisites/prerequisiteGraph";
import type { StudentState } from "../../contexts/StudentProgressContext";
import type { SkillProgress } from "../../types/mastery";
import type { EvaluationCompletionRecord } from "../../types/evaluationProgress";

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

function emptySkill(skillId: string): SkillProgress {
  return {
    skillId,
    status: "not_started",
    evidenceCounts: {
      conceptual: 0,
      procedural: 0,
      transfer: 0,
      retention: 0,
    },
    totalCorrect: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    masteryCheckAttempts: 0,
    masteryCheckPassed: false,
    successfulRetentionCount: 0,
  };
}

function emptyStudentState(overrides?: Partial<StudentState>): StudentState {
  return {
    lessonProgress: {},
    skillProgress: {},
    flashcardProgress: {},
    practiceRewards: {},
    evaluationCompletions: {},
    starProfile: baseStarProfile(),
    ...overrides,
  };
}

describe("getEvaluationForUnit", () => {
  it("returns the evaluation lesson for every Grade 3 unit", () => {
    for (let unit = 1; unit <= 36; unit += 1) {
      const evaluation = getEvaluationForUnit(unit);
      expect(evaluation).toBeDefined();
      expect(evaluation?.lessonId).toBe(`g3-u${unit}-w1-eval`);
    }
  });
});

describe("getPreviousUnitEvaluationLessonId", () => {
  it("returns the previous unit's evaluation for units 2–36", () => {
    for (let unit = 2; unit <= 36; unit += 1) {
      expect(getPreviousUnitEvaluationLessonId(unit)).toBe(`g3-u${unit - 1}-w1-eval`);
    }
  });

  it("returns undefined for unit 1", () => {
    expect(getPreviousUnitEvaluationLessonId(1)).toBeUndefined();
  });
});

describe("isFirstLessonOfUnitUnlocked", () => {
  it("unlocks unit 1 for a fresh student", () => {
    const state = emptyStudentState();
    expect(isFirstLessonOfUnitUnlocked(state, 1)).toBe(true);
  });

  it("locks later units for a fresh student", () => {
    const state = emptyStudentState();
    for (let unit = 2; unit <= 36; unit += 1) {
      expect(isFirstLessonOfUnitUnlocked(state, unit)).toBe(false);
    }
  });

  it("unlocks the next unit when the previous evaluation is complete", () => {
    const state = emptyStudentState({
      evaluationCompletions: {
        "g3-u1-w1-eval": {
          evaluationLessonId: "g3-u1-w1-eval",
          firstAttemptCorrectCount: 4,
          firstAttemptTotalCount: 5,
          accuracy: 0.8,
          completedAt: "2026-01-01T12:00:00.000Z",
        },
      },
    });

    expect(isFirstLessonOfUnitUnlocked(state, 2)).toBe(true);
    expect(isFirstLessonOfUnitUnlocked(state, 3)).toBe(false);
  });

  it("grandfathers a unit with existing lesson progress", () => {
    const state = emptyStudentState({
      lessonProgress: {
        "g3-u3-w1-l1": {
          lessonId: "g3-u3-w1-l1",
          warmupComplete: true,
          learnComplete: false,
          tryItComplete: false,
          practiceComplete: false,
          lessonComplete: false,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: "2026-01-01T12:00:00.000Z",
        },
      },
    });

    expect(isFirstLessonOfUnitUnlocked(state, 3)).toBe(true);
  });

  it("grandfathers a unit with existing practice rewards", () => {
    const state = emptyStudentState({
      practiceRewards: {
        "g3-u5-w1-l1": {
          guided: {
            completed: true,
            rewardId: "common_star_accessory",
            completedAt: "2026-01-01T12:00:00.000Z",
          },
        },
      },
    });

    expect(isFirstLessonOfUnitUnlocked(state, 5)).toBe(true);
  });

  it("grandfathers a unit with existing skill progress", () => {
    const state = emptyStudentState({
      skillProgress: {
        "g3-s-equal_groups": { ...emptySkill("g3-s-equal_groups"), status: "introduced" },
      },
    });

    // Unit 1 skill; does not belong to Unit 5, so should not grandfather.
    expect(isFirstLessonOfUnitUnlocked(state, 5)).toBe(false);

    const unit5Skill = "g3-s-regrouping"; // belongs to Unit 5 (addition with regrouping)
    const stateWithUnit5Skill = emptyStudentState({
      skillProgress: {
        [unit5Skill]: { ...emptySkill(unit5Skill), status: "introduced" },
      },
    });

    expect(isFirstLessonOfUnitUnlocked(stateWithUnit5Skill, 5)).toBe(true);
  });

  it("safely handles unit 36 boundary", () => {
    const state = emptyStudentState({
      evaluationCompletions: {
        "g3-u35-w1-eval": {
          evaluationLessonId: "g3-u35-w1-eval",
          firstAttemptCorrectCount: 8,
          firstAttemptTotalCount: 8,
          accuracy: 0.8,
          completedAt: "2026-01-01T12:00:00.000Z",
        },
      },
    });

    expect(isFirstLessonOfUnitUnlocked(state, 36)).toBe(true);
    expect(getPreviousUnitEvaluationLessonId(36)).toBe("g3-u35-w1-eval");
    expect(getPreviousUnitEvaluationLessonId(37)).toBeUndefined();
  });
});

describe("isUnitGrandfathered", () => {
  it("does not grandfather unit 1", () => {
    expect(isUnitGrandfathered(emptyStudentState(), 1)).toBe(false);
  });
});

describe("getConceptUnlockState with evaluation completion", () => {
  it("unlocks the next unit's first concept when the previous evaluation is complete", () => {
    const evaluationCompletions: Record<string, EvaluationCompletionRecord> = {
      "g3-u1-w1-eval": {
        evaluationLessonId: "g3-u1-w1-eval",
        firstAttemptCorrectCount: 4,
        firstAttemptTotalCount: 5,
        accuracy: 0.8,
        completedAt: "2026-01-01T12:00:00.000Z",
      },
    };

    const unit2FirstLesson = getConceptByLessonId("g3-u2-w1-l1");
    expect(unit2FirstLesson).toBeDefined();

    const state = getConceptUnlockState(
      unit2FirstLesson!.id,
      () => emptySkill("g3-s-large_digit_value"),
      (lessonId) => evaluationCompletions[lessonId],
    );

    expect(state.unlocked).toBe(true);
  });

  it("keeps the next unit locked without evaluation completion", () => {
    const unit2FirstLesson = getConceptByLessonId("g3-u2-w1-l1");
    expect(unit2FirstLesson).toBeDefined();

    const state = getConceptUnlockState(unit2FirstLesson!.id, () =>
      emptySkill("g3-s-large_digit_value"),
    );

    expect(state.unlocked).toBe(false);
  });

  it("returns the previous unit evaluation for a later boundary", () => {
    const evaluationCompletions: Record<string, EvaluationCompletionRecord> = {
      "g3-u10-w1-eval": {
        evaluationLessonId: "g3-u10-w1-eval",
        firstAttemptCorrectCount: 4,
        firstAttemptTotalCount: 5,
        accuracy: 0.8,
        completedAt: "2026-01-01T12:00:00.000Z",
      },
    };

    const unit11FirstLesson = getConceptByLessonId("g3-u11-w1-l1");
    expect(unit11FirstLesson).toBeDefined();

    const state = getConceptUnlockState(
      unit11FirstLesson!.id,
      () => emptySkill("g3-s-place_value_digits"),
      (lessonId) => evaluationCompletions[lessonId],
    );

    expect(state.unlocked).toBe(true);
  });
});

describe("findCurriculumLessonByIdFromConceptId", () => {
  it("maps each Grade 3 concept to its canonical lesson", () => {
    const unit1EvalConcept = getConceptById("g3-u1-c-mastery-check");
    expect(unit1EvalConcept).toBeDefined();
    expect(findCurriculumLessonByIdFromConceptId(unit1EvalConcept!.id)).toBe("g3-u1-w1-eval");
  });
});
