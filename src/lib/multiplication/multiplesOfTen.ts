import type { MultiplicationRng } from "./core";

export type ScaledFactTask = "connect" | "product";

export type ScaledFactState = {
  oneDigit: number;
  tensDigit: number;
  basicProduct: number;
  multipleOfTen: number;
  scaledProduct: number;
};

export type TenPatternState = {
  oneDigit: number;
  startTensDigit: number;
  length: number;
  missingIndex: number;
  tensDigits: number[];
  products: number[];
  constantDifference: number;
};

export const ONE_DIGIT_RANGE = { min: 1, max: 9 } as const;
export const TENS_DIGIT_RANGE = { min: 1, max: 9 } as const;
export const TEN_PATTERN_LENGTH = 4;
export const TEN_PATTERN_START_RANGE = { min: 1, max: 6 } as const;

function assertIntegerInRange(
  value: number,
  range: { min: number; max: number },
  name: string,
): void {
  if (!Number.isInteger(value) || value < range.min || value > range.max) {
    throw new RangeError(`${name} must be an integer from ${range.min} through ${range.max}`);
  }
}

/** The mathematical state shared by the three scaled-fact objectives. */
export function createScaledFactState(oneDigit: number, tensDigit: number): ScaledFactState {
  assertIntegerInRange(oneDigit, ONE_DIGIT_RANGE, "oneDigit");
  assertIntegerInRange(tensDigit, TENS_DIGIT_RANGE, "tensDigit");

  const basicProduct = oneDigit * tensDigit;
  return {
    oneDigit,
    tensDigit,
    basicProduct,
    multipleOfTen: tensDigit * 10,
    scaledProduct: basicProduct * 10,
  };
}

export function generateScaledFactState(rng: MultiplicationRng): ScaledFactState {
  return createScaledFactState(
    rng.nextInt(ONE_DIGIT_RANGE.min, ONE_DIGIT_RANGE.max),
    rng.nextInt(TENS_DIGIT_RANGE.min, TENS_DIGIT_RANGE.max),
  );
}

/**
 * A word story is presentation for the same multiplication task, so its noun
 * and wording deliberately do not enter this key.
 */
export function scaledFactProblemKey(state: ScaledFactState, task: ScaledFactTask): string {
  return `multiplication:scaled-ten:a=${state.oneDigit}:d=${state.tensDigit}:task=${task}`;
}

export function listScaledFactStates(): ScaledFactState[] {
  const states: ScaledFactState[] = [];
  for (let oneDigit = ONE_DIGIT_RANGE.min; oneDigit <= ONE_DIGIT_RANGE.max; oneDigit += 1) {
    for (let tensDigit = TENS_DIGIT_RANGE.min; tensDigit <= TENS_DIGIT_RANGE.max; tensDigit += 1) {
      states.push(createScaledFactState(oneDigit, tensDigit));
    }
  }
  return states;
}

/** Numeric distractors for a scaled product, excluding the mathematically correct product. */
export function getScaledFactMisconceptionCandidates(state: ScaledFactState): number[] {
  const candidates = [
    state.basicProduct,
    state.scaledProduct - 10,
    state.scaledProduct + 10,
    state.scaledProduct * 10,
    state.oneDigit + state.multipleOfTen,
  ];
  return [...new Set(candidates)].filter(
    (candidate) => Number.isInteger(candidate) && candidate >= 0 && candidate !== state.scaledProduct,
  );
}

/**
 * A four-term sequence of products for consecutive multiples of ten. The
 * missing index is part of the learner-visible task because it changes which
 * term the learner must infer.
 */
export function createTenPatternState(
  oneDigit: number,
  startTensDigit: number,
  missingIndex: number,
  length = TEN_PATTERN_LENGTH,
): TenPatternState {
  assertIntegerInRange(oneDigit, ONE_DIGIT_RANGE, "oneDigit");
  if (!Number.isInteger(length) || length < 3) {
    throw new RangeError("length must be an integer of at least 3");
  }
  assertIntegerInRange(startTensDigit, TEN_PATTERN_START_RANGE, "startTensDigit");
  if (startTensDigit + length - 1 > TENS_DIGIT_RANGE.max) {
    throw new RangeError("pattern must not exceed 90");
  }
  if (!Number.isInteger(missingIndex) || missingIndex < 1 || missingIndex >= length) {
    throw new RangeError("missingIndex must identify a non-initial pattern term");
  }

  const tensDigits = Array.from({ length }, (_, index) => startTensDigit + index);
  const products = tensDigits.map((tensDigit) => oneDigit * tensDigit * 10);
  return {
    oneDigit,
    startTensDigit,
    length,
    missingIndex,
    tensDigits,
    products,
    constantDifference: oneDigit * 10,
  };
}

export function generateTenPatternState(rng: MultiplicationRng): TenPatternState {
  const missingIndex = rng.nextInt(1, TEN_PATTERN_LENGTH - 1);
  return createTenPatternState(
    rng.nextInt(ONE_DIGIT_RANGE.min, ONE_DIGIT_RANGE.max),
    rng.nextInt(TEN_PATTERN_START_RANGE.min, TEN_PATTERN_START_RANGE.max),
    missingIndex,
  );
}

export function tenPatternProblemKey(state: TenPatternState): string {
  return `multiplication:ten-pattern:a=${state.oneDigit}:start=${state.startTensDigit}:length=${state.length}:missing=${state.missingIndex}:task=missing-term`;
}

export function listTenPatternStates(): TenPatternState[] {
  const states: TenPatternState[] = [];
  for (let oneDigit = ONE_DIGIT_RANGE.min; oneDigit <= ONE_DIGIT_RANGE.max; oneDigit += 1) {
    for (
      let startTensDigit = TEN_PATTERN_START_RANGE.min;
      startTensDigit <= TEN_PATTERN_START_RANGE.max;
      startTensDigit += 1
    ) {
      for (let missingIndex = 1; missingIndex < TEN_PATTERN_LENGTH; missingIndex += 1) {
        states.push(createTenPatternState(oneDigit, startTensDigit, missingIndex));
      }
    }
  }
  return states;
}

export function getTenPatternMisconceptionCandidates(state: TenPatternState): number[] {
  const correct = state.products[state.missingIndex];
  const candidates = [
    correct - state.constantDifference,
    correct + state.constantDifference,
    correct + 10,
    correct - 10,
    correct + state.constantDifference * 2,
  ];
  return [...new Set(candidates)].filter(
    (candidate) => Number.isInteger(candidate) && candidate >= 0 && candidate !== correct,
  );
}
