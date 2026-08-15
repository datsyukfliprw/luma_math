import { describe, expect, it } from "vitest";
import {
  FIXED_FACTOR_FACT_RANGES,
  createFixedFactorFactState,
  fixedFactorForPracticeType,
  getFixedFactorFactMisconceptionCandidates,
  fixedFactorFactProblemKey,
  type FixedFactorFactPracticeType,
} from "./factFluency";

const PRACTICE_TYPES: FixedFactorFactPracticeType[] = [
  "multiply_by_3",
  "multiply_by_4",
  "multiply_by_6",
  "multiply_by_7",
  "multiply_by_8",
  "multiply_by_9",
];

describe("fixed-factor multiplication fact fluency core", () => {
  it.each(PRACTICE_TYPES)("uses the configured factor and the 2–9 range for %s", (practiceType) => {
    const fixedFactor = fixedFactorForPracticeType(practiceType);
    const range = FIXED_FACTOR_FACT_RANGES[practiceType];

    expect(range).toEqual({ min: 2, max: 9 });
    for (let otherFactor = range.min; otherFactor <= range.max; otherFactor += 1) {
      const state = createFixedFactorFactState(fixedFactor, otherFactor);
      expect(state.fixedFactor).toBe(fixedFactor);
      expect(state.otherFactor).toBe(otherFactor);
      expect(state.product).toBe(fixedFactor * otherFactor);
      expect(state.fact).toEqual({
        factorA: fixedFactor,
        factorB: otherFactor,
        product: fixedFactor * otherFactor,
      });
    }
  });

  it("canonicalizes factor order without including presentation or lesson identity", () => {
    const forward = createFixedFactorFactState(3, 7);
    const reverse = createFixedFactorFactState(7, 3);

    expect(fixedFactorFactProblemKey(forward)).toBe("multiplication:fact:a=3:b=7");
    expect(fixedFactorFactProblemKey(reverse)).toBe(fixedFactorFactProblemKey(forward));
    expect(fixedFactorFactProblemKey(forward)).not.toContain("multiply_by_3");
    expect(fixedFactorFactProblemKey(forward)).not.toContain("guided");
  });

  it("provides multiplication-specific wrong-answer candidates", () => {
    const state = createFixedFactorFactState(7, 4);
    const candidates = getFixedFactorFactMisconceptionCandidates(state);

    expect(new Set(candidates).size).toBe(candidates.length);
    expect(candidates).not.toContain(state.product);
    expect(candidates).toContain(7 + 4);
    expect(candidates).toContain(7 * 3);
    expect(candidates).toContain(7 * 5);
  });
});
