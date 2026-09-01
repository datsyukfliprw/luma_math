import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import {
  DIVISION_FACT_RANGE,
  createDivideByOneState,
  createDivideByZeroState,
  createDivisionFact,
  createDivisionFactFromEquation,
  createZeroDividendState,
  divisionArrayProblemKey,
  divisionEquationProblemKey,
  divisionFactFamilyProblemKey,
  divisionFactProblemKey,
  divisionModelProblemKey,
  divisionSpecialProblemKey,
  enumerateDivisionFacts,
  enumerateFixedDivisorFacts,
  generateDivisionFact,
  generateFixedDivisorFact,
  getDivisionAnswer,
  getDivisionMissingRoleMisconceptionCandidates,
  getDivisionQuotientMisconceptionCandidates,
  getDivisionSpecialAnswer,
} from "./core";

describe("division canonical core", () => {
  it("represents exact whole-number division with directional roles", () => {
    const state = createDivisionFact(6, 8);

    expect(state).toEqual({ dividend: 48, divisor: 6, quotient: 8 });
    expect(createDivisionFactFromEquation(48, 6)).toEqual(state);
    expect(getDivisionAnswer(state, "dividend")).toBe(48);
    expect(getDivisionAnswer(state, "divisor")).toBe(6);
    expect(getDivisionAnswer(state, "quotient")).toBe(8);
    expect(() => createDivisionFactFromEquation(49, 6)).toThrow(RangeError);
    expect(() => createDivisionFact(0, 8)).toThrow(RangeError);
  });

  it("enumerates the 64 canonical 2-through-9 exact division facts", () => {
    const states = enumerateDivisionFacts();

    expect(states).toHaveLength(8 * 8);
    expect(new Set(states.map(divisionFactProblemKey)).size).toBe(states.length);
    for (const state of states) {
      expect(state.divisor).toBeGreaterThanOrEqual(DIVISION_FACT_RANGE.divisor.min);
      expect(state.divisor).toBeLessThanOrEqual(DIVISION_FACT_RANGE.divisor.max);
      expect(state.quotient).toBeGreaterThanOrEqual(DIVISION_FACT_RANGE.quotient.min);
      expect(state.quotient).toBeLessThanOrEqual(DIVISION_FACT_RANGE.quotient.max);
      expect(state.divisor * state.quotient).toBe(state.dividend);
      expect(state.dividend % state.divisor).toBe(0);
    }
  });

  it("keeps divisor and quotient directionality in ordinary division identity", () => {
    const sixGroupsOfEight = createDivisionFact(6, 8);
    const eightGroupsOfSix = createDivisionFact(8, 6);

    expect(divisionFactProblemKey(sixGroupsOfEight)).toBe(
      "division:fact:dividend=48:divisor=6:quotient=8",
    );
    expect(divisionFactProblemKey(sixGroupsOfEight)).not.toBe(
      divisionFactProblemKey(eightGroupsOfSix),
    );
  });

  it("distinguishes missing mathematical roles and learner-visible models", () => {
    const state = createDivisionFact(6, 8);

    expect(divisionEquationProblemKey(state, "dividend")).not.toBe(
      divisionEquationProblemKey(state, "divisor"),
    );
    expect(divisionEquationProblemKey(state, "divisor")).not.toBe(
      divisionEquationProblemKey(state, "quotient"),
    );
    expect(divisionModelProblemKey(state, "sharing")).not.toBe(
      divisionModelProblemKey(state, "counting-groups"),
    );
    expect(divisionModelProblemKey(state, "array")).not.toBe(
      divisionModelProblemKey(state, "number-line"),
    );
    expect(divisionModelProblemKey(state, "sharing", "equation")).not.toBe(
      divisionModelProblemKey(state, "sharing", "quotient"),
    );
    expect(divisionArrayProblemKey(state, "rows")).not.toBe(
      divisionArrayProblemKey(state, "columns"),
    );
  });

  it("canonicalizes a multiplication/division fact family across factor order", () => {
    const first = createDivisionFact(6, 8);
    const reversed = createDivisionFact(8, 6);

    expect(divisionFactFamilyProblemKey(first)).toBe(
      "division:fact-family:a=6:b=8:product=48",
    );
    expect(divisionFactFamilyProblemKey(first)).toBe(divisionFactFamilyProblemKey(reversed));
    expect(divisionFactProblemKey(first)).not.toBe(divisionFactProblemKey(reversed));
  });

  it("models divide-by-one, zero dividend, and divide-by-zero without treating zero as a divisor", () => {
    const divideByOne = createDivideByOneState(8);
    const zeroDividend = createZeroDividendState(7);
    const divideByZero = createDivideByZeroState(8);

    expect(divideByOne).toEqual({ rule: "divide-by-one", dividend: 8, divisor: 1, quotient: 8 });
    expect(zeroDividend).toEqual({ rule: "zero-dividend", dividend: 0, divisor: 7, quotient: 0 });
    expect(divideByZero).toEqual({ rule: "divide-by-zero", dividend: 8, divisor: 0, quotient: null });
    expect(getDivisionSpecialAnswer(divideByOne)).toBe(8);
    expect(getDivisionSpecialAnswer(zeroDividend)).toBe(0);
    expect(getDivisionSpecialAnswer(divideByZero)).toBe("undefined");
    expect(divisionSpecialProblemKey(divideByZero)).toBe(
      "division:undefined:dividend=8:divisor=0:ask=quotient",
    );
    expect(divisionSpecialProblemKey(divideByOne)).toBe(
      divisionEquationProblemKey(createDivisionFact(1, 8), "quotient"),
    );
    expect(divisionSpecialProblemKey(createDivideByOneState(0))).toBe(
      divisionSpecialProblemKey(createZeroDividendState(1)),
    );
    expect(() => createZeroDividendState(0)).toThrow(RangeError);
  });

  it("supports fixed-divisor fluency for 6, 7, 8, and 9", () => {
    for (const divisor of [6, 7, 8, 9] as const) {
      const states = enumerateFixedDivisorFacts(divisor);
      expect(states).toHaveLength(8);
      expect(states.every((state) => state.divisor === divisor)).toBe(true);
      expect(states.map((state) => state.quotient)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    }
  });

  it("is deterministic for one seed and varies across seeds", () => {
    const sequence = (seed: string) => {
      const rng = createSeededRng(seed);
      return Array.from({ length: 8 }, () => generateDivisionFact(rng));
    };

    expect(sequence("same")).toEqual(sequence("same"));
    expect(sequence("same")).not.toEqual(sequence("other"));

    const fixedFirst = generateFixedDivisorFact(createSeededRng("fixed"), 7);
    const fixedSecond = generateFixedDivisorFact(createSeededRng("fixed"), 7);
    expect(fixedFirst).toEqual(fixedSecond);
    expect(fixedFirst.divisor).toBe(7);
  });

  it("provides unique, role-valid misconception candidates without the correct answer", () => {
    const state = createDivisionFact(6, 8);
    const quotientCandidates = getDivisionQuotientMisconceptionCandidates(state);
    const dividendCandidates = getDivisionMissingRoleMisconceptionCandidates(state, "dividend");
    const divisorCandidates = getDivisionMissingRoleMisconceptionCandidates(state, "divisor");

    expect(quotientCandidates).toEqual(expect.arrayContaining([6, 7, 9]));
    expect(quotientCandidates).not.toContain(8);
    expect(dividendCandidates).toContain(14);
    expect(dividendCandidates).not.toContain(48);
    expect(divisorCandidates).toContain(8);
    expect(divisorCandidates).not.toContain(6);
    expect(divisorCandidates.every((candidate) => candidate > 0)).toBe(true);

    for (const candidates of [quotientCandidates, dividendCandidates, divisorCandidates]) {
      expect(new Set(candidates).size).toBe(candidates.length);
    }
  });

  it("still supplies distractors for zero-quotient and divide-by-one facts", () => {
    const zeroQuotient = createDivisionFact(7, 0);
    const divideByOne = createDivisionFact(1, 8);

    const zeroCandidates = getDivisionQuotientMisconceptionCandidates(zeroQuotient);
    const oneCandidates = getDivisionQuotientMisconceptionCandidates(divideByOne);

    expect(zeroCandidates.length).toBeGreaterThanOrEqual(3);
    expect(zeroCandidates).not.toContain(0);
    expect(oneCandidates.length).toBeGreaterThanOrEqual(3);
    expect(oneCandidates).not.toContain(8);
  });
});
