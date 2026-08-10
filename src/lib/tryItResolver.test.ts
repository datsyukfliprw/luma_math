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

  it("keeps authored visual counts synchronized with the answer parts", () => {
    const experience = getResolvedTryItExperience("g3-u1-w1-l1");
    expect(experience).toBeDefined();

    for (const problem of experience!.problems) {
      if (!problem.visualData) continue;

      const groupsPart = problem.parts.find((part) => part.key === "groups");
      const inEachPart = problem.parts.find((part) => part.key === "inEach");

      if (groupsPart) {
        expect(problem.visualData.groups).toBe(Number(groupsPart.correctAnswer));
      }

      if (inEachPart) {
        expect(problem.visualData.itemsPerGroup).toBe(Number(inEachPart.correctAnswer));
      }
    }
  });

  it("produces fallback experiences for unauthored lessons", () => {
    const experience = getResolvedTryItExperience("g3-u9-w1-l1");
    expect(experience).toBeDefined();
    expect(experience!.problems.length).toBeGreaterThan(0);

    const first = experience!.problems[0];
    expect(first.prompt).toBeTruthy();
    expect(first.tip).toBeTruthy();
    expect(first.parts.length).toBeGreaterThan(0);
    expect(first.parts[0].correctAnswer).toBeTruthy();
  });

  it("produces deterministic equivalent results for repeated calls", () => {
    const first = getResolvedTryItExperience("g3-u1-w1-l1");
    const second = getResolvedTryItExperience("g3-u1-w1-l1");
    expect(second).toStrictEqual(first);
  });

  describe("attempt-based variation", () => {
    it("returns identical content when the same attempt key is supplied twice", () => {
      const first = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "attempt-a" });
      const second = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "attempt-a" });
      expect(second).toStrictEqual(first);
    });

    it("produces varied content for different attempt keys on supported lessons", () => {
      const first = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "attempt-a" });
      const second = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "attempt-b" });

      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expect(first).not.toStrictEqual(second);

      const firstPrompts = first!.problems.map((p) => p.prompt);
      const secondPrompts = second!.problems.map((p) => p.prompt);
      expect(new Set([...firstPrompts, ...secondPrompts]).size).toBeGreaterThan(
        firstPrompts.length,
      );
    });

    it("does not repeat the previous attempt's complete set under a new attempt key", () => {
      const previous = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "attempt-prev" });
      const next = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "attempt-next" });

      expect(previous).toBeDefined();
      expect(next).toBeDefined();
      expect(next).not.toStrictEqual(previous);
    });

    it("has no duplicate canonical problem identities within one attempt", () => {
      const experience = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "dedup-test" });
      expect(experience).toBeDefined();

      const keys = experience!.problems.map((p) => p.problemKey).filter(Boolean);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("keeps generated visual counts synchronized with the answer parts", () => {
      const experience = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "sync-test" });
      expect(experience).toBeDefined();

      for (const problem of experience!.problems) {
        if (!problem.visualData) continue;

        const groupsPart = problem.parts.find((part) => part.key === "groups");
        const inEachPart = problem.parts.find((part) => part.key === "inEach");

        if (groupsPart) {
          expect(problem.visualData.groups).toBe(Number(groupsPart.correctAnswer));
        }

        if (inEachPart) {
          expect(problem.visualData.itemsPerGroup).toBe(Number(inEachPart.correctAnswer));
        }
      }
    });

    it("keeps generated answer choices consistent with correct answers", () => {
      const experience = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "choices-test" });
      expect(experience).toBeDefined();

      for (const problem of experience!.problems) {
        for (const part of problem.parts) {
          if (part.choices && part.choices.length > 0) {
            expect(part.choices).toContain(part.correctAnswer);
          }
        }
      }
    });

    it("generates mathematically correct canonical values for each supported family", () => {
      const cases = [
        { lessonId: "g3-u1-w1-l1", attemptKey: "u1l1-math" },
        { lessonId: "g3-u1-w1-l2", attemptKey: "u1l2-math" },
        { lessonId: "g3-u1-w1-l3", attemptKey: "u1l3-math" },
        { lessonId: "g3-u1-w1-l4", attemptKey: "u1l4-math" },
      ];

      for (const { lessonId, attemptKey } of cases) {
        const experience = getResolvedTryItExperience(lessonId, { attemptKey });
        expect(experience, lessonId).toBeDefined();

        for (const problem of experience!.problems) {
          if (!problem.visualData) continue;

          const groups = problem.visualData.groups;
          const inEach = problem.visualData.itemsPerGroup;
          const product = groups * inEach;

          const groupsPart = problem.parts.find((part) => part.key === "groups");
          const inEachPart = problem.parts.find((part) => part.key === "inEach");

          if (groupsPart) {
            expect(Number(groupsPart.correctAnswer)).toBe(groups);
          }

          if (inEachPart) {
            expect(Number(inEachPart.correctAnswer)).toBe(inEach);
          }

          if (problem.problemKey) {
            expect(problem.problemKey).toContain(String(product));
          }
        }
      }
    });
  });
});
