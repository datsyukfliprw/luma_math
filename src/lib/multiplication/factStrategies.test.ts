import { describe, expect, it } from "vitest";
import {
  createStrategyState,
  enumerateStrategyStates,
  strategyProblemKey,
  type StrategyEquation,
  type StrategyId,
} from "./factStrategies";

const FIXED_FACTORS: Record<StrategyId, number> = {
  "double-plus-one": 3,
  "double-twice": 4,
  "five-plus-one": 6,
  "five-plus-two": 7,
  "double-three-times": 8,
  "ten-minus-one": 9,
};

function evaluate(equation: StrategyEquation): number {
  switch (equation.operator) {
    case "×":
      return equation.left * equation.right;
    case "+":
      return equation.left + equation.right;
    case "-":
      return equation.left - equation.right;
  }
}

describe("multiplication strategy canonical family", () => {
  it("enumerates visible 2–9 facts with exact strategy equations", () => {
    const states = enumerateStrategyStates();

    expect(states).toHaveLength(6 * 8);
    expect(new Set(states.map(strategyProblemKey)).size).toBe(states.length);
    for (const state of states) {
      expect(state.operation).toBe("multiplication");
      expect(state.fact.factorA).toBe(FIXED_FACTORS[state.strategyId]);
      expect(state.fact.factorB).toBeGreaterThanOrEqual(2);
      expect(state.fact.factorB).toBeLessThanOrEqual(9);
      expect(state.product).toBe(state.fact.factorA * state.fact.factorB);
      expect(state.fact.product).toBe(state.product);
      expect(state.intermediateEquations).toHaveLength(
        state.strategyId === "five-plus-two" || state.strategyId === "double-three-times" ? 4 : 3,
      );
      for (const equation of state.intermediateEquations) {
        expect(evaluate(equation)).toBe(equation.result);
      }
      expect(state.intermediateEquations.at(-1)).toEqual({
        left: state.fact.factorA,
        operator: "×",
        right: state.fact.factorB,
        result: state.product,
      });
    }
  });

  it("uses the visible fact and decomposition, rather than replay or presentation state, in the key", () => {
    const doubleThreeTimes = createStrategyState("double-three-times", 7);
    const tenMinusOne = createStrategyState("ten-minus-one", 7);

    expect(strategyProblemKey(doubleThreeTimes)).toBe(
      "multiplication:strategy:a=8:b=7:strategy=double-three-times:task=validate-and-solve",
    );
    expect(strategyProblemKey(doubleThreeTimes)).not.toContain("guided");
    expect(strategyProblemKey(doubleThreeTimes)).not.toContain("seed");
    expect(strategyProblemKey(doubleThreeTimes)).not.toBe(strategyProblemKey(tenMinusOne));
  });
});
