import { describe, it, expect } from "vitest";
import { getLessonExperience } from "../data/lessonExperience";
import { getAdaptedLessonExperience } from "./lessonExperienceAdapter";

describe("getAdaptedLessonExperience", () => {
  it("returns undefined for unknown curriculum lessons", () => {
    expect(getAdaptedLessonExperience("g3-u99-w1-l1")).toBeUndefined();
  });

  it("adapts a generic curriculum lesson with a big idea and no fabricated interaction blocks", () => {
    const lesson = getAdaptedLessonExperience("g3-u33-w1-l1");
    expect(lesson).toBeDefined();
    expect(lesson!.source).toBe("curriculum");
    expect(lesson!.bigIdea.title).toBeTruthy();
    expect(lesson!.buildIt).toBeUndefined();
    expect(lesson!.seeIt).toBeUndefined();
    expect(lesson!.words).toBeUndefined();
    expect(lesson!.quickCheck).toBeUndefined();
    expect(lesson!.tryIt).toBeUndefined();
  });

  it("marks multiplication topic when practice_type is in the generator registry", () => {
    const multiplication = getAdaptedLessonExperience("g3-u9-w1-l2");
    const review = getAdaptedLessonExperience("g3-u28-w1-l1");
    expect(multiplication?.topic).toBe("multiplication");
    expect(review?.topic).toBe("review");
  });

  it("keeps buildIt optional and only includes it for supported equal-groups examples", () => {
    // u8 is addition/subtraction problem solving and should not be coerced into buildIt.
    const u8 = getAdaptedLessonExperience("g3-u8-w1-l1");
    expect(u8?.buildIt).toBeUndefined();
  });
});

describe("getLessonExperience", () => {
  it("returns authored experiences for Unit 1 Week 1 lessons", () => {
    const lesson = getLessonExperience("g3-u1-w1-l1");
    expect(lesson).toBeDefined();
    expect(lesson!.source).toBe("authored");
    expect(lesson!.buildIt).toBeDefined();
    expect(lesson!.seeIt).toBeDefined();
    expect(lesson!.words).toBeDefined();
    expect(lesson!.quickCheck).toBeDefined();
    expect(lesson!.tryIt).toBeDefined();
  });

  it("falls back to a curriculum-derived experience for unauthored lessons", () => {
    const lesson = getLessonExperience("g3-u33-w1-l1");
    expect(lesson).toBeDefined();
    expect(lesson!.source).toBe("curriculum");
  });

  it("returns undefined for unknown lesson IDs and does not substitute Unit 1", () => {
    const unknown = getLessonExperience("g3-u99-w1-l1");
    const unit1 = getLessonExperience("g3-u1-w1-l1");
    expect(unknown).toBeUndefined();
    expect(unit1?.id).not.toBe(unknown?.id);
  });

  it("caches derived curriculum experiences by lesson ID", () => {
    const first = getLessonExperience("g3-u30-w1-l1");
    const second = getLessonExperience("g3-u30-w1-l1");
    expect(first).toBe(second);
  });
});
