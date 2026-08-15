import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import {
  createScaledFactState,
  createTenPatternState,
  generateScaledFactState,
  generateTenPatternState,
  getScaledFactMisconceptionCandidates,
  getTenPatternMisconceptionCandidates,
  scaledFactProblemKey,
  tenPatternProblemKey,
} from "./multiplesOfTen";

describe("multiples-of-ten canonical core", () => {
  it("derives a scaled fact from the learner-visible basic fact", () => {
    const state = createScaledFactState(6, 3);
    expect(state).toEqual({
      oneDigit: 6,
      tensDigit: 3,
      basicProduct: 18,
      multipleOfTen: 30,
      scaledProduct: 180,
    });
    expect(scaledFactProblemKey(state, "connect")).toBe("multiplication:scaled-ten:a=6:d=3:task=connect");
    expect(scaledFactProblemKey(state, "product")).toBe("multiplication:scaled-ten:a=6:d=3:task=product");
    expect(scaledFactProblemKey(createScaledFactState(3, 6), "connect")).not.toBe(
      scaledFactProblemKey(state, "connect"),
    );
  });

  it("reconstructs every pattern term and its place-value difference", () => {
    const state = createTenPatternState(4, 2, 2);
    expect(state.tensDigits).toEqual([2, 3, 4, 5]);
    expect(state.products).toEqual([80, 120, 160, 200]);
    expect(state.constantDifference).toBe(40);
    expect(tenPatternProblemKey(state)).toBe(
      "multiplication:ten-pattern:a=4:start=2:length=4:missing=2:task=missing-term",
    );
    expect(tenPatternProblemKey(createTenPatternState(4, 2, 1))).not.toBe(tenPatternProblemKey(state));
    expect(tenPatternProblemKey(createTenPatternState(4, 3, 2))).not.toBe(tenPatternProblemKey(state));
  });

  it("is deterministic for a seed, varies across seeds, and supplies only wrong distractors", () => {
    const firstRng = createSeededRng("same");
    const secondRng = createSeededRng("same");
    const otherRng = createSeededRng("other");
    const first = Array.from({ length: 8 }, () => [generateScaledFactState(firstRng), generateTenPatternState(firstRng)]);
    const second = Array.from({ length: 8 }, () => [generateScaledFactState(secondRng), generateTenPatternState(secondRng)]);
    const other = Array.from({ length: 8 }, () => [generateScaledFactState(otherRng), generateTenPatternState(otherRng)]);
    expect(first).toEqual(second);
    expect(other).not.toEqual(first);

    const fact = createScaledFactState(7, 6);
    const pattern = createTenPatternState(7, 3, 2);
    expect(getScaledFactMisconceptionCandidates(fact)).not.toContain(fact.scaledProduct);
    expect(new Set(getScaledFactMisconceptionCandidates(fact)).size).toBe(getScaledFactMisconceptionCandidates(fact).length);
    expect(getTenPatternMisconceptionCandidates(pattern)).not.toContain(pattern.products[pattern.missingIndex]);
    expect(new Set(getTenPatternMisconceptionCandidates(pattern)).size).toBe(getTenPatternMisconceptionCandidates(pattern).length);
  });
});
