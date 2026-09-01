import { describe, expect, it } from "vitest";
import type { StudentState } from "../../contexts/StudentProgressContext";
import { getGrade3CourseEntries } from "./grade3CourseProgression";
import { getGrade3StudentCourseNavigation } from "./studentCourseNavigation";

const timestamp = "2026-08-31T12:00:00.000Z";

function emptyStudentState(): StudentState {
  return {
    lessonProgress: {},
    skillProgress: {},
    flashcardProgress: {},
    practiceRewards: {},
    evaluationCompletions: {},
    starProfile: {
      studentName: "Test Student",
      grade: 3,
      starName: "",
      ownedItemIds: [],
      equipped: {},
      updatedAt: timestamp,
    },
  };
}

function completeRegularLesson(state: StudentState, lessonId: string): void {
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

describe("Grade 3 student course navigation", () => {
  it("routes a new student to the first lesson and its Guided Practice", () => {
    const navigation = getGrade3StudentCourseNavigation(emptyStudentState());

    expect(navigation).toMatchObject({
      currentLessonId: "g3-u1-w1-l1",
      currentLessonType: "lesson",
      lessonPath: "/lesson/g3-u1-w1-l1",
      practicePath: "/practice/g3-u1-w1-l1?mode=guided",
      courseComplete: false,
    });
  });

  it("moves Home and Sidebar navigation forward with lesson completion", () => {
    const state = emptyStudentState();
    completeRegularLesson(state, "g3-u1-w1-l1");

    expect(getGrade3StudentCourseNavigation(state)).toMatchObject({
      currentLessonId: "g3-u1-w1-l2",
      lessonPath: "/lesson/g3-u1-w1-l2",
      practicePath: "/practice/g3-u1-w1-l2?mode=guided",
    });
  });

  it("routes to the unit evaluation after the four regular lessons are complete", () => {
    const state = emptyStudentState();
    for (const lessonId of [
      "g3-u1-w1-l1",
      "g3-u1-w1-l2",
      "g3-u1-w1-l3",
      "g3-u1-w1-l4",
    ]) {
      completeRegularLesson(state, lessonId);
    }

    expect(getGrade3StudentCourseNavigation(state)).toMatchObject({
      currentLessonId: "g3-u1-w1-eval",
      currentLessonType: "evaluation",
      lessonPath: "/lesson/g3-u1-w1-eval",
      practicePath: "/practice/g3-u1-w1-eval",
    });
  });

  it("returns to the Learning Path once every Grade 3 course entry is complete", () => {
    const state = emptyStudentState();

    for (const entry of getGrade3CourseEntries()) {
      if (entry.lessonType === "evaluation") {
        state.evaluationCompletions[entry.lessonId] = {
          evaluationLessonId: entry.lessonId,
          firstAttemptCorrectCount: 8,
          firstAttemptTotalCount: 10,
          accuracy: 0.8,
          completedAt: timestamp,
        };
      } else {
        completeRegularLesson(state, entry.lessonId);
      }
    }

    expect(getGrade3StudentCourseNavigation(state)).toEqual({
      lessonPath: "/learning-path",
      practicePath: "/learning-path",
      courseComplete: true,
    });
  });
});
