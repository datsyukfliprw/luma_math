import { describe, expect, it } from "vitest";
import type { StudentState } from "./contexts/StudentProgressContext";
import { getGrade3CourseEntries } from "./services/progress/grade3CourseProgression";
import { buildGrade3LearningPathModel } from "./services/progress/learningPathProgress";
import { getGrade3StudentCourseNavigation } from "./services/progress/studentCourseNavigation";

const timestamp = "2026-08-31T12:00:00.000Z";

function emptyStudentState(): StudentState {
  return {
    lessonProgress: {},
    skillProgress: {},
    flashcardProgress: {},
    practiceRewards: {},
    evaluationCompletions: {},
    starProfile: {
      studentName: "Operational Test",
      grade: 3,
      starName: "",
      ownedItemIds: [],
      equipped: {},
      updatedAt: timestamp,
    },
  };
}

function completeCourseEntry(state: StudentState, lessonId: string, lessonType: "lesson" | "evaluation") {
  if (lessonType === "evaluation") {
    state.evaluationCompletions[lessonId] = {
      evaluationLessonId: lessonId,
      firstAttemptCorrectCount: 8,
      firstAttemptTotalCount: 10,
      accuracy: 0.8,
      completedAt: timestamp,
    };
    return;
  }

  state.lessonProgress[lessonId] = {
    lessonId,
    warmupComplete: true,
    learnComplete: true,
    tryItComplete: true,
    practiceComplete: true,
    lessonComplete: true,
    correctAnswers: 6,
    totalQuestions: 6,
    updatedAt: timestamp,
  };
}

describe("Grade 3 operational course flow", () => {
  it("moves a student through all 180 course entries without skipping or dead-ending", () => {
    const state = emptyStudentState();
    const entries = getGrade3CourseEntries();

    expect(entries).toHaveLength(180);

    for (const entry of entries) {
      const navigation = getGrade3StudentCourseNavigation(state);
      expect(navigation.currentLessonId, entry.lessonId).toBe(entry.lessonId);
      expect(navigation.lessonPath, entry.lessonId).toBe(`/lesson/${entry.lessonId}`);
      expect(navigation.practicePath, entry.lessonId).toBe(
        entry.lessonType === "evaluation"
          ? `/practice/${entry.lessonId}`
          : `/practice/${entry.lessonId}?mode=guided`,
      );

      completeCourseEntry(state, entry.lessonId, entry.lessonType);
    }

    const completedNavigation = getGrade3StudentCourseNavigation(state);
    const completedPath = buildGrade3LearningPathModel(state);

    expect(completedNavigation.courseComplete).toBe(true);
    expect(completedNavigation.lessonPath).toBe("/learning-path");
    expect(completedPath.currentLessonId).toBeUndefined();
    expect(completedPath.units).toHaveLength(36);
    expect(completedPath.units.every((unit) => unit.progress === 100)).toBe(true);
    expect(
      completedPath.units.every((unit) => unit.weeks.every((week) => week.status === "complete")),
    ).toBe(true);
  });
});
