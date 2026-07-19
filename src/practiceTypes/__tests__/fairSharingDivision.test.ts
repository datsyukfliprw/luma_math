import { describe, expect, it } from "vitest";
import { generateFairSharingDivisionProblems } from "../fairSharingDivision";

describe("generateFairSharingDivisionProblems", () => {
  it("generates 8 guided division problems by default", () => {
    const problems = generateFairSharingDivisionProblems();
    expect(problems).toHaveLength(8);
    expect(problems.every((p) => p.visualType === "fair_sharing")).toBe(true);
  });

  it("computes the quotient, equation, and answer data consistently", () => {
    for (const problem of generateFairSharingDivisionProblems({ mode: "independent" })) {
      const items = problem.visualData?.items ?? 0;
      const groupsToShare = problem.visualData?.groupsToShare ?? 1;
      const quotient = items / groupsToShare;

      expect(problem.visualData?.itemsPerGroup).toBe(quotient);
      expect(problem.correctAnswer).toBe(String(quotient));
      expect(problem.answerData).toEqual({ quotient: String(quotient) });
      expect(problem.visualData?.equation).toBe(`${items} ÷ ${groupsToShare} = ${quotient}`);
    }
  });

  it("only produces whole-number quotients in every bank", () => {
    for (const mode of ["guided", "independent", "challenge"] as const) {
      for (const problem of generateFairSharingDivisionProblems({ mode })) {
        expect(Number.isInteger(problem.visualData?.itemsPerGroup)).toBe(true);
      }
    }
  });

  it("generates 12 independent and 10 challenge problems", () => {
    expect(generateFairSharingDivisionProblems({ mode: "independent" })).toHaveLength(12);
    expect(generateFairSharingDivisionProblems({ mode: "challenge" })).toHaveLength(10);
  });
});
