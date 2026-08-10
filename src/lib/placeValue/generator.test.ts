import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import { generateDigitValueProblem } from "./generator";
import type { DigitValueProblem, PlaceValue } from "./types";

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

describe("digit-value problem generator", () => {
  it("derives the answer and key from the displayed mathematical identity", () => {
    const problem: DigitValueProblem = generateDigitValueProblem(createSeededRng("unit-11"));
    const placeValue = PLACE_VALUES[problem.targetPlace];
    const digit = independentlyExtractDigit(problem.number, placeValue);

    expect(problem.form).toBe("digit_value");
    expect(problem.placeValue).toBe(placeValue);
    expect(problem.targetDigit).toBe(digit);
    expect(problem.correctAnswer).toBe(digit * placeValue);
    expect(problem.problemKey).toBe(
      `digit_value:${problem.number}:${problem.targetPlace}`,
    );
  });

  it("is deterministic for the same seed", () => {
    expect(generateDigitValueProblem(createSeededRng("same-seed"))).toEqual(
      generateDigitValueProblem(createSeededRng("same-seed")),
    );
  });

  it("varies across a reasonable set of different seeds", () => {
    const problems = Array.from({ length: 20 }, (_, index) =>
      generateDigitValueProblem(createSeededRng(`seed-${index}`)),
    );

    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBeGreaterThan(1);
  });

  it("selects only valid occupied places for two- through five-digit numbers", () => {
    for (let index = 0; index < 100; index += 1) {
      const problem = generateDigitValueProblem(createSeededRng(`valid-${index}`));
      const placeValue = PLACE_VALUES[problem.targetPlace];

      expect(problem.number).toBeGreaterThanOrEqual(10);
      expect(problem.number).toBeLessThanOrEqual(99_999);
      expect(placeValue).toBeLessThanOrEqual(10 ** (String(problem.number).length - 1));
      expect(problem.targetDigit).toBeGreaterThanOrEqual(0);
      expect(problem.targetDigit).toBeLessThanOrEqual(9);
    }
  });
});
