import { describe, it, expect } from "vitest";
import { getResolvedTryItExperience } from "./tryItResolver";
import { getAllCurricula } from "../data/curriculum";

describe("getResolvedTryItExperience", () => {
  it("returns undefined for an unknown lesson ID", () => {
    expect(getResolvedTryItExperience("g3-u99-w1-l1")).toBeUndefined();
    expect(getResolvedTryItExperience("not-a-lesson")).toBeUndefined();
  });

  it("returns a resolved experience with at least one problem for every Grade 3 lesson", () => {
    const units = getAllCurricula();
    expect(units.length).toBeGreaterThan(0);

    const failures: string[] = [];

    for (const unit of units) {
      for (const week of unit.weeks) {
        for (const lesson of week.lessons) {
          const lessonId =
            lesson.lesson_id ??
            `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`;
          const experience = getResolvedTryItExperience(lessonId);

          if (!experience || experience.problems.length === 0) {
            failures.push(lessonId);
          }
        }
      }
    }

    expect(failures).toEqual([]);
  }, 60000);

  it("normalizes the authored Unit 1 Try It problems into a stable contract", () => {
    const experience = getResolvedTryItExperience("g3-u1-w1-l1");
    expect(experience).toBeDefined();
    expect(experience!.problems.length).toBeGreaterThan(0);

    const first = experience!.problems[0];
    expect(first.prompt).toBeTruthy();
    expect(first.tip).toBeTruthy();
    expect(first.successMessage).toBeTruthy();
    expect(first.parts.length).toBeGreaterThan(0);

    for (const part of first.parts) {
      expect(part.key).toBeTruthy();
      expect(part.label).toBeTruthy();
      expect(part.correctAnswer).toBeTruthy();
      expect(part.choices).toBeDefined();
    }
  });

  it("produces fallback experiences for unauthored lessons", () => {
    const experience = getResolvedTryItExperience("g3-u9-w1-l1");
    expect(experience).toBeDefined();
    expect(experience!.problems.length).toBeGreaterThan(0);

    const first = experience!.problems[0];
    expect(first.prompt).toBeTruthy();
    expect(first.tip).toBeTruthy();
    expect(first.parts.length).toBe(1);
    expect(first.parts[0].correctAnswer).toBeTruthy();
  });

  it("produces deterministic equivalent results for repeated calls", () => {
    const first = getResolvedTryItExperience("g3-u1-w1-l1");
    const second = getResolvedTryItExperience("g3-u1-w1-l1");
    expect(second).toStrictEqual(first);
  });
});
