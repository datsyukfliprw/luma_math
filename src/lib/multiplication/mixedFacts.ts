import {
  createMultiplicationFact,
  multiplicationFactKey,
  type MultiplicationFact,
  type MultiplicationRng,
} from "./core";

export type MixedFactState = {
  factorA: number;
  factorB: number;
  product: number;
  fact: MultiplicationFact;
};

export const MIXED_FACT_RANGE = { min: 0, max: 9 } as const;

function assertFactorInRange(value: number, name: string): void {
  if (!Number.isInteger(value) || value < MIXED_FACT_RANGE.min || value > MIXED_FACT_RANGE.max) {
    throw new RangeError(
      `${name} must be an integer from ${MIXED_FACT_RANGE.min} through ${MIXED_FACT_RANGE.max}`,
    );
  }
}

export function enumerateMixedFactStates(): MixedFactState[] {
  const states: MixedFactState[] = [];

  for (let a = MIXED_FACT_RANGE.min; a <= MIXED_FACT_RANGE.max; a += 1) {
    for (let b = a; b <= MIXED_FACT_RANGE.max; b += 1) {
      states.push(createMixedFactState(a, b));
    }
  }

  return states;
}

export function createMixedFactState(factorA: number, factorB: number): MixedFactState {
  assertFactorInRange(factorA, "factorA");
  assertFactorInRange(factorB, "factorB");

  const a = Math.min(factorA, factorB);
  const b = Math.max(factorA, factorB);
  const fact = createMultiplicationFact(a, b);

  return { factorA: a, factorB: b, product: fact.product, fact };
}

export function generateMixedFact(rng: MultiplicationRng): MixedFactState {
  return createMixedFactState(
    rng.nextInt(MIXED_FACT_RANGE.min, MIXED_FACT_RANGE.max),
    rng.nextInt(MIXED_FACT_RANGE.min, MIXED_FACT_RANGE.max),
  );
}

export function mixedFactProblemKey(state: MixedFactState): string {
  return multiplicationFactKey(state.fact);
}

/**
 * Return plausible numeric answers from mixed-fact misconceptions.
 * Adapters choose and shuffle the required number of these candidates.
 */
export function getMixedFactMisconceptionCandidates(state: MixedFactState): number[] {
  const { factorA: a, factorB: b, product } = state;

  const candidates = [
    a + b,
    product + 1,
    product - 1,
    a,
    b,
    a * (b + 1),
    a * (b - 1),
    (a + 1) * b,
    (a - 1) * b,
    (a + 1) * (b + 1),
    (a - 1) * (b - 1),
    (a + 1) * (b - 1),
    (a - 1) * (b + 1),
    (a + 2) * (b + 1),
    (a + 1) * (b + 2),
    (a + 2) * (b + 2),
  ];

  return [...new Set(candidates)].filter(
    (candidate) =>
      Number.isInteger(candidate) && candidate >= 0 && candidate <= 81 && candidate !== product,
  );
}
