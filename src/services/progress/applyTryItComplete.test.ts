import { describe, it, expect } from "vitest";
import { applyTryItComplete } from "./applyTryItComplete";
import type { StudentState } from "../../contexts/StudentProgressContext";
import { createEmptySkillProgress } from "../mastery/createEmptySkillProgress";

function baseStarProfile() {
  return {
    studentName: "Test",
    grade: 3,
    starName: "Test Star",
    ownedItemIds: [],
    equipped: {},
    updatedAt: "2026-01-01T12:00:00.000Z",
  };
}

function emptyState(overrides?: Partial<StudentState>): StudentState {
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

const timestamp = "2026-01-01T12:00:00.000Z";

describe("applyTryItComplete", () => {
  it("sets tryItComplete and recomputes lessonComplete when all other steps are done", () => {
    const state = emptyState({
      lessonProgress: {
        "g3-u1-w1-l1": {
          lessonId: "g3-u1-w1-l1",
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: false,
          practiceComplete: true,
          lessonComplete: false,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: timestamp,
        },
      },
    });

    const { result, nextState } = applyTryItComplete(state, "g3-u1-w1-l1", timestamp);

    if (!result.ok) throw new Error("Unexpected failure");
    expect(result.alreadyCompleted).toBe(false);
    expect(nextState.lessonProgress["g3-u1-w1-l1"].tryItComplete).toBe(true);
    expect(nextState.lessonProgress["g3-u1-w1-l1"].lessonComplete).toBe(true);
  });

  it("sets tryItComplete but leaves lessonComplete false when practice is not done", () => {
    const state = emptyState({
      lessonProgress: {
        "g3-u1-w1-l1": {
          lessonId: "g3-u1-w1-l1",
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: false,
          practiceComplete: false,
          lessonComplete: false,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: timestamp,
        },
      },
    });

    const { result, nextState } = applyTryItComplete(state, "g3-u1-w1-l1", timestamp);

    if (!result.ok) throw new Error("Unexpected failure");
    expect(result.alreadyCompleted).toBe(false);
    expect(nextState.lessonProgress["g3-u1-w1-l1"].tryItComplete).toBe(true);
    expect(nextState.lessonProgress["g3-u1-w1-l1"].lessonComplete).toBe(false);
  });

  it("is idempotent when tryItComplete is already true", () => {
    const state = emptyState({
      lessonProgress: {
        "g3-u1-w1-l1": {
          lessonId: "g3-u1-w1-l1",
          warmupComplete: true,
          learnComplete: true,
          tryItComplete: true,
          practiceComplete: true,
          lessonComplete: true,
          correctAnswers: 0,
          totalQuestions: 0,
          updatedAt: timestamp,
        },
      },
    });

    const { result, nextState } = applyTryItComplete(state, "g3-u1-w1-l1", timestamp);

    if (!result.ok) throw new Error("Unexpected failure");
    expect(result.alreadyCompleted).toBe(true);
    expect(nextState).toBe(state);
    expect(nextState.lessonProgress["g3-u1-w1-l1"].tryItComplete).toBe(true);
  });

  it("creates a new lesson progress record when the lesson has not been started", () => {
    const state = emptyState();

    const { result, nextState } = applyTryItComplete(state, "g3-u1-w1-l1", timestamp);

    if (!result.ok) throw new Error("Unexpected failure");
    expect(result.alreadyCompleted).toBe(false);
    expect(nextState.lessonProgress["g3-u1-w1-l1"]).toBeDefined();
    expect(nextState.lessonProgress["g3-u1-w1-l1"].tryItComplete).toBe(true);
    expect(nextState.lessonProgress["g3-u1-w1-l1"].lessonComplete).toBe(false);
  });

  it("does not modify skill, flashcard, practice, or star profile state", () => {
    const state = emptyState({
      skillProgress: {
        "g3:multiplication:zero-identity": createEmptySkillProgress(
          "g3:multiplication:zero-identity",
        ),
      },
      flashcardProgress: {
        "some-deck": {
          deckId: "some-deck",
          currentCardIndex: 0,
          completed: true,
          knownCardIds: [],
          reviewAgainCardIds: [],
          answeredCardIds: [],
          updatedAt: timestamp,
        },
      },
    });

    const { nextState } = applyTryItComplete(state, "g3-u1-w1-l1", timestamp);

    expect(nextState.skillProgress).toBe(state.skillProgress);
    expect(nextState.flashcardProgress).toBe(state.flashcardProgress);
    expect(nextState.practiceRewards).toBe(state.practiceRewards);
    expect(nextState.starProfile).toBe(state.starProfile);
  });

  it("isolates progress per student state", () => {
    const studentA = emptyState({ starProfile: { ...baseStarProfile(), studentName: "A" } });
    const studentB = emptyState({ starProfile: { ...baseStarProfile(), studentName: "B" } });

    const { nextState: nextA } = applyTryItComplete(studentA, "g3-u1-w1-l1", timestamp);
    const { nextState: nextB } = applyTryItComplete(studentB, "g3-u1-w1-l2", timestamp);

    expect(nextA.lessonProgress["g3-u1-w1-l1"]).toBeDefined();
    expect(nextA.lessonProgress["g3-u1-w1-l2"]).toBeUndefined();
    expect(nextB.lessonProgress["g3-u1-w1-l2"]).toBeDefined();
    expect(nextB.lessonProgress["g3-u1-w1-l1"]).toBeUndefined();
  });
});
