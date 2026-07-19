import { describe, expect, it } from "vitest";
import { generateCommutativePropertyProblems } from "../commutativeProperty";

describe("generateCommutativePropertyProblems", () => {
  it("generates 8 guided multiple-choice problems by default", () => {
    const problems = generateCommutativePropertyProblems();
    expect(problems).toHaveLength(8);
    expect(problems.every((p) => p.visualType === "multiple_choice")).toBe(true);
  });

  it("uses the commuted factors as the correct answer and includes it in the choices", () => {
    for (const problem of generateCommutativePropertyProblems({ mode: "independent" })) {
      const choices = problem.visualData?.choices ?? [];
      expect(choices).toHaveLength(3);
      expect(choices).toContain(problem.correctAnswer);
      // The correct answer swaps the factors in "a × b".
      const match = problem.questionText.match(/matches (\d+) × (\d+)/);
      expect(match).not.toBeNull();
      if (match) {
        const [, a, b] = match;
        expect(problem.correctAnswer).toBe(`${b} × ${a}`);
      }
    }
  });

  it("generates 12 independent and 10 challenge problems", () => {
    expect(generateCommutativePropertyProblems({ mode: "independent" })).toHaveLength(12);
    expect(generateCommutativePropertyProblems({ mode: "challenge" })).toHaveLength(10);
  });
});
