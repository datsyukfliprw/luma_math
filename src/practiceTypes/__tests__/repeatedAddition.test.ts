import { describe, expect, it } from "vitest";
import { generateRepeatedAdditionProblems } from "../repeatedAddition";

describe("generateRepeatedAdditionProblems", () => {
  it("generates 8 guided problems by default", () => {
    const problems = generateRepeatedAdditionProblems();
    expect(problems).toHaveLength(8);
    expect(problems.every((p) => p.visualType === "repeated_addition")).toBe(true);
  });

  it("builds a repeated-addition string matching groups and addend", () => {
    for (const problem of generateRepeatedAdditionProblems()) {
      const groups = problem.visualData?.groups ?? 0;
      const addend = problem.visualData?.itemsPerGroup ?? 0;
      const total = groups * addend;

      const expectedAddition = Array.from({ length: groups }, () => String(addend)).join(" + ");
      expect(problem.visualData?.repeatedAddition).toBe(`${expectedAddition} = ${total}`);
      expect(problem.correctAnswer).toBe(`${groups}x${addend}`);
      expect(problem.visualData?.product).toBe(total);
      expect(problem.visualData?.equation).toBe(`${groups} × ${addend} = ${total}`);
    }
  });

  it("generates 12 independent problems", () => {
    expect(generateRepeatedAdditionProblems({ mode: "independent" })).toHaveLength(12);
  });

  it("uses the challenge bank for challenge mode (10 problems)", () => {
    const problems = generateRepeatedAdditionProblems({ mode: "challenge" });
    expect(problems).toHaveLength(10);
    expect(problems.every((p) => p.id.includes("challenge"))).toBe(true);
  });

  it("produces unique problem keys", () => {
    const keys = generateRepeatedAdditionProblems({ mode: "independent" }).map((p) => p.problemKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
