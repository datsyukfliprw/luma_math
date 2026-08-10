import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import { generateDigitValueProblem } from "./generator";
import { getDigitValueDistractorCandidates } from "./distractors";
import type { DigitValueProblem } from "./types";

const PLACE_VALUES = [1, 10, 100, 1_000, 10_000] as const;

function problem(overrides: Partial<DigitValueProblem>): DigitValueProblem {
  return {
    form: "digit_value",
    number: 4_205,
    targetPlace: "hundreds",
    targetDigit: 2,
    placeValue: 100,
    correctAnswer: 200,
    problemKey: "digit_value:4205:hundreds",
    ...overrides,
  };
}

function isPlaceValueMisconception(candidate: number, current: DigitValueProblem): boolean {
  const isBareDigit = candidate === current.targetDigit;
  const highestRepresentedPlace = PLACE_VALUES.findIndex(
    (placeValue) => placeValue > current.number,
  );
  const representedPlaceCount =
    highestRepresentedPlace === -1 ? PLACE_VALUES.length : highestRepresentedPlace;
  const isPlaceUnit = PLACE_VALUES.slice(0, representedPlaceCount + 1).includes(
    candidate as (typeof PLACE_VALUES)[number],
  );
  const isWholeNumber = candidate === current.number;
  const isAdjacentPlaceInterpretation = PLACE_VALUES.some(
    (placeValue, index) =>
      Math.abs(index - PLACE_VALUES.indexOf(current.placeValue as (typeof PLACE_VALUES)[number])) ===
        1 &&
      candidate === current.targetDigit * placeValue,
  );

  return isBareDigit || isPlaceUnit || isWholeNumber || isAdjacentPlaceInterpretation;
}

function generatedProblems(count: number): DigitValueProblem[] {
  const problems: DigitValueProblem[] = [];
  for (let seed = 0; seed < count; seed += 1) {
    problems.push(generateDigitValueProblem(createSeededRng(`distractors-${seed}`)));
  }
  return problems;
}

describe("getDigitValueDistractorCandidates", () => {
  it("returns deterministic, unique wrong candidates for generated problems", () => {
    for (const current of generatedProblems(2_000)) {
      const candidates = getDigitValueDistractorCandidates(current);

      expect(getDigitValueDistractorCandidates(current)).toEqual(candidates);
      expect(candidates.length).toBeGreaterThanOrEqual(3);
      expect(new Set(candidates).size).toBe(candidates.length);
      expect(candidates.every((candidate) => Number.isFinite(candidate))).toBe(true);
      expect(candidates.every((candidate) => Number.isInteger(candidate))).toBe(true);
      expect(candidates.every((candidate) => candidate >= 0)).toBe(true);
      expect(candidates).not.toContain(current.correctAnswer);
    }
  });

  it("uses place-value misconception categories instead of arithmetic noise", () => {
    for (const current of generatedProblems(500)) {
      const candidates = getDigitValueDistractorCandidates(current);

      expect(candidates.every((candidate) => isPlaceValueMisconception(candidate, current))).toBe(
        true,
      );
    }
  });

  it("supports zero target digits", () => {
    const current = problem({
      number: 4_005,
      targetPlace: "hundreds",
      targetDigit: 0,
      placeValue: 100,
      correctAnswer: 0,
      problemKey: "digit_value:4005:hundreds",
    });

    const candidates = getDigitValueDistractorCandidates(current);

    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(candidates).not.toContain(0);
    expect(candidates.every((candidate) => isPlaceValueMisconception(candidate, current))).toBe(
      true,
    );
  });

  it("supports the ones and ten-thousands places", () => {
    const edgeProblems = [
      problem({
        number: 47,
        targetPlace: "ones",
        targetDigit: 7,
        placeValue: 1,
        correctAnswer: 7,
        problemKey: "digit_value:47:ones",
      }),
      problem({
        number: 54_321,
        targetPlace: "ten thousands",
        targetDigit: 5,
        placeValue: 10_000,
        correctAnswer: 50_000,
        problemKey: "digit_value:54321:ten thousands",
      }),
    ];

    for (const current of edgeProblems) {
      const candidates = getDigitValueDistractorCandidates(current);

      expect(candidates.length).toBeGreaterThanOrEqual(3);
      expect(candidates).not.toContain(current.correctAnswer);
      expect(candidates.every((candidate) => isPlaceValueMisconception(candidate, current))).toBe(
        true,
      );
    }
  });

  it("does not use unnecessarily distant places for ordinary two-digit problems", () => {
    const current = problem({
      number: 47,
      targetPlace: "ones",
      targetDigit: 7,
      placeValue: 1,
      correctAnswer: 7,
      problemKey: "digit_value:47:ones",
    });

    const candidates = getDigitValueDistractorCandidates(current);

    expect(candidates).not.toContain(7_000);
    expect(candidates).not.toContain(70_000);
    expect(candidates).not.toContain(1_000);
    expect(candidates).not.toContain(10_000);
  });

  it("uses genuinely adjacent place shifts when they are included", () => {
    const current = problem({
      number: 4_205,
      targetPlace: "hundreds",
      targetDigit: 2,
      placeValue: 100,
      correctAnswer: 200,
    });

    const candidates = getDigitValueDistractorCandidates(current);

    expect(candidates).toContain(20);
    expect(candidates).toContain(2_000);
    expect(candidates).not.toContain(20_000);
  });

  it("covers generated zero digits and every supported place", () => {
    const problems = generatedProblems(2_000);
    const zeroProblems = problems.filter((current) => current.targetDigit === 0);
    const places = new Set(problems.map((current) => current.targetPlace));

    expect(zeroProblems.length).toBeGreaterThan(0);
    expect(places).toEqual(
      new Set(["ones", "tens", "hundreds", "thousands", "ten thousands"]),
    );
  });
});
