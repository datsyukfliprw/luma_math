import { describe, expect, it } from "vitest";
import { getPracticeProblemCount, takePracticeProblems } from "../practiceModeCounts";

describe("getPracticeProblemCount", () => {
  it("returns 8 for guided mode (default)", () => {
    expect(getPracticeProblemCount()).toBe(8);
    expect(getPracticeProblemCount({})).toBe(8);
    expect(getPracticeProblemCount({ mode: "guided" })).toBe(8);
  });

  it("returns 12 for independent mode", () => {
    expect(getPracticeProblemCount({ mode: "independent" })).toBe(12);
  });

  it("returns 10 for challenge mode", () => {
    expect(getPracticeProblemCount({ mode: "challenge" })).toBe(10);
  });
});

describe("takePracticeProblems", () => {
  const source = Array.from({ length: 20 }, (_, index) => index);

  it("slices to the guided count by default", () => {
    expect(takePracticeProblems(source)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("slices to the independent count", () => {
    expect(takePracticeProblems(source, { mode: "independent" })).toHaveLength(12);
  });

  it("slices to the challenge count", () => {
    expect(takePracticeProblems(source, { mode: "challenge" })).toHaveLength(10);
  });

  it("returns the full array when it is shorter than the requested count", () => {
    expect(takePracticeProblems([1, 2, 3], { mode: "independent" })).toEqual([1, 2, 3]);
  });

  it("does not mutate the source array", () => {
    const original = [...source];
    takePracticeProblems(source, { mode: "challenge" });
    expect(source).toEqual(original);
  });
});
