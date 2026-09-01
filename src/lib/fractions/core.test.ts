import { describe, expect, it } from "vitest";
import {
  areEquivalentFractions,
  compareFractions,
  comparisonSymbol,
  createFractionState,
  createProperFractionState,
  fractionPairProblemKey,
  fractionProblemKey,
  reduceFraction,
  scaleFraction,
} from "./core";

describe("fraction core", () => {
  it("uses exact cross-products for equivalence", () => {
    expect(
      areEquivalentFractions(createFractionState(1, 2), createFractionState(3, 6)),
    ).toBe(true);
    expect(
      areEquivalentFractions(createFractionState(2, 3), createFractionState(3, 4)),
    ).toBe(false);
  });

  it("reduces and scales without changing value", () => {
    const base = createProperFractionState(2, 3);
    const scaled = scaleFraction(base, 3);
    expect(scaled).toEqual({ numerator: 6, denominator: 9 });
    expect(reduceFraction(scaled)).toEqual(base);
  });

  it("compares like and unlike denominators exactly", () => {
    expect(compareFractions(createFractionState(3, 8), createFractionState(5, 8))).toBe(-1);
    expect(compareFractions(createFractionState(3, 4), createFractionState(3, 7))).toBe(1);
    expect(comparisonSymbol(createFractionState(2, 4), createFractionState(1, 2))).toBe("=");
  });

  it("keeps mathematical task identity separate from presentation", () => {
    const state = createProperFractionState(3, 5);
    expect(fractionProblemKey("fraction_bars", state, "name-shaded")).toBe(
      fractionProblemKey("fraction_bars", state, "name-shaded"),
    );
    expect(fractionProblemKey("fraction_bars", state, "name-shaded")).not.toBe(
      fractionProblemKey("fraction_bars", state, "name-unit"),
    );
  });

  it("preserves comparison direction in pair identity", () => {
    const a = createProperFractionState(2, 5);
    const b = createProperFractionState(3, 5);
    expect(fractionPairProblemKey("compare", a, b, "larger")).not.toBe(
      fractionPairProblemKey("compare", b, a, "larger"),
    );
  });

  it("rejects invalid proper fractions", () => {
    expect(() => createProperFractionState(0, 4)).toThrow(RangeError);
    expect(() => createProperFractionState(4, 4)).toThrow(RangeError);
    expect(() => createFractionState(1, 0)).toThrow(RangeError);
  });
});
