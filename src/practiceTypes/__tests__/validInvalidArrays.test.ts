import { describe, expect, it } from "vitest";
import { generateValidInvalidArraysProblems } from "../validInvalidArrays";

const validChoices = ["Yes, it is an array", "No, it is not an array"];

describe("generateValidInvalidArraysProblems", () => {
  it("generates 8 guided problems by default", () => {
    const problems = generateValidInvalidArraysProblems();
    expect(problems).toHaveLength(8);
    expect(problems.every((p) => p.visualType === "multiple_choice")).toBe(true);
  });

  it("offers the yes/no array choices and a valid correct answer", () => {
    for (const problem of generateValidInvalidArraysProblems({ mode: "independent" })) {
      expect(problem.visualData?.choices).toEqual(validChoices);
      expect(validChoices).toContain(problem.correctAnswer);
    }
  });

  it("caps at the 12-item bank even in independent mode", () => {
    // The bank only has 12 seeds, so independent (12) returns all of them.
    expect(generateValidInvalidArraysProblems({ mode: "independent" })).toHaveLength(12);
  });

  it("returns 10 problems for challenge mode", () => {
    expect(generateValidInvalidArraysProblems({ mode: "challenge" })).toHaveLength(10);
  });
});
