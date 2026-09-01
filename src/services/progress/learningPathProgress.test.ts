import { describe, expect, it } from "vitest";
import { getSkillsForLesson } from "../../data/curriculum/curriculumGraph";
import type { StudentState } from "../../contexts/StudentProgressContext";
import { createEmptySkillProgress } from "../mastery/createEmptySkillProgress";
import { buildGrade3LearningPathModel } from "./learningPathProgress";

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

function completedLesson(lessonId: string) {
  return {
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

function markLessonSkillsDeveloping(state: StudentState, lessonId: string): void {
  for (const skill of getSkillsForLesson(lessonId)) {
    state.skillProgress[skill.id] = {
      ...createEmptySkillProgress(skill.id),
      status: "developing",
      introducedAt: timestamp,
      lastWorkedAt: timestamp,
    };
  }
}

describe("Grade 3 Learning Path progress model", () => {
  it("shows exactly one current lesson for a new Grade 3 student", () => {
    const model = buildGrade3LearningPathModel(emptyStudentState());
    const lessons = model.units.flatMap((unit) => unit.weeks.flatMap((week) => week.lessons));

    expect(model.currentLessonId).toBe("g3-u1-w1-l1");
    expect(model.currentUnitNumber).toBe(1);
    expect(lessons.filter((lesson) => lesson.status === "current")).toHaveLength(1);
    expect(lessons.find((lesson) => lesson.id === "g3-u1-w1-l1")?.status).toBe("current");
  });


  it("keeps untouched future lessons and evaluations locked for a new student", () => {
    const model = buildGrade3LearningPathModel(emptyStudentState());
    const lessons = model.units.flatMap((unit) => unit.weeks.flatMap((week) => week.lessons));
    const untouchedFuture = lessons.filter((lesson) => lesson.id !== "g3-u1-w1-l1");

    expect(untouchedFuture.every((lesson) => lesson.status === "locked")).toBe(true);
    expect(lessons.find((lesson) => lesson.id === "g3-u1-w1-eval")?.status).toBe("locked");
    expect(lessons.find((lesson) => lesson.id === "g3-u2-w1-l1")?.status).toBe("locked");
  });

  it("moves the single current marker forward after a lesson is completed", () => {
    const state = emptyStudentState();
    state.lessonProgress["g3-u1-w1-l1"] = completedLesson("g3-u1-w1-l1");
    markLessonSkillsDeveloping(state, "g3-u1-w1-l1");

    const model = buildGrade3LearningPathModel(state);
    const lessons = model.units.flatMap((unit) => unit.weeks.flatMap((week) => week.lessons));

    expect(model.currentLessonId).toBe("g3-u1-w1-l2");
    expect(lessons.filter((lesson) => lesson.status === "current")).toHaveLength(1);
    expect(lessons.find((lesson) => lesson.id === "g3-u1-w1-l1")?.status).toBe("complete");
  });

  it("marks a finished unit complete and moves the current unit across an evaluation boundary", () => {
    const state = emptyStudentState();

    for (const lessonId of [
      "g3-u1-w1-l1",
      "g3-u1-w1-l2",
      "g3-u1-w1-l3",
      "g3-u1-w1-l4",
    ]) {
      state.lessonProgress[lessonId] = completedLesson(lessonId);
      markLessonSkillsDeveloping(state, lessonId);
    }

    state.evaluationCompletions["g3-u1-w1-eval"] = {
      evaluationLessonId: "g3-u1-w1-eval",
      firstAttemptCorrectCount: 8,
      firstAttemptTotalCount: 10,
      accuracy: 0.8,
      completedAt: timestamp,
    };

    const model = buildGrade3LearningPathModel(state);
    const unit1 = model.units.find((entry) => entry.unit.unit_number === 1);

    expect(unit1?.progress).toBe(100);
    expect(unit1?.weeks[0].status).toBe("complete");
    expect(model.currentLessonId).toBe("g3-u2-w1-l1");
    expect(model.currentUnitNumber).toBe(2);
  });

  it("keeps previously started later work accessible without unlocking untouched work after it", () => {
    const state = emptyStudentState();
    state.lessonProgress["g3-u3-w1-l2"] = {
      lessonId: "g3-u3-w1-l2",
      warmupComplete: true,
      learnComplete: false,
      tryItComplete: false,
      practiceComplete: false,
      lessonComplete: false,
      correctAnswers: 0,
      totalQuestions: 0,
      updatedAt: timestamp,
    };

    const model = buildGrade3LearningPathModel(state);
    const lessons = model.units.flatMap((unit) => unit.weeks.flatMap((week) => week.lessons));

    expect(model.currentLessonId).toBe("g3-u3-w1-l2");
    expect(lessons.find((lesson) => lesson.id === "g3-u3-w1-l2")?.status).toBe("current");
    expect(lessons.find((lesson) => lesson.id === "g3-u3-w1-l3")?.status).toBe("locked");
  });

  it("uses guided practice completion in the visible lesson percentage", () => {
    const state = emptyStudentState();
    state.lessonProgress["g3-u1-w1-l1"] = {
      ...completedLesson("g3-u1-w1-l1"),
      practiceComplete: false,
      lessonComplete: false,
    };
    state.practiceRewards["g3-u1-w1-l1"] = {
      guided: {
        completed: true,
        rewardId: "common_star_accessory",
        completedAt: timestamp,
      },
    };
    markLessonSkillsDeveloping(state, "g3-u1-w1-l1");

    const model = buildGrade3LearningPathModel(state);
    const lesson = model.units
      .flatMap((unit) => unit.weeks)
      .flatMap((week) => week.lessons)
      .find((entry) => entry.id === "g3-u1-w1-l1");

    expect(lesson?.percentComplete).toBe(100);
    expect(lesson?.status).toBe("complete");
  });
});
