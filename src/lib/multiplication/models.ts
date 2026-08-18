import {
  createMultiplicationFact,
  type MultiplicationFact,
  type MultiplicationRange,
  type MultiplicationRng,
} from "./core";

export type OrderedRoles = {
  first: string;
  second: string;
};

export const DRAW_MULTIPLICATION_RANGE = {
  groups: { min: 2, max: 8 },
  itemsPerGroup: { min: 2, max: 6 },
} as const;

export const BUILD_ARRAYS_RANGE = {
  rows: { min: 2, max: 8 },
  columns: { min: 2, max: 6 },
} as const;

export const TWO_EQUATIONS_FOR_ARRAY_RANGE = {
  rows: { min: 2, max: 7 },
  columns: { min: 2, max: 6 },
} as const;

export const NUMBER_LINE_RANGE = {
  jumpCount: { min: 2, max: 8 },
  jumpSize: { min: 2, max: 6 },
} as const;

export const CONNECT_MODELS_RANGE = {
  factorA: { min: 2, max: 7 },
  factorB: { min: 2, max: 6 },
} as const;

export const CONNECT_REPRESENTATION_PAIRS: readonly {
  source: ConnectModelsState["sourceRepresentation"];
  target: ConnectModelsState["targetRepresentation"];
  firstRole: string;
  secondRole: string;
}[] = [
  { source: "equation", target: "story", firstRole: "groups", secondRole: "items" },
  { source: "story", target: "equation", firstRole: "groups", secondRole: "items" },
  { source: "number_line", target: "story", firstRole: "jumps", secondRole: "jump size" },
  { source: "array", target: "story", firstRole: "rows", secondRole: "columns" },
] as const;

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

// -------------------------------------------------------------------------
// Draw and describe multiplication situations
// -------------------------------------------------------------------------

export type DrawMultiplicationState = {
  groups: number;
  itemsPerGroup: number;
  product: number;
  fact: MultiplicationFact;
  equation: string;
  repeatedAddition: string;
};

export function createDrawMultiplicationState(
  groups: number,
  itemsPerGroup: number,
): DrawMultiplicationState {
  const fact = createMultiplicationFact(groups, itemsPerGroup);
  const repeatedAddition = Array.from({ length: groups }, () => String(itemsPerGroup)).join(" + ");
  return {
    groups,
    itemsPerGroup,
    product: fact.product,
    fact,
    equation: `${groups} × ${itemsPerGroup} = ${fact.product}`,
    repeatedAddition,
  };
}

export function generateDrawMultiplicationState(
  rng: MultiplicationRng,
  ranges: {
    groups?: MultiplicationRange;
    itemsPerGroup?: MultiplicationRange;
  } = {},
): DrawMultiplicationState {
  const groups = ranges.groups ?? DRAW_MULTIPLICATION_RANGE.groups;
  const itemsPerGroup = ranges.itemsPerGroup ?? DRAW_MULTIPLICATION_RANGE.itemsPerGroup;
  assertRange(groups, "groups range");
  assertRange(itemsPerGroup, "itemsPerGroup range");
  return createDrawMultiplicationState(
    rng.nextInt(groups.min, groups.max),
    rng.nextInt(itemsPerGroup.min, itemsPerGroup.max),
  );
}

export function drawMultiplicationProblemKey(state: DrawMultiplicationState): string {
  return `multiplication:model:equal-groups:g=${state.groups}:n=${state.itemsPerGroup}:task=construct`;
}

export function getDrawMultiplicationMisconceptionCandidates(
  state: DrawMultiplicationState,
): string[] {
  const { groups, itemsPerGroup, product, equation } = state;
  const pool: string[] = [
    `${groups} × ${itemsPerGroup} = ${product + 1}`,
    `${groups} + ${itemsPerGroup} = ${product}`,
    `${groups + 1} × ${itemsPerGroup} = ${(groups + 1) * itemsPerGroup}`,
    `${groups} × ${itemsPerGroup + 1} = ${groups * (itemsPerGroup + 1)}`,
  ];

  if (groups !== itemsPerGroup) {
    pool.push(`${itemsPerGroup} × ${groups} = ${product}`);
  }
  if (groups > 1) {
    pool.push(`${groups - 1} × ${itemsPerGroup} = ${(groups - 1) * itemsPerGroup}`);
  }
  if (itemsPerGroup > 1) {
    pool.push(`${groups} × ${itemsPerGroup - 1} = ${groups * (itemsPerGroup - 1)}`);
  }

  const seen = new Set<string>();
  return pool.filter((candidate) => {
    if (candidate === equation) return false;
    if (seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  });
}

// -------------------------------------------------------------------------
// Build arrays
// -------------------------------------------------------------------------

export type ArrayState = {
  rows: number;
  columns: number;
  product: number;
  fact: MultiplicationFact;
  equation: string;
};

export function createArrayState(rows: number, columns: number): ArrayState {
  const fact = createMultiplicationFact(rows, columns);
  return {
    rows,
    columns,
    product: fact.product,
    fact,
    equation: `${rows} × ${columns} = ${fact.product}`,
  };
}

export function generateArrayState(
  rng: MultiplicationRng,
  ranges: {
    rows?: MultiplicationRange;
    columns?: MultiplicationRange;
  } = {},
): ArrayState {
  const rows = ranges.rows ?? BUILD_ARRAYS_RANGE.rows;
  const columns = ranges.columns ?? BUILD_ARRAYS_RANGE.columns;
  assertRange(rows, "rows range");
  assertRange(columns, "columns range");
  return createArrayState(rng.nextInt(rows.min, rows.max), rng.nextInt(columns.min, columns.max));
}

export function arrayProblemKey(state: ArrayState): string {
  return `multiplication:model:array:r=${state.rows}:c=${state.columns}:task=build`;
}

export function getArrayMisconceptionCandidates(state: ArrayState): ArrayState[] {
  const { rows, columns, product } = state;
  const candidates: ArrayState[] = [
    createArrayState(rows + 1, columns),
    createArrayState(rows, columns + 1),
    createArrayState(rows, columns + 1),
    { ...createArrayState(rows, columns), product: product + 1 },
  ];

  if (rows !== columns) {
    candidates.push(createArrayState(columns, rows));
  }

  const correctKey = `${rows},${columns},${product}`;
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = `${candidate.rows},${candidate.columns},${candidate.product}`;
    if (key === correctKey || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// -------------------------------------------------------------------------
// Two equations for an array
// -------------------------------------------------------------------------

export type TwoEquationsForArrayState = {
  rows: number;
  columns: number;
  product: number;
  fact: MultiplicationFact;
  equations: [string, string];
  correctEquation: string;
};

export function createTwoEquationsForArrayState(
  rows: number,
  columns: number,
): TwoEquationsForArrayState {
  const fact = createMultiplicationFact(rows, columns);
  const first = `${rows} × ${columns} = ${fact.product}`;
  const second = `${columns} × ${rows} = ${fact.product}`;
  return {
    rows,
    columns,
    product: fact.product,
    fact,
    equations: [first, second],
    correctEquation: `${first} and ${second}`,
  };
}

export function generateTwoEquationsForArrayState(
  rng: MultiplicationRng,
  ranges: {
    rows?: MultiplicationRange;
    columns?: MultiplicationRange;
  } = {},
): TwoEquationsForArrayState {
  const rows = ranges.rows ?? TWO_EQUATIONS_FOR_ARRAY_RANGE.rows;
  const columns = ranges.columns ?? TWO_EQUATIONS_FOR_ARRAY_RANGE.columns;
  assertRange(rows, "rows range");
  assertRange(columns, "columns range");
  return createTwoEquationsForArrayState(
    rng.nextInt(rows.min, rows.max),
    rng.nextInt(columns.min, columns.max),
  );
}

export function twoEquationsForArrayProblemKey(state: TwoEquationsForArrayState): string {
  return `multiplication:property:commutative:a=${state.rows}:b=${state.columns}:representation=array:task=two-equations`;
}

export function getTwoEquationsForArrayDistractorCandidates(
  state: TwoEquationsForArrayState,
): string[] {
  const { rows, columns, product, correctEquation } = state;
  const pool: string[] = [
    `${rows} × ${columns} = ${product}`,
    `${rows} + ${columns} = ${product}`,
    `${rows} × ${columns} = ${product + 1} and ${columns} × ${rows} = ${product + 1}`,
  ];

  if (rows !== columns) {
    pool.push(`${columns} × ${rows} = ${product}`);
    pool.push(`${rows} × ${columns} = ${product} and ${columns} × ${rows} = ${product + 1}`);
  }

  const seen = new Set<string>();
  return pool.filter((candidate) => {
    if (candidate === correctEquation) return false;
    if (seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  });
}

// -------------------------------------------------------------------------
// Multiplication number line
// -------------------------------------------------------------------------

export type NumberLineState = {
  jumpCount: number;
  jumpSize: number;
  start: number;
  endpoint: number;
  product: number;
  fact: MultiplicationFact;
  equation: string;
};

export function createNumberLineState(jumpCount: number, jumpSize: number): NumberLineState {
  const fact = createMultiplicationFact(jumpCount, jumpSize);
  return {
    jumpCount,
    jumpSize,
    start: 0,
    endpoint: fact.product,
    product: fact.product,
    fact,
    equation: `${jumpCount} × ${jumpSize} = ${fact.product}`,
  };
}

export function generateNumberLineState(
  rng: MultiplicationRng,
  ranges: {
    jumpCount?: MultiplicationRange;
    jumpSize?: MultiplicationRange;
  } = {},
): NumberLineState {
  const jumpCount = ranges.jumpCount ?? NUMBER_LINE_RANGE.jumpCount;
  const jumpSize = ranges.jumpSize ?? NUMBER_LINE_RANGE.jumpSize;
  assertRange(jumpCount, "jumpCount range");
  assertRange(jumpSize, "jumpSize range");
  return createNumberLineState(
    rng.nextInt(jumpCount.min, jumpCount.max),
    rng.nextInt(jumpSize.min, jumpSize.max),
  );
}

export function numberLineProblemKey(state: NumberLineState): string {
  return `multiplication:model:number-line:j=${state.jumpCount}:s=${state.jumpSize}:start=0:task=represent`;
}

export function getNumberLineMisconceptionCandidates(state: NumberLineState): string[] {
  const { jumpCount, jumpSize, product, equation } = state;
  const pool: string[] = [
    `${jumpCount} × ${jumpSize} = ${product + 1}`,
    `${jumpCount} + ${jumpSize} = ${product}`,
    `${jumpCount} × ${jumpSize + 1} = ${jumpCount * (jumpSize + 1)}`,
    `${jumpCount + 1} × ${jumpSize} = ${(jumpCount + 1) * jumpSize}`,
  ];

  if (jumpCount !== jumpSize) {
    pool.push(`${jumpSize} × ${jumpCount} = ${product}`);
  }

  const seen = new Set<string>();
  return pool.filter((candidate) => {
    if (candidate === equation) return false;
    if (seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  });
}

// -------------------------------------------------------------------------
// Connect models, equations, and stories
// -------------------------------------------------------------------------

export type ConnectModelsState = {
  factorA: number;
  factorB: number;
  product: number;
  fact: MultiplicationFact;
  sourceRepresentation: "equation" | "array" | "number_line" | "story";
  targetRepresentation: "equation" | "array" | "number_line" | "story";
  orderedRoles: OrderedRoles;
  sourceEquation: string;
  sourceDescription: string;
  correctTarget: string;
};

function formatSourceDescription(
  factorA: number,
  factorB: number,
  product: number,
  representation: ConnectModelsState["sourceRepresentation"],
): string {
  switch (representation) {
    case "equation":
      return `${factorA} × ${factorB} = ${product}`;
    case "story":
      return `There are ${factorA} groups with ${factorB} items in each.`;
    case "number_line":
      return `${factorA} equal jumps of ${factorB} on a number line starting at 0`;
    case "array":
      return `an array with ${factorA} rows and ${factorB} columns`;
    default:
      throw new Error(`Unknown source representation: ${representation}`);
  }
}

function formatTargetString(
  factorA: number,
  factorB: number,
  product: number,
  representation: ConnectModelsState["targetRepresentation"],
): string {
  switch (representation) {
    case "equation":
      return `${factorA} × ${factorB} = ${product}`;
    case "story":
      return `There are ${factorA} groups with ${factorB} items in each.`;
    case "number_line":
      return `${factorA} equal jumps of ${factorB}, landing on ${product}`;
    case "array":
      return `an array with ${factorA} rows and ${factorB} columns`;
    default:
      throw new Error(`Unknown target representation: ${representation}`);
  }
}

export function createConnectModelsState(
  factorA: number,
  factorB: number,
  sourceRepresentation: ConnectModelsState["sourceRepresentation"],
  targetRepresentation: ConnectModelsState["targetRepresentation"],
  orderedRoles?: OrderedRoles,
): ConnectModelsState {
  const fact = createMultiplicationFact(factorA, factorB);
  const defaultRoles =
    sourceRepresentation === "number_line"
      ? { first: "jumps", second: "jump size" }
      : sourceRepresentation === "array"
        ? { first: "rows", second: "columns" }
        : { first: "groups", second: "items" };

  return {
    factorA,
    factorB,
    product: fact.product,
    fact,
    sourceRepresentation,
    targetRepresentation,
    orderedRoles: orderedRoles ?? defaultRoles,
    sourceEquation: `${factorA} × ${factorB} = ${fact.product}`,
    sourceDescription: formatSourceDescription(
      factorA,
      factorB,
      fact.product,
      sourceRepresentation,
    ),
    correctTarget: formatTargetString(factorA, factorB, fact.product, targetRepresentation),
  };
}

export function generateConnectModelsState(
  rng: MultiplicationRng,
  ranges: {
    factorA?: MultiplicationRange;
    factorB?: MultiplicationRange;
  } = {},
): ConnectModelsState {
  const factorA = ranges.factorA ?? CONNECT_MODELS_RANGE.factorA;
  const factorB = ranges.factorB ?? CONNECT_MODELS_RANGE.factorB;
  assertRange(factorA, "factorA range");
  assertRange(factorB, "factorB range");
  const pairIndex = rng.nextInt(0, CONNECT_REPRESENTATION_PAIRS.length - 1);
  const pair = CONNECT_REPRESENTATION_PAIRS[pairIndex];
  return createConnectModelsState(
    rng.nextInt(factorA.min, factorA.max),
    rng.nextInt(factorB.min, factorB.max),
    pair.source,
    pair.target,
    { first: pair.firstRole, second: pair.secondRole },
  );
}

export function connectModelsProblemKey(state: ConnectModelsState): string {
  return `multiplication:model-connection:a=${state.factorA}:b=${state.factorB}:from=${state.sourceRepresentation}:to=${state.targetRepresentation}`;
}

export function getConnectMisconceptionCandidates(state: ConnectModelsState): string[] {
  const { factorA, factorB, product, targetRepresentation, correctTarget } = state;
  const pool: string[] = [];

  switch (targetRepresentation) {
    case "story":
      if (factorA !== factorB) {
        pool.push(`There are ${factorB} groups with ${factorA} items in each.`);
      }
      pool.push(`There are ${factorA + 1} groups with ${factorB} items in each.`);
      pool.push(`There are ${factorA} groups with ${factorB + 1} items in each.`);
      pool.push(`There are ${factorA} groups with ${factorB - 1} items in each.`);
      break;
    case "equation":
      if (factorA !== factorB) {
        pool.push(`${factorB} × ${factorA} = ${product}`);
      }
      pool.push(`${factorA} × ${factorB} = ${product + 1}`);
      pool.push(`${factorA} + ${factorB} = ${product}`);
      pool.push(`${factorA + 1} × ${factorB} = ${(factorA + 1) * factorB}`);
      break;
    case "number_line":
      if (factorA !== factorB) {
        pool.push(`${factorB} equal jumps of ${factorA}, landing on ${product}`);
      }
      pool.push(`${factorA + 1} equal jumps of ${factorB}, landing on ${(factorA + 1) * factorB}`);
      pool.push(`${factorA} equal jumps of ${factorB + 1}, landing on ${factorA * (factorB + 1)}`);
      pool.push(`${factorA} equal jumps of ${factorB}, landing on ${factorA + factorB}`);
      break;
    case "array":
      if (factorA !== factorB) {
        pool.push(`an array with ${factorB} rows and ${factorA} columns`);
      }
      pool.push(`an array with ${factorA + 1} rows and ${factorB} columns`);
      pool.push(`an array with ${factorA} rows and ${factorB + 1} columns`);
      pool.push(
        `an array with ${factorA} rows and ${factorB} columns and ${factorA + factorB} dots`,
      );
      break;
  }

  const seen = new Set<string>();
  return pool.filter((candidate) => {
    if (candidate === correctTarget) return false;
    if (seen.has(candidate)) return false;
    seen.add(candidate);
    return true;
  });
}
