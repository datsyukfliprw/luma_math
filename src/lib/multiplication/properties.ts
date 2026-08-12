import { FACTOR_RANGE, type MultiplicationRange } from "./core";

/**
 * Canonical mathematics for the Grade 3 multiplication-properties family.
 *
 * Two genuinely different canonical shapes live here:
 *
 * - `CommutativeState` owns an unordered factor pair plus the reversed
 *   presentation, because the assessed idea is that factor ORDER does not change
 *   the product.
 * - `AssociativeState` owns three ORDERED factors, both intermediates and the
 *   three-factor product, because the assessed idea is that GROUPING changes
 *   while order does not.
 *
 * Neither state is derived from the other: associativity is not commutativity,
 * so the three factors are never sorted.
 */

export type CommutativeTask = "equivalent-equation" | "turnaround-product";

export type CommutativeState = {
  /** First factor as presented to the learner. */
  factorA: number;
  /** Second factor as presented to the learner. */
  factorB: number;
  product: number;
  /** First factor of the turn-around equation. */
  reversedA: number;
  /** Second factor of the turn-around equation. */
  reversedB: number;
  isSquare: boolean;
};

export type AssociativeGrouping = "left" | "right";

export type AssociativeTask = "regroup-equivalent" | "equal-product";

export type AssociativeState = {
  factorA: number;
  factorB: number;
  factorC: number;
  /** Value of the left grouping's inner pair, `a × b`. */
  leftIntermediate: number;
  /** Value of the right grouping's inner pair, `b × c`. */
  rightIntermediate: number;
  /** The three-factor product, identical under either grouping. */
  product: number;
};

export type PropertyExpression = {
  expression: string;
  /**
   * For a bare expression this is the value it evaluates to; for a full equation
   * it is the result the equation states, which may be arithmetically false.
   */
  value: number;
  kind: string;
};

/**
 * Commutative factors follow the shared core's Grade 3 fact domain (2–9).
 * `g3-u12-w1-l3` demonstrates 4 × 6, 7 × 4, 3 × 9, 8 × 4, 6 × 3 and 5 × 4.
 */
export const COMMUTATIVE_FACTOR_RANGE: MultiplicationRange = FACTOR_RANGE;

/**
 * Associative factors are deliberately narrower than the two-factor fact domain.
 * `g3-u12-w1-l4` demonstrates 2 × 3 × 5, 4 × 2 × 4, 2 × 5 × 3, 2 × 4 × 5 and
 * 5 × 2 × 6 — every authored factor is 2–6 and no authored product exceeds 60.
 */
export const ASSOCIATIVE_FACTOR_RANGE: MultiplicationRange = { min: 2, max: 6 };

/** Largest three-factor product demonstrated by the associative lesson (5 × 2 × 6). */
export const ASSOCIATIVE_MAX_PRODUCT = 60;

const TIMES = "×";

function assertFactor(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

export function createCommutativeState(factorA: number, factorB: number): CommutativeState {
  assertFactor(factorA, "factorA");
  assertFactor(factorB, "factorB");
  return {
    factorA,
    factorB,
    product: factorA * factorB,
    reversedA: factorB,
    reversedB: factorA,
    isSquare: factorA === factorB,
  };
}

/** Present the same commutative fact with the factors written the other way round. */
export function reverseCommutativePresentation(state: CommutativeState): CommutativeState {
  return createCommutativeState(state.factorB, state.factorA);
}

export function createAssociativeState(
  factorA: number,
  factorB: number,
  factorC: number,
): AssociativeState {
  assertFactor(factorA, "factorA");
  assertFactor(factorB, "factorB");
  assertFactor(factorC, "factorC");
  return {
    factorA,
    factorB,
    factorC,
    leftIntermediate: factorA * factorB,
    rightIntermediate: factorB * factorC,
    product: factorA * factorB * factorC,
  };
}

/**
 * Commutative keys canonicalize the factor pair.
 *
 * `7 × 4` and `4 × 7` are the SAME commutative fact under discussion; only the
 * written order differs, and written order is exactly what the property says is
 * immaterial. Sorting therefore also stops a session from asking the learner to
 * turn around 7 × 4 and then to turn around 4 × 7.
 */
export function commutativePropertyKey(state: CommutativeState, task: CommutativeTask): string {
  const [a, b] = [state.factorA, state.factorB].sort((left, right) => left - right);
  return `multiplication:property:commutative:a=${a}:b=${b}:representation=equation:task=${task}`;
}

/**
 * Associative keys preserve all three factors in their presented ORDER.
 *
 * The factors are never sorted: `(2 × 3) × 4` and `(3 × 2) × 4` are different
 * ordered expressions and only the first belongs to the equivalence
 * `(2 × 3) × 4 = 2 × (3 × 4)`. Which side of that single equivalence is shown
 * first is presentation, not new mathematics, so the grouping direction is not
 * part of the key — a session must not ask about both directions of the same
 * triple.
 */
export function associativePropertyKey(state: AssociativeState, task: AssociativeTask): string {
  return `multiplication:property:associative:a=${state.factorA}:b=${state.factorB}:c=${state.factorC}:task=${task}`;
}

/** Every non-square factor pair in the domain, written smallest factor first. */
export function listCommutativePairs(
  range: MultiplicationRange = COMMUTATIVE_FACTOR_RANGE,
): CommutativeState[] {
  const states: CommutativeState[] = [];
  for (let factorA = range.min; factorA <= range.max; factorA += 1) {
    // Square facts are excluded on purpose: `a × a` reversed is textually
    // identical, so neither the equivalent-equation nor the turn-around task has
    // a distinguishable response. `createCommutativeState` still models them.
    for (let factorB = factorA + 1; factorB <= range.max; factorB += 1) {
      states.push(createCommutativeState(factorA, factorB));
    }
  }
  return states;
}

/** Every ordered factor triple in the associative domain, capped by product. */
export function listAssociativeTriples(
  range: MultiplicationRange = ASSOCIATIVE_FACTOR_RANGE,
  maxProduct: number = ASSOCIATIVE_MAX_PRODUCT,
): AssociativeState[] {
  const states: AssociativeState[] = [];
  for (let factorA = range.min; factorA <= range.max; factorA += 1) {
    for (let factorB = range.min; factorB <= range.max; factorB += 1) {
      for (let factorC = range.min; factorC <= range.max; factorC += 1) {
        const state = createAssociativeState(factorA, factorB, factorC);
        if (state.product <= maxProduct) states.push(state);
      }
    }
  }
  return states;
}

export function formatCommutativeEquation(state: CommutativeState): string {
  return `${state.factorA} ${TIMES} ${state.factorB} = ${state.product}`;
}

export function formatTurnaroundEquation(state: CommutativeState): string {
  return `${state.reversedA} ${TIMES} ${state.reversedB} = ${state.product}`;
}

export function formatGrouping(state: AssociativeState, grouping: AssociativeGrouping): string {
  return grouping === "left"
    ? `(${state.factorA} ${TIMES} ${state.factorB}) ${TIMES} ${state.factorC}`
    : `${state.factorA} ${TIMES} (${state.factorB} ${TIMES} ${state.factorC})`;
}

/** The worked line for one grouping, e.g. `(2 × 3) × 4 = 6 × 4 = 24`. */
export function formatGroupingSolution(
  state: AssociativeState,
  grouping: AssociativeGrouping,
): string {
  const middle =
    grouping === "left"
      ? `${state.leftIntermediate} ${TIMES} ${state.factorC}`
      : `${state.factorA} ${TIMES} ${state.rightIntermediate}`;
  return `${formatGrouping(state, grouping)} = ${middle} = ${state.product}`;
}

export function otherGrouping(grouping: AssociativeGrouping): AssociativeGrouping {
  return grouping === "left" ? "right" : "left";
}

function dedupeExpressions(candidates: PropertyExpression[]): PropertyExpression[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.expression)) return false;
    seen.add(candidate.expression);
    return true;
  });
}

/**
 * Wrong equations for "which equation shows the commutative property?".
 *
 * Every candidate is wrong for a domain reason: the product changed, a factor
 * changed while reversing, or multiplication became addition. No candidate uses
 * the same factor pair with the correct product, so none of them is a second
 * valid demonstration of the property.
 */
export function getCommutativeEquationMisconceptionCandidates(
  state: CommutativeState,
): PropertyExpression[] {
  const { factorA: a, factorB: b, product } = state;
  const candidates: PropertyExpression[] = [
    { expression: `${b} ${TIMES} ${a} = ${product - a}`, value: product - a, kind: "changed-product" },
    {
      expression: `${b} ${TIMES} ${a + 1} = ${b * (a + 1)}`,
      value: b * (a + 1),
      kind: "changed-factor",
    },
    { expression: `${b} + ${a} = ${a + b}`, value: a + b, kind: "addition-instead-of-multiplication" },
    {
      expression: `${b + 1} ${TIMES} ${a} = ${(b + 1) * a}`,
      value: (b + 1) * a,
      kind: "changed-other-factor",
    },
  ];
  const correct = formatTurnaroundEquation(state);
  return dedupeExpressions(candidates).filter((candidate) => candidate.expression !== correct);
}

/** Wrong products for "you know a × b = p, so what is b × a?". */
export function getCommutativeProductMisconceptionCandidates(state: CommutativeState): number[] {
  const { factorA: a, factorB: b, product } = state;
  const candidates = [product - a, product + b, a + b, product - b, product + a];
  return [...new Set(candidates)].filter(
    (candidate) => candidate !== product && candidate > 0,
  );
}

/**
 * Wrong expressions for "which expression regroups the same three factors?".
 *
 * A pure reordering such as `(b × a) × c` is deliberately NOT offered: it is
 * mathematically equal to the product, so it would be a second correct answer
 * to any question phrased around equal value. Every candidate here evaluates to
 * something other than the three-factor product, and the caller filters on that
 * value anyway.
 */
export function getAssociativeRegroupingMisconceptionCandidates(
  state: AssociativeState,
  target: AssociativeGrouping,
): PropertyExpression[] {
  const { factorA: a, factorB: b, factorC: c, product } = state;
  const candidates: PropertyExpression[] =
    target === "right"
      ? [
          {
            expression: `${a} ${TIMES} (${b} ${TIMES} ${c + 1})`,
            value: a * b * (c + 1),
            kind: "changed-factor",
          },
          { expression: `${a} ${TIMES} (${b} + ${c})`, value: a * (b + c), kind: "changed-operation" },
          { expression: `${a} ${TIMES} ${b}`, value: a * b, kind: "dropped-factor" },
          {
            expression: `(${a} ${TIMES} ${b}) ${TIMES} (${b} ${TIMES} ${c})`,
            value: a * b * b * c,
            kind: "repeated-factor",
          },
        ]
      : [
          {
            expression: `(${a + 1} ${TIMES} ${b}) ${TIMES} ${c}`,
            value: (a + 1) * b * c,
            kind: "changed-factor",
          },
          { expression: `(${a} + ${b}) ${TIMES} ${c}`, value: (a + b) * c, kind: "changed-operation" },
          { expression: `${b} ${TIMES} ${c}`, value: b * c, kind: "dropped-factor" },
          {
            expression: `(${a} ${TIMES} ${b}) ${TIMES} (${b} ${TIMES} ${c})`,
            value: a * b * b * c,
            kind: "repeated-factor",
          },
        ];
  return dedupeExpressions(candidates).filter((candidate) => candidate.value !== product);
}

/** Wrong products for "the regrouped expression equals what?". */
export function getAssociativeProductMisconceptionCandidates(state: AssociativeState): number[] {
  const { factorA: a, factorB: b, factorC: c, product, leftIntermediate, rightIntermediate } = state;
  const candidates = [
    leftIntermediate,
    rightIntermediate,
    a + b + c,
    leftIntermediate + c,
    product + b,
  ];
  return [...new Set(candidates)].filter((candidate) => candidate !== product && candidate > 0);
}
