import { describe, expect, it } from "vitest";
import { generateProblemsForPracticeType, practiceRegistry } from "./registry";
import { generateRoundingProblems } from "./rounding";

const TYPES = ["round_ten", "round_hundred", "round_place_value", "estimate_reasonable"];

describe("rounding Practice adapter", () => {
  it("routes all four Practice types through the adapter", () => {
    for (const type of TYPES) expect(practiceRegistry[type]).toBe(generateRoundingProblems);
  });

  it("satisfies count, key uniqueness, choice uniqueness, and determinism", () => {
    for (const practiceType of TYPES) {
      const options = { seed: `rounding:${practiceType}`, count: 12, lesson: { practice_type: practiceType } };
      const problems = generateProblemsForPracticeType(practiceType, options);
      expect(problems).toHaveLength(12);
      expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(12);
      expect(problems).toEqual(generateProblemsForPracticeType(practiceType, options));

      for (const problem of problems) {
        const choices = problem.visualData?.choices ?? [];
        expect(new Set(choices).size).toBe(choices.length);
        expect(choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);
      }
    }
  });

  it("varies generated problems across seeds", () => {
    const first = generateProblemsForPracticeType("round_ten", { seed: "one" });
    const second = generateProblemsForPracticeType("round_ten", { seed: "two" });
    expect(first.map((problem) => problem.problemKey)).not.toEqual(
      second.map((problem) => problem.problemKey),
    );
  });
});
