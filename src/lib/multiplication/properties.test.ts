import { describe, expect, it } from "vitest";
import {
  ASSOCIATIVE_FACTOR_RANGE,
  ASSOCIATIVE_MAX_PRODUCT,
  associativePropertyKey,
  commutativePropertyKey,
  createAssociativeState,
  createCommutativeState,
  formatCommutativeEquation,
  formatGrouping,
  formatGroupingSolution,
  formatTurnaroundEquation,
  getAssociativeProductMisconceptionCandidates,
  getAssociativeRegroupingMisconceptionCandidates,
  getCommutativeEquationMisconceptionCandidates,
  getCommutativeProductMisconceptionCandidates,
  listAssociativeTriples,
  listCommutativePairs,
  reverseCommutativePresentation,
} from "./properties";

/** Independent recursive-descent evaluator for the learner-visible expressions. */
function evaluateExpression(text: string): number {
  const tokens = text.match(/\d+|[×+()]/g) ?? [];
  let pos = 0;

  function parsePrimary(): number {
    const token = tokens[pos];
    if (token === "(") {
      pos += 1;
      const value = parseSum();
      if (tokens[pos] !== ")") throw new Error(`expected ) in "${text}"`);
      pos += 1;
      return value;
    }
    if (!token || !/^\d+$/.test(token)) throw new Error(`unexpected token "${token}" in "${text}"`);
    pos += 1;
    return Number(token);
  }

  function parseProduct(): number {
    let value = parsePrimary();
    while (tokens[pos] === "×") {
      pos += 1;
      value *= parsePrimary();
    }
    return value;
  }

  function parseSum(): number {
    let value = parseProduct();
    while (tokens[pos] === "+") {
      pos += 1;
      value += parseProduct();
    }
    return value;
  }

  const result = parseSum();
  if (pos !== tokens.length) throw new Error(`trailing tokens in "${text}"`);
  return result;
}

function parseEquation(text: string): { left: number; right: number; factors: number[] } {
  const [leftText, rightText] = text.split("=");
  expect(rightText).toBeDefined();
  return {
    left: evaluateExpression(leftText),
    right: evaluateExpression(rightText),
    factors: (leftText.match(/\d+/g) ?? []).map(Number),
  };
}

describe("commutative canonical state", () => {
  it("derives the product and the reversed presentation", () => {
    const state = createCommutativeState(7, 4);
    expect(state.product).toBe(28);
    expect(state.reversedA).toBe(4);
    expect(state.reversedB).toBe(7);
    expect(state.isSquare).toBe(false);
    expect(evaluateExpression("7 × 4")).toBe(evaluateExpression("4 × 7"));
  });

  it("keeps square facts valid state while excluding them from generated pairs", () => {
    const square = createCommutativeState(6, 6);
    expect(square.product).toBe(36);
    expect(square.isSquare).toBe(true);
    expect(formatTurnaroundEquation(square)).toBe(formatCommutativeEquation(square));

    // The turn-around of a square is textually identical, so it has no
    // distinguishable learner response and is deliberately never generated.
    expect(listCommutativePairs().every((pair) => pair.factorA !== pair.factorB)).toBe(true);
  });

  it("treats a reversed presentation as the same canonical commutative fact", () => {
    const state = createCommutativeState(7, 4);
    const reversed = reverseCommutativePresentation(state);
    expect(reversed.factorA).toBe(4);
    expect(reversed.factorB).toBe(7);
    expect(commutativePropertyKey(reversed, "equivalent-equation")).toBe(
      commutativePropertyKey(state, "equivalent-equation"),
    );
  });

  it("builds keys from learner-visible mathematics and the task only", () => {
    const state = createCommutativeState(4, 7);
    expect(commutativePropertyKey(state, "equivalent-equation")).toBe(
      "multiplication:property:commutative:a=4:b=7:representation=equation:task=equivalent-equation",
    );
    expect(commutativePropertyKey(state, "turnaround-product")).not.toBe(
      commutativePropertyKey(state, "equivalent-equation"),
    );
  });

  it("lists only in-domain non-square pairs", () => {
    const pairs = listCommutativePairs();
    expect(pairs.length).toBeGreaterThan(20);
    for (const pair of pairs) {
      expect(pair.factorA).toBeGreaterThanOrEqual(2);
      expect(pair.factorB).toBeLessThanOrEqual(9);
      expect(pair.factorA).toBeLessThan(pair.factorB);
      expect(pair.product).toBe(pair.factorA * pair.factorB);
    }
  });
});

describe("commutative misconception candidates", () => {
  it("never offers a second valid demonstration of the property", () => {
    for (const pair of listCommutativePairs()) {
      for (const state of [pair, reverseCommutativePresentation(pair)]) {
        const candidates = getCommutativeEquationMisconceptionCandidates(state);
        expect(candidates.length).toBeGreaterThanOrEqual(3);
        const seen = new Set<string>();
        for (const candidate of candidates) {
          expect(seen.has(candidate.expression)).toBe(false);
          seen.add(candidate.expression);
          const parsed = parseEquation(candidate.expression);
          // For equations, `value` is the result the wrong equation states.
          expect(parsed.right).toBe(candidate.value);
          const sameFactors =
            [...parsed.factors].sort((l, r) => l - r).join(",") ===
            [state.factorA, state.factorB].sort((l, r) => l - r).join(",");
          // Either the factor pair differs, or the stated product is wrong.
          expect(sameFactors && parsed.right === state.product).toBe(false);
        }
      }
    }
  });

  it("offers wrong products that are positive and never the real product", () => {
    for (const pair of listCommutativePairs()) {
      const candidates = getCommutativeProductMisconceptionCandidates(pair);
      expect(candidates.length).toBeGreaterThanOrEqual(3);
      expect(new Set(candidates).size).toBe(candidates.length);
      for (const candidate of candidates) {
        expect(candidate).toBeGreaterThan(0);
        expect(candidate).not.toBe(pair.product);
      }
    }
  });
});

describe("associative canonical state", () => {
  it("keeps three ordered factors, both intermediates and one product", () => {
    const state = createAssociativeState(2, 3, 4);
    expect(state.leftIntermediate).toBe(6);
    expect(state.rightIntermediate).toBe(12);
    expect(state.product).toBe(24);
    expect(evaluateExpression(formatGrouping(state, "left"))).toBe(24);
    expect(evaluateExpression(formatGrouping(state, "right"))).toBe(24);
  });

  it("does not sort factors, so a reordered triple is different mathematics", () => {
    const ordered = createAssociativeState(2, 3, 4);
    const reordered = createAssociativeState(3, 2, 4);
    expect(associativePropertyKey(ordered, "regroup-equivalent")).toBe(
      "multiplication:property:associative:a=2:b=3:c=4:task=regroup-equivalent",
    );
    expect(associativePropertyKey(reordered, "regroup-equivalent")).not.toBe(
      associativePropertyKey(ordered, "regroup-equivalent"),
    );
    expect(associativePropertyKey(ordered, "equal-product")).not.toBe(
      associativePropertyKey(ordered, "regroup-equivalent"),
    );
  });

  it("writes worked grouping lines that evaluate consistently", () => {
    const state = createAssociativeState(5, 2, 6);
    expect(formatGroupingSolution(state, "left")).toBe("(5 × 2) × 6 = 10 × 6 = 60");
    expect(formatGroupingSolution(state, "right")).toBe("5 × (2 × 6) = 5 × 12 = 60");
    for (const grouping of ["left", "right"] as const) {
      const parts = formatGroupingSolution(state, grouping).split("=");
      const values = parts.map((part) => evaluateExpression(part));
      expect(new Set(values).size).toBe(1);
    }
  });

  it("stays inside the Grade 3 domain demonstrated by the lesson", () => {
    const triples = listAssociativeTriples();
    expect(triples.length).toBeGreaterThan(30);
    for (const triple of triples) {
      for (const factor of [triple.factorA, triple.factorB, triple.factorC]) {
        expect(factor).toBeGreaterThanOrEqual(ASSOCIATIVE_FACTOR_RANGE.min);
        expect(factor).toBeLessThanOrEqual(ASSOCIATIVE_FACTOR_RANGE.max);
      }
      expect(triple.product).toBeLessThanOrEqual(ASSOCIATIVE_MAX_PRODUCT);
    }
    const keys = new Set(triples.map((triple) => `${triple.factorA},${triple.factorB},${triple.factorC}`));
    // Curriculum-authored examples for g3-u12-w1-l4.
    expect(keys.has("2,3,5")).toBe(true);
    expect(keys.has("4,2,4")).toBe(true);
    expect(keys.has("2,4,5")).toBe(true);
    expect(keys.has("5,2,6")).toBe(true);
  });
});

describe("associative misconception candidates", () => {
  it("never offers an expression that is also equal to the product", () => {
    for (const triple of listAssociativeTriples()) {
      for (const target of ["left", "right"] as const) {
        const candidates = getAssociativeRegroupingMisconceptionCandidates(triple, target);
        expect(candidates.length).toBeGreaterThanOrEqual(3);
        const correct = formatGrouping(triple, target);
        const seen = new Set<string>();
        for (const candidate of candidates) {
          expect(candidate.expression).not.toBe(correct);
          expect(seen.has(candidate.expression)).toBe(false);
          seen.add(candidate.expression);
          expect(evaluateExpression(candidate.expression)).toBe(candidate.value);
          expect(evaluateExpression(candidate.expression)).not.toBe(triple.product);
        }
      }
    }
  });

  it("offers wrong products including both stop-at-intermediate values", () => {
    for (const triple of listAssociativeTriples()) {
      const candidates = getAssociativeProductMisconceptionCandidates(triple);
      expect(candidates.length).toBeGreaterThanOrEqual(3);
      expect(new Set(candidates).size).toBe(candidates.length);
      for (const candidate of candidates) expect(candidate).not.toBe(triple.product);
      expect(candidates).toContain(triple.leftIntermediate);
      expect(candidates).toContain(triple.rightIntermediate);
    }
  });
});
