import { describe, expect, it } from "vitest";
import { getDigitValueDistractorCandidates } from "../lib/placeValue/distractors";
import type { PlaceValue } from "../lib/placeValue/types";
import { generateLargeDigitValueProblems } from "./largeDigitValue";

const PLACE_VALUES: Record<PlaceValue, number> = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1_000,
  "ten thousands": 10_000,
};

function independentlyExtractDigit(number: number, placeValue: number): number {
  return Math.floor(number / placeValue) % 10;
}

describe("large_digit_value Practice adapter", () => {
  it("generates large-number digit-value problems with one correct choice", () => {
    const problems = generateLargeDigitValueProblems({ seed: "semantic", count: 24 });

    expect(problems).toHaveLength(24);
    for (const problem of problems) {
      const match = problem.questionText.match(
        /^In the number (\d+), what is the value of the (.+) digit\?$/,
      );
      expect(match).not.toBeNull();

      const number = Number(match?.[1]);
      const place = match?.[2] as PlaceValue;
      const placeValue = PLACE_VALUES[place];
      const digit = independentlyExtractDigit(number, placeValue);
      const answer = digit * placeValue;
      const choices = problem.visualData?.choices ?? [];
      const canonicalProblem = {
        form: "digit_value" as const,
        number,
        targetPlace: place,
        targetDigit: digit,
        placeValue,
        correctAnswer: answer,
        problemKey: `digit_value:${number}:${place}`,
      };

      expect(number).toBeGreaterThanOrEqual(1_000);
      expect(number).toBeLessThanOrEqual(99_999);
      expect(placeValue).toBeLessThanOrEqual(10 ** (String(number).length - 1));
      expect(Number.isFinite(number)).toBe(true);
      expect(Number.isFinite(answer)).toBe(true);
      expect(problem.visualType).toBe("multiple_choice");
      expect(problem.correctAnswer).toBe(String(answer));
      expect(problem.problemKey).toBe(`digit_value:${number}:${place}`);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices.filter((choice) => Number(choice) === answer)).toHaveLength(1);
      expect(choices.every((choice) => Number.isFinite(Number(choice)))).toBe(true);
      expect(
        choices
          .filter((choice) => Number(choice) !== answer)
          .every((choice) =>
            getDigitValueDistractorCandidates(canonicalProblem).includes(Number(choice)),
          ),
      ).toBe(true);
    }
  });

  it("satisfies the requested count with unique canonical problem keys", () => {
    const problems = generateLargeDigitValueProblems({ seed: "keys", count: 30 });

    expect(problems).toHaveLength(30);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(30);
  });

  it("is deterministic for the same seed and varies across seeds", () => {
    const first = generateLargeDigitValueProblems({ seed: "same", count: 8 });
    const second = generateLargeDigitValueProblems({ seed: "same", count: 8 });
    const different = generateLargeDigitValueProblems({ seed: "different", count: 8 });

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(new Set(different.map((problem) => problem.problemKey)).size).toBeGreaterThan(1);
  });

  it("uses the standard practice count when no count is provided", () => {
    expect(generateLargeDigitValueProblems({ seed: "default-count" })).toHaveLength(8);
  });
});
