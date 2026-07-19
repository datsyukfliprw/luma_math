import { describe, expect, it } from "vitest";
import { generateEqualGroupsWithObjectsProblems } from "../equalGroupsWithObjects";

describe("generateEqualGroupsWithObjectsProblems", () => {
  it("generates 8 guided problems by default", () => {
    const problems = generateEqualGroupsWithObjectsProblems();
    expect(problems).toHaveLength(8);
    expect(problems.every((p) => p.visualType === "equal_groups")).toBe(true);
  });

  it("computes totals and equations for each problem", () => {
    for (const problem of generateEqualGroupsWithObjectsProblems({ mode: "independent" })) {
      const groups = problem.visualData?.groups ?? 0;
      const itemsPerGroup = problem.visualData?.itemsPerGroup ?? 0;
      const total = groups * itemsPerGroup;
      expect(problem.correctAnswer).toBe(String(total));
      expect(problem.visualData?.equation).toBe(`${groups} × ${itemsPerGroup} = ${total}`);
    }
  });

  it("generates 12 independent and 10 challenge problems", () => {
    expect(generateEqualGroupsWithObjectsProblems({ mode: "independent" })).toHaveLength(12);
    expect(generateEqualGroupsWithObjectsProblems({ mode: "challenge" })).toHaveLength(10);
  });

  it("references a pluralized item name in the question text", () => {
    const [first] = generateEqualGroupsWithObjectsProblems();
    expect(first.questionText).toContain("buttons");
    expect(first.problemKey).toContain("buttons");
  });
});
