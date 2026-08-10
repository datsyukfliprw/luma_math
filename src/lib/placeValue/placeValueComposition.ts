export type BaseTenPlace = "ones" | "tens" | "hundreds" | "thousands";
export type PuzzlePlace = BaseTenPlace | "ten-thousands";
export type PlaceValueCompositionType = "base_ten_models" | "place_value_puzzles";
export type PlaceValueRng = {
  nextInt(min: number, max: number): number;
};

export type PlaceValuePart = {
  place: PuzzlePlace;
  placeValue: number;
  digit: number;
};

export type BaseTenBlock = {
  place: BaseTenPlace;
  placeValue: number;
  count: number;
};

export type BaseTenModelProblem = {
  form: "base_ten_models";
  number: number;
  blocks: BaseTenBlock[];
  correctAnswer: number;
  problemKey: `base_ten:${number}`;
};

export type PlaceValueClue = PlaceValuePart;

export type PlaceValuePuzzleProblem = {
  form: "place_value_puzzles";
  number: number;
  clues: PlaceValueClue[];
  correctAnswer: number;
  problemKey: `place_value_puzzle:${number}:riddle`;
};

export type PlaceValueCompositionProblem = BaseTenModelProblem | PlaceValuePuzzleProblem;

export const PLACE_VALUE_RANGES: Record<PlaceValueCompositionType, { min: number; max: number }> = {
  base_ten_models: { min: 10, max: 9_999 },
  place_value_puzzles: { min: 1_000, max: 99_999 },
};

const BASE_TEN_PLACES: readonly PlaceValuePart[] = [
  { place: "ones", placeValue: 1, digit: 0 },
  { place: "tens", placeValue: 10, digit: 0 },
  { place: "hundreds", placeValue: 100, digit: 0 },
  { place: "thousands", placeValue: 1_000, digit: 0 },
];

const PUZZLE_PLACES: readonly PlaceValuePart[] = [
  ...BASE_TEN_PLACES,
  { place: "ten-thousands", placeValue: 10_000, digit: 0 },
];

function getPlaceTemplate(type: PlaceValueCompositionType): readonly PlaceValuePart[] {
  return type === "base_ten_models" ? BASE_TEN_PLACES : PUZZLE_PLACES;
}

function assertInRange(number: number, type: PlaceValueCompositionType): void {
  const range = PLACE_VALUE_RANGES[type];
  if (!Number.isInteger(number) || number < range.min || number > range.max) {
    throw new RangeError(
      `${type} numbers must be integers from ${range.min} through ${range.max}`,
    );
  }
}

export function decomposePlaceValueNumber(
  number: number,
  type: PlaceValueCompositionType,
): PlaceValuePart[] {
  assertInRange(number, type);
  return getPlaceTemplate(type).map((part) => ({
    ...part,
    digit: Math.floor(number / part.placeValue) % 10,
  }));
}

export function generateBaseTenModelProblem(rng: PlaceValueRng): BaseTenModelProblem {
  const number = rng.nextInt(PLACE_VALUE_RANGES.base_ten_models.min, PLACE_VALUE_RANGES.base_ten_models.max);
  const parts = decomposePlaceValueNumber(number, "base_ten_models");

  return {
    form: "base_ten_models",
    number,
    blocks: parts.map(({ place, placeValue, digit }) => ({ place: place as BaseTenPlace, placeValue, count: digit })),
    correctAnswer: number,
    problemKey: `base_ten:${number}`,
  };
}

export function generatePlaceValuePuzzleProblem(rng: PlaceValueRng): PlaceValuePuzzleProblem {
  const number = rng.nextInt(
    PLACE_VALUE_RANGES.place_value_puzzles.min,
    PLACE_VALUE_RANGES.place_value_puzzles.max,
  );

  return {
    form: "place_value_puzzles",
    number,
    clues: decomposePlaceValueNumber(number, "place_value_puzzles"),
    correctAnswer: number,
    problemKey: `place_value_puzzle:${number}:riddle`,
  };
}

export function generatePlaceValueCompositionProblem(
  type: PlaceValueCompositionType,
  rng: PlaceValueRng,
): PlaceValueCompositionProblem {
  return type === "base_ten_models"
    ? generateBaseTenModelProblem(rng)
    : generatePlaceValuePuzzleProblem(rng);
}

function addCandidate(
  candidates: Set<number>,
  candidate: number,
  correct: number,
  type: PlaceValueCompositionType,
): void {
  const { min, max } = PLACE_VALUE_RANGES[type];
  if (Number.isInteger(candidate) && candidate >= min && candidate <= max && candidate !== correct) {
    candidates.add(candidate);
  }
}

/**
 * Return numeric answers based on common place-value misconceptions. The
 * adapter chooses three of these candidates for the multiple-choice display.
 */
export function getPlaceValueCompositionDistractorCandidates(
  problem: PlaceValueCompositionProblem,
): number[] {
  const candidates = new Set<number>();
  const type = problem.form;
  const placeCount = type === "base_ten_models" ? 4 : 5;
  const digits = String(problem.number).padStart(placeCount, "0").split("").map(Number);

  // Alter one place, including zeroing a non-zero place or filling a zero place.
  for (let index = 0; index < digits.length; index += 1) {
    for (let digit = 0; digit <= 9; digit += 1) {
      if (digit === digits[index] || (index === 0 && digit === 0)) continue;
      const altered = [...digits];
      altered[index] = digit;
      addCandidate(candidates, Number(altered.join("")), problem.number, type);
    }
  }

  // Swap two place values.
  for (let left = 0; left < digits.length; left += 1) {
    for (let right = left + 1; right < digits.length; right += 1) {
      if (digits[left] === digits[right]) continue;
      const swapped = [...digits];
      [swapped[left], swapped[right]] = [swapped[right], swapped[left]];
      addCandidate(candidates, Number(swapped.join("")), problem.number, type);
    }
  }

  // Omit an internal zero, a common failure to hold an empty place.
  for (let index = 1; index < digits.length - 1; index += 1) {
    if (digits[index] !== 0) continue;
    addCandidate(candidates, Number(digits.filter((_, digitIndex) => digitIndex !== index).join("")), problem.number, type);
  }

  // Treat one block as an adjacent place by moving its value one place left
  // or right. The range check removes invalid leading/short answers.
  for (let index = 0; index < digits.length; index += 1) {
    if (digits[index] === 0) continue;
    const placeValue = 10 ** (digits.length - index - 1);
    for (const adjacentPlaceValue of [placeValue / 10, placeValue * 10]) {
      addCandidate(
        candidates,
        problem.number - digits[index] * placeValue + digits[index] * adjacentPlaceValue,
        problem.number,
        type,
      );
    }
  }

  return [...candidates];
}
