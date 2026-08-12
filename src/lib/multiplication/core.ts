export type MultiplicationRng = {
  nextInt(min: number, max: number): number;
};

export type MultiplicationRange = { min: number; max: number };

export type MultiplicationFact = {
  factorA: number;
  factorB: number;
  product: number;
};

export type EqualGroupsState = {
  groups: number;
  itemsPerGroup: number;
  product: number;
  fact: MultiplicationFact;
};

export type FactorProductTerms = {
  factorA: number;
  factorB: number;
  product: number;
};

export const EQUAL_GROUPS_RANGE = {
  groups: { min: 2, max: 7 },
  itemsPerGroup: { min: 2, max: 6 },
} as const;

export const FACTOR_RANGE = { min: 2, max: 9 } as const;

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

function assertRange(range: MultiplicationRange, name: string): void {
  assertNonNegativeInteger(range.min, `${name}.min`);
  assertNonNegativeInteger(range.max, `${name}.max`);
  if (range.min > range.max) throw new RangeError(`${name}.min must be <= ${name}.max`);
}

export function createMultiplicationFact(factorA: number, factorB: number): MultiplicationFact {
  assertNonNegativeInteger(factorA, "factorA");
  assertNonNegativeInteger(factorB, "factorB");
  return { factorA, factorB, product: factorA * factorB };
}

export function createEqualGroupsState(groups: number, itemsPerGroup: number): EqualGroupsState {
  const fact = createMultiplicationFact(groups, itemsPerGroup);
  return { groups, itemsPerGroup, product: fact.product, fact };
}

export function generateMultiplicationFact(
  rng: MultiplicationRng,
  range: MultiplicationRange = FACTOR_RANGE,
): MultiplicationFact {
  assertRange(range, "factor range");
  return createMultiplicationFact(rng.nextInt(range.min, range.max), rng.nextInt(range.min, range.max));
}

export function generateEqualGroupsState(
  rng: MultiplicationRng,
  ranges: {
    groups?: MultiplicationRange;
    itemsPerGroup?: MultiplicationRange;
  } = {},
): EqualGroupsState {
  const groups = ranges.groups ?? EQUAL_GROUPS_RANGE.groups;
  const itemsPerGroup = ranges.itemsPerGroup ?? EQUAL_GROUPS_RANGE.itemsPerGroup;
  assertRange(groups, "groups range");
  assertRange(itemsPerGroup, "itemsPerGroup range");
  return createEqualGroupsState(
    rng.nextInt(groups.min, groups.max),
    rng.nextInt(itemsPerGroup.min, itemsPerGroup.max),
  );
}

/** A pure multiplication fact is commutative when no model role is assessed. */
export function multiplicationFactKey(fact: MultiplicationFact): string {
  const [a, b] = [fact.factorA, fact.factorB].sort((left, right) => left - right);
  return `multiplication:fact:a=${a}:b=${b}`;
}

/** Equal-groups keys preserve group count and items-per-group directionality. */
export function equalGroupsProblemKey(
  state: EqualGroupsState,
  task: string,
): string {
  return `multiplication:model:equal-groups:g=${state.groups}:n=${state.itemsPerGroup}:task=${task}`;
}

/** Terms keys canonicalize factor order because multiplication is commutative here. */
export function factorTermsProblemKey(
  fact: MultiplicationFact,
  requestedTerms: string,
): string {
  const [factorA, factorB] = [fact.factorA, fact.factorB].sort((left, right) => left - right);
  return `multiplication:terms:a=${factorA}:b=${factorB}:ask=${requestedTerms}`;
}

export function getEqualGroupsMisconceptionCandidates(state: EqualGroupsState): number[] {
  const candidates = [
    state.groups + state.itemsPerGroup,
    (state.groups + 1) * state.itemsPerGroup,
    state.groups * Math.max(0, state.itemsPerGroup - 1),
    state.groups,
    state.itemsPerGroup,
    state.product + 1,
    Math.max(0, state.product - 1),
  ];
  return [...new Set(candidates)].filter((candidate) => candidate !== state.product);
}

export function getFactorProductMisconceptionCandidates(
  fact: MultiplicationFact,
): FactorProductTerms[] {
  const candidates: FactorProductTerms[] = [
    { factorA: fact.factorA, factorB: fact.factorB, product: fact.factorA + fact.factorB },
    { factorA: fact.product, factorB: fact.factorB, product: fact.product },
    { factorA: fact.factorA, factorB: fact.product, product: fact.product },
    { factorA: fact.factorA + 1, factorB: fact.factorB, product: fact.product },
    { factorA: fact.factorA, factorB: fact.factorB + 1, product: fact.product },
    { factorA: fact.factorA, factorB: fact.factorB, product: fact.product + 1 },
    { factorA: fact.factorA + 1, factorB: fact.factorB + 1, product: fact.product },
  ];
  const correct = `${Math.min(fact.factorA, fact.factorB)},${Math.max(fact.factorA, fact.factorB)},${fact.product}`;
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = `${Math.min(candidate.factorA, candidate.factorB)},${Math.max(candidate.factorA, candidate.factorB)},${candidate.product}`;
    if (key === correct || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
