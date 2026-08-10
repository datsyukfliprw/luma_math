import type { DigitValueProblem } from "./types";

const PLACE_VALUES = [1, 10, 100, 1_000, 10_000] as const;

/**
 * Return domain-specific wrong answers for a digit-value question.
 *
 * The pool intentionally includes common interpretation errors: reading the
 * digit alone, reading a represented place unit as the answer, using the
 * whole number, or placing the target digit in an adjacent place. The correct
 * answer is removed after the pool is deduplicated.
 */
export function getDigitValueDistractorCandidates(problem: DigitValueProblem): number[] {
  const targetPlaceIndex = PLACE_VALUES.indexOf(problem.placeValue as (typeof PLACE_VALUES)[number]);
  const firstUnrepresentedPlaceIndex = PLACE_VALUES.findIndex(
    (placeValue) => placeValue > problem.number,
  );
  const highestRepresentedPlaceIndex =
    firstUnrepresentedPlaceIndex === -1 ? PLACE_VALUES.length - 1 : firstUnrepresentedPlaceIndex - 1;
  const representedPlaceValues = PLACE_VALUES.slice(0, highestRepresentedPlaceIndex + 1);
  const adjacentPlaceValues = [
    PLACE_VALUES[targetPlaceIndex - 1],
    PLACE_VALUES[targetPlaceIndex + 1],
  ].filter((placeValue) => placeValue !== undefined);
  const targetDigitValues = adjacentPlaceValues.map(
    (placeValue) => problem.targetDigit * placeValue,
  );
  const candidates = [
    problem.targetDigit,
    ...representedPlaceValues,
    problem.number,
    ...targetDigitValues,
  ];

  const uniqueCandidates = [...new Set(candidates)].filter(
    (candidate) => candidate !== problem.correctAnswer,
  );

  if (
    uniqueCandidates.length < 3 &&
    problem.correctAnswer !== 0 &&
    String(problem.number).includes("0")
  ) {
    uniqueCandidates.push(0);
  }

  if (uniqueCandidates.length < 3 && highestRepresentedPlaceIndex < PLACE_VALUES.length - 1) {
    uniqueCandidates.push(PLACE_VALUES[highestRepresentedPlaceIndex + 1]);
  }

  return [...new Set(uniqueCandidates)].filter((candidate) => candidate !== problem.correctAnswer);
}
