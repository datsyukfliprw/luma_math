import { describe, expect, it } from "vitest";
import { generateFactorProductProblems } from "./factorProduct";

describe("factor_product_identification practice adapter", () => {
  it.each([
    ["guided", 8],
    ["independent", 12],
    ["challenge", 10],
  ] as const)("returns %s unique unordered factor facts in %d mode", (mode, count) => {
    const problems = generateFactorProductProblems({ mode });

    expect(problems).toHaveLength(count);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(count);
  });

  it("keeps square facts available", () => {
    const problems = generateFactorProductProblems({ count: 12 });

    expect(problems.some((problem) => problem.answerData?.factorA === problem.answerData?.factorB)).toBe(
      true,
    );
  });
});
