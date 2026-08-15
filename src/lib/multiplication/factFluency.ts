import {
  createMultiplicationFact,
  multiplicationFactKey,
  type MultiplicationFact,
  type MultiplicationRange,
} from "./core";

export const FIXED_FACTOR_FACT_PRACTICE_TYPES = [
  "multiply_by_3",
  "multiply_by_4",
  "multiply_by_6",
  "multiply_by_7",
  "multiply_by_8",
  "multiply_by_9",
] as const;

export type FixedFactorFactPracticeType = (typeof FIXED_FACTOR_FACT_PRACTICE_TYPES)[number];
export type FixedFactor = 3 | 4 | 6 | 7 | 8 | 9;

export type FixedFactorFactState = {
  fixedFactor: FixedFactor;
  otherFactor: number;
  product: number;
  fact: MultiplicationFact;
};

const FIXED_FACTORS: Record<FixedFactorFactPracticeType, FixedFactor> = {
  multiply_by_3: 3,
  multiply_by_4: 4,
  multiply_by_6: 6,
  multiply_by_7: 7,
  multiply_by_8: 8,
  multiply_by_9: 9,
};

export const FIXED_FACTOR_FACT_RANGES: Record<
  FixedFactorFactPracticeType,
  MultiplicationRange
> = {
  multiply_by_3: { min: 2, max: 9 },
  multiply_by_4: { min: 2, max: 9 },
  multiply_by_6: { min: 2, max: 9 },
  multiply_by_7: { min: 2, max: 9 },
  multiply_by_8: { min: 2, max: 9 },
  multiply_by_9: { min: 2, max: 9 },
};

export function fixedFactorForPracticeType(practiceType: FixedFactorFactPracticeType): FixedFactor {
  return FIXED_FACTORS[practiceType];
}

export function createFixedFactorFactState(
  fixedFactor: FixedFactor,
  otherFactor: number,
): FixedFactorFactState {
  const fact = createMultiplicationFact(fixedFactor, otherFactor);
  return {
    fixedFactor,
    otherFactor,
    product: fact.product,
    fact,
  };
}

export function fixedFactorFactProblemKey(state: FixedFactorFactState): string {
  return multiplicationFactKey(state.fact);
}

/**
 * Return plausible numeric answers from fact-fluency misconceptions.
 * Adapters choose and shuffle the required number of these candidates.
 */
export function getFixedFactorFactMisconceptionCandidates(state: FixedFactorFactState): number[] {
  const { fixedFactor, otherFactor, product } = state;
  const candidates = [
    product - fixedFactor,
    product + fixedFactor,
    fixedFactor + otherFactor,
    product - 1,
    product + 1,
    fixedFactor * (otherFactor - 1),
    fixedFactor * (otherFactor + 1),
  ];

  return [...new Set(candidates)].filter(
    (candidate) => candidate >= 0 && candidate <= 81 && candidate !== product,
  );
}
