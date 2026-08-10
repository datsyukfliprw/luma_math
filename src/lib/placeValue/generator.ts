import type { SeededRng } from "../../practiceTypes/random";
import type { DigitValueProblem, PlaceValue } from "./types";

const PLACES: readonly PlaceValue[] = [
  "ones",
  "tens",
  "hundreds",
  "thousands",
  "ten thousands",
];

const PLACE_VALUES = [1, 10, 100, 1_000, 10_000] as const;

export type DigitValueGenerationOptions = {
  numberRange?: {
    min: number;
    max: number;
  };
};

export function generateDigitValueProblem(
  rng: SeededRng,
  options?: DigitValueGenerationOptions,
): DigitValueProblem {
  const numberRange = options?.numberRange;
  let number: number;
  let highestPlaceIndex: number;

  if (numberRange) {
    number = rng.nextInt(numberRange.min, numberRange.max);
    highestPlaceIndex = String(number).length - 1;
  } else {
    const digitCount = rng.nextInt(2, 5);
    number = rng.nextInt(10 ** (digitCount - 1), 10 ** digitCount - 1);
    highestPlaceIndex = digitCount - 1;
  }

  const placeIndex = rng.nextInt(0, highestPlaceIndex);
  const placeValue = PLACE_VALUES[placeIndex];
  const targetDigit = Math.floor(number / placeValue) % 10;

  return {
    form: "digit_value",
    number,
    targetPlace: PLACES[placeIndex],
    targetDigit,
    placeValue,
    correctAnswer: targetDigit * placeValue,
    problemKey: `digit_value:${number}:${PLACES[placeIndex]}`,
  };
}
