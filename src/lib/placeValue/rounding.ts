import type { SeededRng } from "../../practiceTypes/random";
import type {
  EstimationProblem,
  RoundingPracticeType,
  RoundingProblem,
} from "./types";

const ROUNDING_PLACES = [10, 100, 1_000] as const;

export function roundToPlace(number: number, targetPlace: number): number {
  return Math.floor((number + targetPlace / 2) / targetPlace) * targetPlace;
}

function generateNumberForPlace(targetPlace: 10 | 100 | 1_000, rng: SeededRng): number {
  const minimum = targetPlace;
  const maximum = targetPlace === 1_000 ? 99_999 : targetPlace === 100 ? 9_999 : 999;
  return rng.nextInt(minimum, maximum);
}

export function generateRoundingProblem(
  practiceType: RoundingPracticeType,
  rng: SeededRng,
): RoundingProblem {
  const targetPlace: 10 | 100 | 1_000 =
    practiceType === "round_ten"
      ? 10
      : practiceType === "round_hundred"
        ? 100
        : rng.pick(ROUNDING_PLACES);
  const number = generateNumberForPlace(targetPlace, rng);

  return {
    form: "rounding",
    number,
    targetPlace,
    correctAnswer: roundToPlace(number, targetPlace),
    problemKey: `rounding:${number}:${targetPlace}`,
  };
}

export function generateEstimationProblem(rng: SeededRng): EstimationProblem {
  const operation = rng.nextInt(0, 1) === 0 ? "addition" : "subtraction";
  const targetPlace: 10 | 100 = rng.nextInt(0, 1) === 0 ? 10 : 100;
  const left = rng.nextInt(targetPlace * 2, targetPlace === 100 ? 999 : 999);
  let right = rng.nextInt(targetPlace * 2, targetPlace === 100 ? 999 : 999);

  if (operation === "subtraction") {
    right = rng.nextInt(targetPlace * 2, left);
  }

  const roundedLeft = roundToPlace(left, targetPlace);
  const roundedRight = roundToPlace(right, targetPlace);
  const correctAnswer =
    operation === "addition" ? roundedLeft + roundedRight : roundedLeft - roundedRight;

  return {
    form: "estimation",
    operation,
    left,
    right,
    targetPlace,
    correctAnswer,
    problemKey: `estimate:${operation}:${left}:${right}:${targetPlace}`,
  };
}
