import { describe, expect, it } from "vitest";
import {
  createUnknownFactorState,
  enumerateUnknownFactorStates,
  getUnknownFactorAnswer,
  getUnknownFactorMisconceptionCandidates,
  unknownFactorProblemKey,
} from "./unknownFactors";

describe("unknown-factor canonical family", () => {
  it("uses known and missing factor roles for identity regardless of blank position", () => {
    const left = createUnknownFactorState(7, 6, "left");
    const right = createUnknownFactorState(6, 7, "right");
    const reversedRoles = createUnknownFactorState(6, 7, "left");

    expect(left.product).toBe(42);
    expect(getUnknownFactorAnswer(left)).toBe(7);
    expect(getUnknownFactorAnswer(right)).toBe(7);
    expect(unknownFactorProblemKey(left)).toBe(
      "multiplication:unknown:known=6:missing=7:product=42",
    );
    expect(unknownFactorProblemKey(left)).toBe(unknownFactorProblemKey(right));
    expect(unknownFactorProblemKey(left)).not.toContain("position");
    expect(unknownFactorProblemKey(left)).not.toBe(unknownFactorProblemKey(reversedRoles));
    expect(unknownFactorProblemKey(left)).not.toContain("guided");
    expect(unknownFactorProblemKey(left)).not.toContain("presentation");
  });

  it("enumerates all 64 canonical 2-through-9 role pairs", () => {
    const states = enumerateUnknownFactorStates();

    expect(states).toHaveLength(8 * 8);
    expect(new Set(states.map(unknownFactorProblemKey)).size).toBe(states.length);
    expect(new Set(states.map((state) => state.unknownPosition))).toEqual(new Set(["left"]));
    for (const state of states) {
      expect(state.knownFactor * state.missingFactor).toBe(state.product);
      expect(state.product).toBeLessThanOrEqual(81);
    }
  });

  it("returns unique factor-range misconception candidates without the answer", () => {
    const state = createUnknownFactorState(8, 6, "right");
    const candidates = getUnknownFactorMisconceptionCandidates(state);

    expect(candidates).toContain(8);
    expect(candidates).toContain(7);
    expect(candidates).toContain(9);
    expect(candidates).not.toContain(6);
    expect(new Set(candidates).size).toBe(candidates.length);
    expect(candidates.every((candidate) => candidate >= 2 && candidate <= 9)).toBe(true);
  });
});
