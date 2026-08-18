import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import {
  MIXED_FACT_RANGE,
  createMixedFactState,
  enumerateMixedFactStates,
  generateMixedFact,
  getMixedFactMisconceptionCandidates,
  mixedFactProblemKey,
} from "./mixedFacts";
import { multiplicationFactKey } from "./core";

const STATES = enumerateMixedFactStates();

describe("mixed multiplication facts canonical core", () => {
  it("creates a sorted canonical state with the correct product", () => {
    const state = createMixedFactState(7, 3);

    expect(state.factorA).toBe(3);
    expect(state.factorB).toBe(7);
    expect(state.product).toBe(21);
    expect(state.fact).toEqual({ factorA: 3, factorB: 7, product: 21 });
    expect(mixedFactProblemKey(state)).toBe("multiplication:fact:a=3:b=7");
  });

  it("canonicalizes the factor order in the problem key", () => {
    const forward = createMixedFactState(3, 5);
    const reverse = createMixedFactState(5, 3);

    expect(mixedFactProblemKey(forward)).toBe(mixedFactProblemKey(reverse));
    expect(mixedFactProblemKey(forward)).toBe(multiplicationFactKey(forward.fact));
  });

  it("rejects factors outside the 0-9 mixed fact range", () => {
    expect(() => createMixedFactState(-1, 5)).toThrow(RangeError);
    expect(() => createMixedFactState(5, 10)).toThrow(RangeError);
    expect(() => createMixedFactState(2.5, 3)).toThrow(RangeError);
  });

  it("enumerates every unique unordered pair in 0-9", () => {
    expect(STATES).toHaveLength(55);

    const keys = new Set(STATES.map((state) => mixedFactProblemKey(state)));
    expect(keys.size).toBe(STATES.length);

    for (const state of STATES) {
      expect(state.factorA).toBeGreaterThanOrEqual(MIXED_FACT_RANGE.min);
      expect(state.factorA).toBeLessThanOrEqual(MIXED_FACT_RANGE.max);
      expect(state.factorB).toBeGreaterThanOrEqual(MIXED_FACT_RANGE.min);
      expect(state.factorB).toBeLessThanOrEqual(MIXED_FACT_RANGE.max);
      expect(state.factorA).toBeLessThanOrEqual(state.factorB);
      expect(state.factorA * state.factorB).toBe(state.product);
    }
  });

  it("generates facts inside the 0-9 range", () => {
    const rng = createSeededRng("range");

    for (let i = 0; i < 20; i += 1) {
      const state = generateMixedFact(rng);

      expect(state.factorA).toBeGreaterThanOrEqual(MIXED_FACT_RANGE.min);
      expect(state.factorA).toBeLessThanOrEqual(MIXED_FACT_RANGE.max);
      expect(state.factorB).toBeGreaterThanOrEqual(MIXED_FACT_RANGE.min);
      expect(state.factorB).toBeLessThanOrEqual(MIXED_FACT_RANGE.max);
      expect(state.factorA * state.factorB).toBe(state.product);
    }
  });

  it("is deterministic for one seed and varies across seeds", () => {
    const generateSequence = (seed: string) => {
      const rng = createSeededRng(seed);
      return Array.from({ length: 10 }, () => generateMixedFact(rng));
    };

    const first = generateSequence("same");
    const second = generateSequence("same");
    const other = generateSequence("other");

    expect(first).toEqual(second);
    expect(first).not.toEqual(other);
  });

  it("keeps seed and presentation identifiers out of the problem key", () => {
    const state = createMixedFactState(4, 6);

    expect(mixedFactProblemKey(state)).toBe("multiplication:fact:a=4:b=6");
    expect(mixedFactProblemKey(state)).not.toContain("seed");
    expect(mixedFactProblemKey(state)).not.toContain("mixed");
  });

  it("provides at least 3 unique distractors within 0-81, never the product", () => {
    for (const state of STATES) {
      const candidates = getMixedFactMisconceptionCandidates(state);

      expect(candidates.length).toBeGreaterThanOrEqual(3);
      expect(new Set(candidates).size).toBe(candidates.length);
      expect(candidates).not.toContain(state.product);

      for (const candidate of candidates) {
        expect(candidate).toBeGreaterThanOrEqual(0);
        expect(candidate).toBeLessThanOrEqual(81);
      }
    }
  });
});
