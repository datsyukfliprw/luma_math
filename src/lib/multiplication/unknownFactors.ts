import {
  FACTOR_RANGE,
  createMultiplicationFact,
  type MultiplicationRng,
} from "./core";

export type UnknownFactorPosition = "left" | "right";

export type UnknownFactorState = {
  factorA: number;
  factorB: number;
  product: number;
  knownFactor: number;
  missingFactor: number;
  unknownPosition: UnknownFactorPosition;
};

export type UnknownFactorKeyState = Pick<
  UnknownFactorState,
  "knownFactor" | "missingFactor" | "product"
>;

export const UNKNOWN_FACTOR_RANGE = {
  factorA: FACTOR_RANGE,
  factorB: FACTOR_RANGE,
} as const;

export const UNKNOWN_FACTOR_POSITIONS: readonly UnknownFactorPosition[] = ["left", "right"];

function assertFactorInRange(value: number, name: string): void {
  if (!Number.isInteger(value) || value < FACTOR_RANGE.min || value > FACTOR_RANGE.max) {
    throw new RangeError(
      `${name} must be an integer from ${FACTOR_RANGE.min} through ${FACTOR_RANGE.max}`,
    );
  }
}

export function createUnknownFactorState(
  factorA: number,
  factorB: number,
  unknownPosition: UnknownFactorPosition,
): UnknownFactorState {
  assertFactorInRange(factorA, "factorA");
  assertFactorInRange(factorB, "factorB");
  if (!UNKNOWN_FACTOR_POSITIONS.includes(unknownPosition)) {
    throw new RangeError(`unknownPosition must be left or right`);
  }

  const fact = createMultiplicationFact(factorA, factorB);
  return {
    ...fact,
    knownFactor: unknownPosition === "left" ? factorB : factorA,
    missingFactor: unknownPosition === "left" ? factorA : factorB,
    unknownPosition,
  };
}

/** Enumerates every canonical known/missing factor role pair once. */
export function enumerateUnknownFactorStates(): UnknownFactorState[] {
  const states: UnknownFactorState[] = [];

  for (let knownFactor = FACTOR_RANGE.min; knownFactor <= FACTOR_RANGE.max; knownFactor += 1) {
    for (let missingFactor = FACTOR_RANGE.min; missingFactor <= FACTOR_RANGE.max; missingFactor += 1) {
      states.push(createUnknownFactorState(missingFactor, knownFactor, "left"));
    }
  }

  return states;
}

export function generateUnknownFactorState(
  rng: MultiplicationRng,
  unknownPosition?: UnknownFactorPosition,
): UnknownFactorState {
  const knownFactor = rng.nextInt(FACTOR_RANGE.min, FACTOR_RANGE.max);
  const missingFactor = rng.nextInt(FACTOR_RANGE.min, FACTOR_RANGE.max);
  const position =
    unknownPosition ?? UNKNOWN_FACTOR_POSITIONS[rng.nextInt(0, UNKNOWN_FACTOR_POSITIONS.length - 1)];
  return position === "left"
    ? createUnknownFactorState(missingFactor, knownFactor, position)
    : createUnknownFactorState(knownFactor, missingFactor, position);
}

export function getUnknownFactorAnswer(state: UnknownFactorState): number {
  return state.unknownPosition === "left" ? state.factorA : state.factorB;
}

/** The key describes the canonical known/missing factor roles, not presentation. */
export function unknownFactorProblemKey(state: UnknownFactorKeyState): string {
  return `multiplication:unknown:known=${state.knownFactor}:missing=${state.missingFactor}:product=${state.product}`;
}

/**
 * Returns factor-range answers suggested by common missing-factor errors.
 * Candidates include the visible factor, product/addition confusion, and
 * nearby quotient/fact errors; the correct answer is always excluded.
 */
export function getUnknownFactorMisconceptionCandidates(state: UnknownFactorState): number[] {
  const correct = getUnknownFactorAnswer(state);
  const knownFactor = state.unknownPosition === "left" ? state.factorB : state.factorA;
  const candidates = [
    knownFactor,
    state.product,
    state.factorA + state.factorB,
    correct - 1,
    correct + 1,
    correct - 2,
    correct + 2,
    correct - 3,
    correct + 3,
  ];

  return [...new Set(candidates)].filter(
    (candidate) =>
      Number.isInteger(candidate) &&
      candidate >= FACTOR_RANGE.min &&
      candidate <= FACTOR_RANGE.max &&
      candidate !== correct,
  );
}
