export type DivisionRng = {
  nextInt(min: number, max: number): number;
};

export type DivisionRange = { min: number; max: number };

export type DivisionFact = {
  dividend: number;
  divisor: number;
  quotient: number;
};

export type DivisionUnknownRole = "dividend" | "divisor" | "quotient";
export type DivisionModelTask = DivisionUnknownRole | "equation";
export type DivisionArrayKnownDimension = "rows" | "columns";

export type DivisionModel =
  | "sharing"
  | "counting-groups"
  | "array"
  | "number-line"
  | "related-multiplication";

export type DivisionSpecialState =
  | {
      rule: "divide-by-one";
      dividend: number;
      divisor: 1;
      quotient: number;
    }
  | {
      rule: "zero-dividend";
      dividend: 0;
      divisor: number;
      quotient: 0;
    }
  | {
      rule: "divide-by-zero";
      dividend: number;
      divisor: 0;
      quotient: null;
    };

export const DIVISION_FACT_RANGE = {
  divisor: { min: 2, max: 9 },
  quotient: { min: 2, max: 9 },
} as const;

export const FIXED_DIVISORS = [6, 7, 8, 9] as const;
export type FixedDivisor = (typeof FIXED_DIVISORS)[number];

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

function assertRange(range: DivisionRange, name: string, minimum: number): void {
  if (!Number.isInteger(range.min) || !Number.isInteger(range.max)) {
    throw new RangeError(`${name} bounds must be integers`);
  }
  if (range.min < minimum || range.max < minimum) {
    throw new RangeError(`${name} bounds must be >= ${minimum}`);
  }
  if (range.min > range.max) {
    throw new RangeError(`${name}.min must be <= ${name}.max`);
  }
}

export function createDivisionFact(divisor: number, quotient: number): DivisionFact {
  assertPositiveInteger(divisor, "divisor");
  assertNonNegativeInteger(quotient, "quotient");
  return {
    dividend: divisor * quotient,
    divisor,
    quotient,
  };
}

export function createDivisionFactFromEquation(dividend: number, divisor: number): DivisionFact {
  assertNonNegativeInteger(dividend, "dividend");
  assertPositiveInteger(divisor, "divisor");
  if (dividend % divisor !== 0) {
    throw new RangeError("division fact must have a whole-number quotient");
  }
  return {
    dividend,
    divisor,
    quotient: dividend / divisor,
  };
}

export function enumerateDivisionFacts(
  ranges: {
    divisor?: DivisionRange;
    quotient?: DivisionRange;
  } = {},
): DivisionFact[] {
  const divisorRange = ranges.divisor ?? DIVISION_FACT_RANGE.divisor;
  const quotientRange = ranges.quotient ?? DIVISION_FACT_RANGE.quotient;
  assertRange(divisorRange, "divisor range", 1);
  assertRange(quotientRange, "quotient range", 0);

  const facts: DivisionFact[] = [];
  for (let divisor = divisorRange.min; divisor <= divisorRange.max; divisor += 1) {
    for (let quotient = quotientRange.min; quotient <= quotientRange.max; quotient += 1) {
      facts.push(createDivisionFact(divisor, quotient));
    }
  }
  return facts;
}

export function generateDivisionFact(
  rng: DivisionRng,
  ranges: {
    divisor?: DivisionRange;
    quotient?: DivisionRange;
  } = {},
): DivisionFact {
  const divisorRange = ranges.divisor ?? DIVISION_FACT_RANGE.divisor;
  const quotientRange = ranges.quotient ?? DIVISION_FACT_RANGE.quotient;
  assertRange(divisorRange, "divisor range", 1);
  assertRange(quotientRange, "quotient range", 0);

  return createDivisionFact(
    rng.nextInt(divisorRange.min, divisorRange.max),
    rng.nextInt(quotientRange.min, quotientRange.max),
  );
}

export function enumerateFixedDivisorFacts(
  divisor: FixedDivisor,
  quotientRange: DivisionRange = DIVISION_FACT_RANGE.quotient,
): DivisionFact[] {
  if (!FIXED_DIVISORS.includes(divisor)) {
    throw new RangeError(`fixed divisor must be one of ${FIXED_DIVISORS.join(", ")}`);
  }
  return enumerateDivisionFacts({ divisor: { min: divisor, max: divisor }, quotient: quotientRange });
}

export function generateFixedDivisorFact(
  rng: DivisionRng,
  divisor: FixedDivisor,
  quotientRange: DivisionRange = DIVISION_FACT_RANGE.quotient,
): DivisionFact {
  if (!FIXED_DIVISORS.includes(divisor)) {
    throw new RangeError(`fixed divisor must be one of ${FIXED_DIVISORS.join(", ")}`);
  }
  assertRange(quotientRange, "quotient range", 0);
  return createDivisionFact(divisor, rng.nextInt(quotientRange.min, quotientRange.max));
}

export function createDivideByOneState(dividend: number): DivisionSpecialState {
  assertNonNegativeInteger(dividend, "dividend");
  return {
    rule: "divide-by-one",
    dividend,
    divisor: 1,
    quotient: dividend,
  };
}

export function createZeroDividendState(divisor: number): DivisionSpecialState {
  assertPositiveInteger(divisor, "divisor");
  return {
    rule: "zero-dividend",
    dividend: 0,
    divisor,
    quotient: 0,
  };
}

export function createDivideByZeroState(dividend: number): DivisionSpecialState {
  assertNonNegativeInteger(dividend, "dividend");
  return {
    rule: "divide-by-zero",
    dividend,
    divisor: 0,
    quotient: null,
  };
}

export function getDivisionAnswer(state: DivisionFact, role: DivisionUnknownRole): number {
  return state[role];
}

/** Exact division facts preserve divisor/quotient directionality. */
export function divisionFactProblemKey(state: DivisionFact): string {
  return `division:fact:dividend=${state.dividend}:divisor=${state.divisor}:quotient=${state.quotient}`;
}

/** Missing-number identity includes which mathematical role the learner must recover. */
export function divisionEquationProblemKey(
  state: DivisionFact,
  unknownRole: DivisionUnknownRole,
): string {
  return `${divisionFactProblemKey(state)}:ask=${unknownRole}`;
}

/** Model identity preserves the learner-visible interpretation, not just the equation. */
export function divisionModelProblemKey(
  state: DivisionFact,
  model: DivisionModel,
  task: DivisionModelTask = "quotient",
): string {
  return `division:model:${model}:dividend=${state.dividend}:divisor=${state.divisor}:quotient=${state.quotient}:ask=${task}`;
}

/** Array identity preserves whether rows or columns are the known dimension. */
export function divisionArrayProblemKey(
  state: DivisionFact,
  knownDimension: DivisionArrayKnownDimension,
): string {
  return `${divisionModelProblemKey(state, "array", "quotient")}:known=${knownDimension}`;
}

/** A fact family is the same family when the two factors trade places. */
export function divisionFactFamilyProblemKey(state: DivisionFact): string {
  const [factorA, factorB] = [state.divisor, state.quotient].sort((left, right) => left - right);
  return `division:fact-family:a=${factorA}:b=${factorB}:product=${state.dividend}`;
}

export function divisionSpecialProblemKey(state: DivisionSpecialState): string {
  if (state.rule === "divide-by-zero") {
    return `division:undefined:dividend=${state.dividend}:divisor=0:ask=quotient`;
  }
  return divisionEquationProblemKey(state, "quotient");
}

export function getDivisionSpecialAnswer(state: DivisionSpecialState): number | "undefined" {
  return state.rule === "divide-by-zero" ? "undefined" : state.quotient;
}

function uniqueCandidateNumbers(
  candidates: number[],
  correct: number,
  minimum: number,
): number[] {
  return [...new Set(candidates)].filter(
    (candidate) =>
      Number.isInteger(candidate) &&
      candidate >= minimum &&
      candidate <= 81 &&
      candidate !== correct,
  );
}

/** Plausible quotient errors without ever returning the correct quotient. */
export function getDivisionQuotientMisconceptionCandidates(state: DivisionFact): number[] {
  const { dividend, divisor, quotient } = state;
  return uniqueCandidateNumbers(
    [
      divisor,
      dividend,
      divisor + quotient,
      quotient - 1,
      quotient + 1,
      quotient - 2,
      quotient + 2,
      dividend - divisor,
      divisor - 1,
      divisor + 1,
    ],
    quotient,
    0,
  );
}

/**
 * Missing-number distractors are role-aware. A missing divisor must remain
 * positive, while a missing dividend or quotient may legitimately be zero.
 */
export function getDivisionMissingRoleMisconceptionCandidates(
  state: DivisionFact,
  role: DivisionUnknownRole,
): number[] {
  const correct = getDivisionAnswer(state, role);

  if (role === "quotient") {
    return getDivisionQuotientMisconceptionCandidates(state);
  }

  if (role === "dividend") {
    return uniqueCandidateNumbers(
      [
        state.divisor + state.quotient,
        state.divisor,
        state.quotient,
        state.dividend - state.divisor,
        state.dividend + state.divisor,
        state.dividend - 1,
        state.dividend + 1,
      ],
      correct,
      0,
    );
  }

  return uniqueCandidateNumbers(
    [
      state.quotient,
      state.dividend,
      state.divisor - 1,
      state.divisor + 1,
      state.divisor - 2,
      state.divisor + 2,
      state.divisor + state.quotient,
      state.dividend - state.quotient,
    ],
    correct,
    1,
  );
}
