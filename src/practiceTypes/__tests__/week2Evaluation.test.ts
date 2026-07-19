import { describe, expect, it } from "vitest";
import { generateWeek2EvaluationProblems } from "../week2Evaluation";

describe("generateWeek2EvaluationProblems", () => {
  it("returns 12 interleaved problems", () => {
    const problems = generateWeek2EvaluationProblems();
    expect(problems).toHaveLength(12);
    expect(problems.every(Boolean)).toBe(true);
  });

  it("cycles through the four week-2 skills in order", () => {
    const problems = generateWeek2EvaluationProblems();
    const visualTypes = problems.map((p) => p.visualType);
    // Pattern per round: array, commutative(mc), draw(array), valid/invalid(mc)
    expect(visualTypes.slice(0, 4)).toEqual([
      "array_rows_columns",
      "multiple_choice",
      "array_rows_columns",
      "multiple_choice",
    ]);
  });

  it("produces unique ids", () => {
    const ids = generateWeek2EvaluationProblems().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
