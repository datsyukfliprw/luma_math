import { describe, expect, it } from "vitest";
import {
  getGrade3CourseEntries,
  getNextGrade3CourseStep,
} from "./grade3CourseProgression";

describe("Grade 3 course progression", () => {
  it("contains the complete 180-entry Grade 3 course in curriculum order", () => {
    const entries = getGrade3CourseEntries();

    expect(entries).toHaveLength(180);
    expect(entries[0]).toMatchObject({
      lessonId: "g3-u1-w1-l1",
      lessonType: "lesson",
      unitNumber: 1,
    });
    expect(entries.at(-1)).toMatchObject({
      lessonId: "g3-u36-w1-eval",
      lessonType: "evaluation",
      unitNumber: 36,
    });
    expect(new Set(entries.map((entry) => entry.lessonId)).size).toBe(entries.length);
  });

  it("moves every entry to the next curriculum entry without broken paths", () => {
    const entries = getGrade3CourseEntries();

    for (let index = 0; index < entries.length - 1; index += 1) {
      const current = entries[index];
      const expected = entries[index + 1];
      const next = getNextGrade3CourseStep(current.lessonId);

      expect(next.kind, current.lessonId).toBe("lesson");
      if (next.kind !== "lesson") continue;

      expect(next.lessonId, current.lessonId).toBe(expected.lessonId);
      expect(next.lessonType, current.lessonId).toBe(expected.lessonType);
      expect(next.path, current.lessonId).toBe(`/lesson/${expected.lessonId}`);
    }
  });

  it("routes each unit evaluation to the next unit and finishes after Unit 36", () => {
    for (let unitNumber = 1; unitNumber < 36; unitNumber += 1) {
      expect(getNextGrade3CourseStep(`g3-u${unitNumber}-w1-eval`)).toMatchObject({
        kind: "lesson",
        lessonId: `g3-u${unitNumber + 1}-w1-l1`,
        path: `/lesson/g3-u${unitNumber + 1}-w1-l1`,
      });
    }

    expect(getNextGrade3CourseStep("g3-u36-w1-eval")).toEqual({
      kind: "course_complete",
      path: "/learning-path",
    });
  });

  it("fails safely to the Learning Path for an unknown lesson id", () => {
    expect(getNextGrade3CourseStep("g3-u999-w1-l1")).toEqual({
      kind: "course_complete",
      path: "/learning-path",
    });
  });
});
