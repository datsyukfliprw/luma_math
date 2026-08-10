import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import {
  generateEstimationProblem,
  generateRoundingProblem,
  roundToPlace,
} from "./rounding";
import type { RoundingProblem } from "./types";

function independentlyRound(number: number, targetPlace: number): number {
  const remainder = number % targetPlace;
  return remainder >= targetPlace / 2
    ? number - remainder + targetPlace
    : number - remainder;
}

function sampleRoundingProblems(
  practiceType: "round_ten" | "round_hundred" | "round_place_value",
  sampleCount = 200,
): RoundingProblem[] {
  return Array.from({ length: sampleCount }, (_, index) =>
    generateRoundingProblem(practiceType, createSeededRng(`${practiceType}:${index}`)),
  );
}

describe("rounding and estimation mathematical generator", () => {
  it("rounds half-up, down, and up independently of the generator", () => {
    expect(roundToPlace(25, 10)).toBe(30);
    expect(roundToPlace(24, 10)).toBe(20);
    expect(roundToPlace(26, 10)).toBe(30);
    expect(roundToPlace(250, 100)).toBe(300);
    expect(roundToPlace(249, 100)).toBe(200);
  });

  it("generates valid rounding problems whose answer and key use displayed data", () => {
    for (const kind of ["round_ten", "round_hundred", "round_place_value"] as const) {
      const problem = generateRoundingProblem(kind, createSeededRng(kind));
      expect(problem.number % problem.targetPlace).toBeGreaterThanOrEqual(0);
      expect(problem.correctAnswer).toBe(
        independentlyRound(problem.number, problem.targetPlace),
      );
      expect(problem.problemKey).toBe(
        `rounding:${problem.number}:${problem.targetPlace}`,
      );
    }
  });

  it("covers two- and three-digit numbers when rounding to tens", () => {
    const problems = sampleRoundingProblems("round_ten");

    expect(problems.some(({ number }) => number >= 10 && number <= 99)).toBe(true);
    expect(problems.some(({ number }) => number >= 100 && number <= 999)).toBe(true);

    for (const problem of problems) {
      expect(problem.targetPlace).toBe(10);
      expect(problem.number).toBeGreaterThanOrEqual(10);
      expect(problem.number).toBeLessThanOrEqual(999);
      expect(problem.correctAnswer).toBe(
        independentlyRound(problem.number, problem.targetPlace),
      );
    }
  });

  it("covers three- and four-digit numbers when rounding to hundreds", () => {
    const problems = sampleRoundingProblems("round_hundred");

    expect(problems.some(({ number }) => number >= 100 && number <= 999)).toBe(true);
    expect(problems.some(({ number }) => number >= 1_000 && number <= 9_999)).toBe(true);

    for (const problem of problems) {
      expect(problem.targetPlace).toBe(100);
      expect(problem.number).toBeGreaterThanOrEqual(100);
      expect(problem.number).toBeLessThanOrEqual(9_999);
      expect(problem.correctAnswer).toBe(
        independentlyRound(problem.number, problem.targetPlace),
      );
    }
  });

  it("keeps place-value rounding numbers valid for tens, hundreds, and thousands", () => {
    const problems = sampleRoundingProblems("round_place_value");
    const bounds = {
      10: [10, 999],
      100: [100, 9_999],
      1_000: [1_000, 99_999],
    } as const;

    for (const problem of problems) {
      const [minimum, maximum] = bounds[problem.targetPlace];
      expect(problem.number).toBeGreaterThanOrEqual(minimum);
      expect(problem.number).toBeLessThanOrEqual(maximum);
      expect(problem.correctAnswer).toBe(
        independentlyRound(problem.number, problem.targetPlace),
      );
    }

    expect(new Set(problems.map(({ targetPlace }) => targetPlace))).toEqual(
      new Set([10, 100, 1_000]),
    );
  });

  it("generates addition and subtraction estimates by rounding both operands", () => {
    const problems = Array.from({ length: 100 }, (_, index) =>
      generateEstimationProblem(createSeededRng(`estimate-${index}`)),
    );

    expect(new Set(problems.map((problem) => problem.operation))).toEqual(
      new Set(["addition", "subtraction"]),
    );
    for (const problem of problems) {
      const roundedLeft = independentlyRound(problem.left, problem.targetPlace);
      const roundedRight = independentlyRound(problem.right, problem.targetPlace);
      const expected =
        problem.operation === "addition"
          ? roundedLeft + roundedRight
          : roundedLeft - roundedRight;
      expect(problem.correctAnswer).toBe(expected);
      expect(problem.problemKey).toBe(
        `estimate:${problem.operation}:${problem.left}:${problem.right}:${problem.targetPlace}`,
      );
    }
  });

  it("is deterministic for the same seed and varies across seeds", () => {
    expect(generateRoundingProblem("round_place_value", createSeededRng("same"))).toEqual(
      generateRoundingProblem("round_place_value", createSeededRng("same")),
    );
    expect(generateEstimationProblem(createSeededRng("same"))).toEqual(
      generateEstimationProblem(createSeededRng("same")),
    );
    expect(
      new Set(
        Array.from({ length: 20 }, (_, index) =>
          generateEstimationProblem(createSeededRng(`different-${index}`)).problemKey,
        ),
      ).size,
    ).toBeGreaterThan(1);
  });
});
