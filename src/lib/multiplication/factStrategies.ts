import {
  createMultiplicationFact,
  type MultiplicationFact,
  type MultiplicationRng,
} from "./core";

export const STRATEGY_IDS = [
  "double-plus-one",
  "double-twice",
  "five-plus-one",
  "five-plus-two",
  "double-three-times",
  "ten-minus-one",
] as const;

export type StrategyId = (typeof STRATEGY_IDS)[number];
export type StrategyEquationOperator = "×" | "+" | "-";

/** An equation shown to the learner as part of a multiplication strategy. */
export type StrategyEquation = {
  left: number;
  operator: StrategyEquationOperator;
  right: number;
  result: number;
};

export type StrategyState = {
  fact: MultiplicationFact;
  strategyId: StrategyId;
  intermediateEquations: readonly StrategyEquation[];
  product: number;
  operation: "multiplication";
};

type StrategyConfig = {
  fixedFactor: number;
  description: string;
};

const STRATEGY_CONFIGS: Record<StrategyId, StrategyConfig> = {
  "double-plus-one": { fixedFactor: 3, description: "Double and add one group" },
  "double-twice": { fixedFactor: 4, description: "Double twice" },
  "five-plus-one": { fixedFactor: 6, description: "Use five groups and one more" },
  "five-plus-two": { fixedFactor: 7, description: "Use five groups and two more" },
  "double-three-times": { fixedFactor: 8, description: "Double three times" },
  "ten-minus-one": { fixedFactor: 9, description: "Use ten groups minus one" },
};

const OTHER_FACTOR_RANGE = { min: 2, max: 9 } as const;

function assertOtherFactor(otherFactor: number): void {
  if (
    !Number.isInteger(otherFactor) ||
    otherFactor < OTHER_FACTOR_RANGE.min ||
    otherFactor > OTHER_FACTOR_RANGE.max
  ) {
    throw new RangeError(
      `otherFactor must be an integer from ${OTHER_FACTOR_RANGE.min} through ${OTHER_FACTOR_RANGE.max}`,
    );
  }
}

function strategyEquations(strategyId: StrategyId, otherFactor: number): StrategyEquation[] {
  switch (strategyId) {
    case "double-plus-one":
      return [
        { left: 2, operator: "×", right: otherFactor, result: 2 * otherFactor },
        { left: 2 * otherFactor, operator: "+", right: otherFactor, result: 3 * otherFactor },
        { left: 3, operator: "×", right: otherFactor, result: 3 * otherFactor },
      ];
    case "double-twice":
      return [
        { left: 2, operator: "×", right: otherFactor, result: 2 * otherFactor },
        { left: 2, operator: "×", right: 2 * otherFactor, result: 4 * otherFactor },
        { left: 4, operator: "×", right: otherFactor, result: 4 * otherFactor },
      ];
    case "five-plus-one":
      return [
        { left: 5, operator: "×", right: otherFactor, result: 5 * otherFactor },
        { left: 5 * otherFactor, operator: "+", right: otherFactor, result: 6 * otherFactor },
        { left: 6, operator: "×", right: otherFactor, result: 6 * otherFactor },
      ];
    case "five-plus-two":
      return [
        { left: 5, operator: "×", right: otherFactor, result: 5 * otherFactor },
        { left: 2, operator: "×", right: otherFactor, result: 2 * otherFactor },
        { left: 5 * otherFactor, operator: "+", right: 2 * otherFactor, result: 7 * otherFactor },
        { left: 7, operator: "×", right: otherFactor, result: 7 * otherFactor },
      ];
    case "double-three-times":
      return [
        { left: 2, operator: "×", right: otherFactor, result: 2 * otherFactor },
        { left: 2, operator: "×", right: 2 * otherFactor, result: 4 * otherFactor },
        { left: 2, operator: "×", right: 4 * otherFactor, result: 8 * otherFactor },
        { left: 8, operator: "×", right: otherFactor, result: 8 * otherFactor },
      ];
    case "ten-minus-one":
      return [
        { left: 10, operator: "×", right: otherFactor, result: 10 * otherFactor },
        { left: 10 * otherFactor, operator: "-", right: otherFactor, result: 9 * otherFactor },
        { left: 9, operator: "×", right: otherFactor, result: 9 * otherFactor },
      ];
  }
}

export function strategyDescription(strategyId: StrategyId): string {
  return STRATEGY_CONFIGS[strategyId].description;
}

export function createStrategyState(strategyId: StrategyId, otherFactor: number): StrategyState {
  assertOtherFactor(otherFactor);
  const fixedFactor = STRATEGY_CONFIGS[strategyId].fixedFactor;
  const fact = createMultiplicationFact(fixedFactor, otherFactor);
  return {
    fact,
    strategyId,
    intermediateEquations: strategyEquations(strategyId, otherFactor),
    product: fact.product,
    operation: "multiplication",
  };
}

/** Every state has a learner-visible fixed-factor strategy and a 2–9 fact. */
export function enumerateStrategyStates(): StrategyState[] {
  return STRATEGY_IDS.flatMap((strategyId) => {
    const states: StrategyState[] = [];
    for (let otherFactor = OTHER_FACTOR_RANGE.min; otherFactor <= OTHER_FACTOR_RANGE.max; otherFactor += 1) {
      states.push(createStrategyState(strategyId, otherFactor));
    }
    return states;
  });
}

/** The displayed decomposition is part of the task, while the product is derived. */
export function strategyProblemKey(state: StrategyState): string {
  return `multiplication:strategy:a=${state.fact.factorA}:b=${state.fact.factorB}:strategy=${state.strategyId}:task=validate-and-solve`;
}

export function formatStrategyEquations(equations: readonly StrategyEquation[]): string {
  return equations
    .map((equation) => `${equation.left} ${equation.operator} ${equation.right} = ${equation.result}`)
    .join("; ");
}

function formatStrategyChoice(strategyId: StrategyId, equations: readonly StrategyEquation[]): string {
  return `${strategyDescription(strategyId)}: ${formatStrategyEquations(equations)}`;
}

function replaceEquationResult(
  equations: readonly StrategyEquation[],
  index: number,
): StrategyEquation[] {
  return equations.map((equation, equationIndex) =>
    equationIndex === index ? { ...equation, result: equation.result + 1 } : equation,
  );
}

export type StrategyChoiceSet = {
  choices: string[];
  correctAnswer: string;
};

/**
 * Builds one valid, learner-visible strategy and three distinct misconception
 * choices: a valid strategy for another fact, an arithmetic error within the
 * strategy, and a correct method with an incorrect final result.
 */
export function buildStrategyChoiceSet(
  state: StrategyState,
  rng: MultiplicationRng & { shuffle<T>(items: readonly T[]): T[] },
): StrategyChoiceSet {
  const correctAnswer = formatStrategyChoice(state.strategyId, state.intermediateEquations);
  const otherStrategyIds = STRATEGY_IDS.filter((strategyId) => strategyId !== state.strategyId);
  const otherStrategyId = otherStrategyIds[rng.nextInt(0, otherStrategyIds.length - 1)];
  const otherFact = createStrategyState(otherStrategyId, state.fact.factorB);
  const incorrectIntermediateIndex = rng.nextInt(0, state.intermediateEquations.length - 2);
  const incorrectIntermediate = replaceEquationResult(
    state.intermediateEquations,
    incorrectIntermediateIndex,
  );
  const incorrectResult = replaceEquationResult(
    state.intermediateEquations,
    state.intermediateEquations.length - 1,
  );

  return {
    correctAnswer,
    choices: rng.shuffle([
      correctAnswer,
      formatStrategyChoice(otherFact.strategyId, otherFact.intermediateEquations),
      formatStrategyChoice(state.strategyId, incorrectIntermediate),
      formatStrategyChoice(state.strategyId, incorrectResult),
    ]),
  };
}
