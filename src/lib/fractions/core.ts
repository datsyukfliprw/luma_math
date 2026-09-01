export type FractionState = {
  numerator: number;
  denominator: number;
};

export type FractionComparison = -1 | 0 | 1;

export const GRADE3_FRACTION_DENOMINATORS = [2, 3, 4, 5, 6, 7, 8] as const;

function assertInteger(name: string, value: number): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} (${value}) must be an integer`);
  }
}

export function createFractionState(numerator: number, denominator: number): FractionState {
  assertInteger("numerator", numerator);
  assertInteger("denominator", denominator);
  if (denominator <= 0) throw new RangeError("denominator must be positive");
  if (numerator < 0) throw new RangeError("numerator must be non-negative");
  return { numerator, denominator };
}

export function createProperFractionState(numerator: number, denominator: number): FractionState {
  const state = createFractionState(numerator, denominator);
  if (state.numerator <= 0 || state.numerator >= state.denominator) {
    throw new RangeError("proper fraction must satisfy 0 < numerator < denominator");
  }
  return state;
}

export function formatFraction(state: FractionState): string {
  return `${state.numerator}/${state.denominator}`;
}

export function fractionValue(state: FractionState): number {
  return state.numerator / state.denominator;
}

export function gcd(a: number, b: number): number {
  assertInteger("a", a);
  assertInteger("b", b);
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }
  return x || 1;
}

export function reduceFraction(state: FractionState): FractionState {
  const divisor = gcd(state.numerator, state.denominator);
  return createFractionState(state.numerator / divisor, state.denominator / divisor);
}

export function scaleFraction(state: FractionState, multiplier: number): FractionState {
  assertInteger("multiplier", multiplier);
  if (multiplier <= 0) throw new RangeError("multiplier must be positive");
  return createFractionState(
    state.numerator * multiplier,
    state.denominator * multiplier,
  );
}

export function areEquivalentFractions(a: FractionState, b: FractionState): boolean {
  return a.numerator * b.denominator === b.numerator * a.denominator;
}

export function compareFractions(a: FractionState, b: FractionState): FractionComparison {
  const left = a.numerator * b.denominator;
  const right = b.numerator * a.denominator;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function comparisonSymbol(a: FractionState, b: FractionState): "<" | "=" | ">" {
  const comparison = compareFractions(a, b);
  return comparison < 0 ? "<" : comparison > 0 ? ">" : "=";
}

export function fractionProblemKey(
  practiceType: string,
  state: FractionState,
  task: string,
  extra?: string,
): string {
  const suffix = extra ? `:${extra}` : "";
  return `fraction:${practiceType}:n=${state.numerator}:d=${state.denominator}:task=${task}${suffix}`;
}

export function fractionPairProblemKey(
  practiceType: string,
  a: FractionState,
  b: FractionState,
  task: string,
  extra?: string,
): string {
  const suffix = extra ? `:${extra}` : "";
  return `fraction:${practiceType}:a=${formatFraction(a)}:b=${formatFraction(b)}:task=${task}${suffix}`;
}
