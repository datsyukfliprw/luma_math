import { describe, expect, it } from "vitest";
import { getDigitValueDistractorCandidates } from "../lib/placeValue/distractors";
import { generateDigitValueProblem } from "../lib/placeValue/generator";
import type { PlaceValue } from "../lib/placeValue/types";
import { createSeededRng } from "./random";
import {
  generatePlaceValueDigitsProblems,
} from "./placeValueDigits";
import { generateProblemsForPracticeType, practiceRegistry } from "./registry";

const PLACE_VALUES: Record<string, number> = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1_000,
  "ten thousands": 10_000,
};

function expectedDigitValue(number: number, placeValue: number): number {
  return Math.floor(number / placeValue) % 10 * placeValue;
}

describe("place_value_digits Practice adapter", () => {
  it("generates mathematically correct multiple-choice problems from the shared model", () => {
    const problems = generatePlaceValueDigitsProblems({ seed: "semantic", count: 12 });

    expect(problems).toHaveLength(12);
    for (const problem of problems) {
      const match = problem.questionText.match(
        /^In the number (\d+), what is the value of the (.+) digit\?$/,
      );
      expect(match).not.toBeNull();

      const number = Number(match?.[1]);
      const place = match?.[2] ?? "";
      const placeValue = PLACE_VALUES[place];
      const answer = expectedDigitValue(number, placeValue);
      const canonicalProblem = {
        form: "digit_value" as const,
        number,
        targetPlace: place as PlaceValue,
        targetDigit: Math.floor(number / placeValue) % 10,
        placeValue,
        correctAnswer: answer,
        problemKey: `digit_value:${number}:${place}`,
      };
      const domainCandidates = getDigitValueDistractorCandidates(canonicalProblem);
      const choices = problem.visualData?.choices ?? [];

      expect(problem.visualType).toBe("multiple_choice");
      expect(problem.correctAnswer).toBe(String(answer));
      expect(problem.problemKey).toBe(`digit_value:${number}:${place}`);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(choices.length);
      expect(choices.filter((choice) => Number(choice) === answer)).toHaveLength(1);
      expect(
        choices
          .filter((choice) => Number(choice) !== answer)
          .every((choice) => domainCandidates.includes(Number(choice))),
      ).toBe(true);
      for (const noisyAnswer of [answer - 1, answer + 1]) {
        if (!domainCandidates.includes(noisyAnswer)) {
          expect(choices).not.toContain(String(noisyAnswer));
        }
      }
    }
  });

  it("uses the shared canonical problem key and honors uniqueness", () => {
    const problems = generatePlaceValueDigitsProblems({ seed: "keys", count: 30 });
    const expectedKeys = problems.map((problem) => {
      const match = problem.questionText.match(/number (\d+).+the (.+) digit/);
      return `digit_value:${match?.[1]}:${match?.[2]}`;
    });

    expect(problems.map((problem) => problem.problemKey)).toEqual(expectedKeys);
    expect(new Set(expectedKeys).size).toBe(problems.length);
  });

  it("is deterministic for the same seed and varies across seeds", () => {
    const first = generatePlaceValueDigitsProblems({ seed: "same", count: 8 });
    const second = generatePlaceValueDigitsProblems({ seed: "same", count: 8 });
    const different = generatePlaceValueDigitsProblems({ seed: "different", count: 8 });

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(new Set(different.map((problem) => problem.problemKey)).size).toBeGreaterThan(1);
  });

  it("registers only place_value_digits for this adapter", () => {
    expect(practiceRegistry.place_value_digits).toBe(generatePlaceValueDigitsProblems);

    const problems = generateProblemsForPracticeType("place_value_digits", {
      seed: "registry",
      count: 1,
    });

    expect(problems).toHaveLength(1);
    expect(problems[0].problemKey).toMatch(/^digit_value:/);
    expect(generateDigitValueProblem(createSeededRng("registry")).form).toBe("digit_value");
  });
});
