import { describe, expect, it } from "vitest";
import { getLessonById } from "./lessonLookup";

describe("getLessonById", () => {
  it("uses Unit 1 Lesson 1 only when no lesson id is provided", () => {
    const result = getLessonById();
    expect(result.lesson.lesson_id).toBe("g3-u1-w1-l1");
  });

  it("resolves valid lesson and evaluation ids", () => {
    expect(getLessonById("g3-u6-w1-l3").lesson.lesson_id).toBe("g3-u6-w1-l3");
    expect(getLessonById("g3-u6-w1-eval").lesson.lesson_type).toBe("evaluation");
  });

  it("rejects malformed or nonexistent lesson ids instead of silently opening Unit 1", () => {
    expect(() => getLessonById("not-a-lesson")).toThrow(/Unknown lesson/);
    expect(() => getLessonById("g3-u99-w1-l1")).toThrow(/Unknown lesson/);
    expect(() => getLessonById("g3-u1-w1-l99")).toThrow(/Unknown lesson/);
  });
});
