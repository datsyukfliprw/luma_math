import { describe, expect, it } from "vitest";
import {
  EQUAL_GROUPS_RANGE,
  FACTOR_RANGE,
  createEqualGroupsState,
  createMultiplicationFact,
  equalGroupsProblemKey,
  factorTermsProblemKey,
  generateEqualGroupsState,
  generateMultiplicationFact,
  getEqualGroupsMisconceptionCandidates,
  getFactorProductMisconceptionCandidates,
  multiplicationFactKey,
} from "./core";
import { createSeededRng } from "../../practiceTypes/random";

describe("multiplication canonical core", () => {
  it("represents equal groups as a directional factor relationship", () => {
    const state = createEqualGroupsState(4, 3);

    expect(state.groups).toBe(4);
    expect(state.itemsPerGroup).toBe(3);
    expect(state.product).toBe(12);
    expect(state.fact).toEqual({ factorA: 4, factorB: 3, product: 12 });
    expect(equalGroupsProblemKey(state, "count-total")).toBe(
      "multiplication:model:equal-groups:g=4:n=3:task=count-total",
    );
    expect(equalGroupsProblemKey(createEqualGroupsState(3, 4), "count-total")).not.toBe(
      equalGroupsProblemKey(state, "count-total"),
    );
    expect(equalGroupsProblemKey(state, "repeated-addition")).not.toBe(
      equalGroupsProblemKey(state, "count-total"),
    );
    expect(equalGroupsProblemKey(state, "zero-identity-check")).not.toBe(
      equalGroupsProblemKey(state, "count-total"),
    );
  });

  it("uses commutative keys for factor and product identification", () => {
    const fact = createMultiplicationFact(3, 4);
    const reversed = createMultiplicationFact(4, 3);

    expect(fact.product).toBe(12);
    expect(factorTermsProblemKey(fact, "both")).toBe(
      "multiplication:terms:a=3:b=4:ask=both",
    );
    expect(factorTermsProblemKey(reversed, "both")).toBe(
      factorTermsProblemKey(fact, "both"),
    );
    expect(multiplicationFactKey(fact)).toBe(multiplicationFactKey(reversed));
  });

  it("generates facts inside the configured curriculum ranges", () => {
    const state = generateEqualGroupsState(createSeededRng("range"));
    const fact = generateMultiplicationFact(createSeededRng("fact-range"));

    expect(state.groups).toBeGreaterThanOrEqual(EQUAL_GROUPS_RANGE.groups.min);
    expect(state.groups).toBeLessThanOrEqual(EQUAL_GROUPS_RANGE.groups.max);
    expect(state.itemsPerGroup).toBeGreaterThanOrEqual(EQUAL_GROUPS_RANGE.itemsPerGroup.min);
    expect(state.itemsPerGroup).toBeLessThanOrEqual(EQUAL_GROUPS_RANGE.itemsPerGroup.max);
    expect(fact.factorA).toBeGreaterThanOrEqual(FACTOR_RANGE.min);
    expect(fact.factorA).toBeLessThanOrEqual(FACTOR_RANGE.max);
    expect(fact.factorB).toBeGreaterThanOrEqual(FACTOR_RANGE.min);
    expect(fact.factorB).toBeLessThanOrEqual(FACTOR_RANGE.max);
  });

  it("is deterministic for one seed and varies across seeds", () => {
    const generateSequence = (seed: string) => {
      const rng = createSeededRng(seed);
      return Array.from({ length: 8 }, () => generateEqualGroupsState(rng));
    };
    const first = generateSequence("same");
    const second = generateSequence("same");
    const other = generateSequence("other");

    expect(first).toEqual(second);
    expect(first).not.toEqual(other);
  });

  it("provides domain misconception candidates without making them canonical state", () => {
    const state = createEqualGroupsState(4, 3);
    const fact = createMultiplicationFact(4, 3);

    expect(getEqualGroupsMisconceptionCandidates(state)).toContain(7);
    expect(getEqualGroupsMisconceptionCandidates(state)).toContain(15);
    expect(getFactorProductMisconceptionCandidates(fact)).toEqual(
      expect.arrayContaining([
        { factorA: 4, factorB: 3, product: 7 },
      ]),
    );
    expect(getFactorProductMisconceptionCandidates(fact)).not.toContainEqual(
      { factorA: 3, factorB: 4, product: 12 },
    );
  });
});
