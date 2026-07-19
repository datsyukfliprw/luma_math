import { describe, expect, it } from "vitest";
import {
  getLessonExperience,
  getWeekOneLessonExperience,
  requireLessonExperience,
} from "../lessonExperience";

describe("lessonExperience lookups", () => {
  it("returns the full week-one lesson list", () => {
    const lessons = getWeekOneLessonExperience();
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons.every((lesson) => lesson.grade === 3)).toBe(true);
  });

  it("returns the first lesson when no id is given", () => {
    const lessons = getWeekOneLessonExperience();
    expect(getLessonExperience()).toBe(lessons[0]);
  });

  it("finds a lesson by id", () => {
    const lessons = getWeekOneLessonExperience();
    const target = lessons[lessons.length - 1];
    expect(getLessonExperience(target.id)).toBe(target);
  });

  it("returns undefined for an unknown lesson id", () => {
    expect(getLessonExperience("nope")).toBeUndefined();
  });

  it("requireLessonExperience returns the lesson when it exists", () => {
    const lessons = getWeekOneLessonExperience();
    expect(requireLessonExperience(lessons[0].id)).toBe(lessons[0]);
  });

  it("requireLessonExperience throws for an unknown id", () => {
    expect(() => requireLessonExperience("missing-lesson")).toThrowError(
      /No lesson experience found/,
    );
  });
});
