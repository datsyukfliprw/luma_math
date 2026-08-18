import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import * as M from "./models";

function parseEquation(equation: string): { a: number; b: number; product: number } {
  const match = equation.match(/^(\d+) × (\d+) = (\d+)$/);
  if (!match) throw new Error(`Could not parse equation: ${equation}`);
  return { a: Number(match[1]), b: Number(match[2]), product: Number(match[3]) };
}

function parseStory(story: string): { groups: number; items: number } {
  const match = story.match(/There are (\d+) groups with (\d+) items in each\./);
  if (!match) throw new Error(`Could not parse story: ${story}`);
  return { groups: Number(match[1]), items: Number(match[2]) };
}

function evaluateEquationPair(pair: string): { a: number; b: number; product: number }[] {
  const matches = pair.match(/(\d+) × (\d+) = (\d+)/g);
  if (!matches) throw new Error(`Could not parse equation pair: ${pair}`);
  return matches.map(parseEquation);
}

describe("multiplication models canonical core", () => {
  it("builds draw state with ordered group roles and construct key", () => {
    const state = M.createDrawMultiplicationState(4, 3);

    expect(state.groups).toBe(4);
    expect(state.itemsPerGroup).toBe(3);
    expect(state.product).toBe(12);
    expect(state.equation).toBe("4 × 3 = 12");
    expect(state.repeatedAddition).toBe("3 + 3 + 3 + 3");
    expect(M.drawMultiplicationProblemKey(state)).toBe(
      "multiplication:model:equal-groups:g=4:n=3:task=construct",
    );
    expect(M.drawMultiplicationProblemKey(M.createDrawMultiplicationState(3, 4))).not.toBe(
      M.drawMultiplicationProblemKey(state),
    );
  });

  it("reconstructs the draw model as groups times items per group", () => {
    const state = M.createDrawMultiplicationState(5, 2);
    const { a, b, product } = parseEquation(state.equation);

    expect(a).toBe(state.groups);
    expect(b).toBe(state.itemsPerGroup);
    expect(a * b).toBe(product);
    expect(product).toBe(state.product);
  });

  it("builds array state with rows, columns, and build key", () => {
    const state = M.createArrayState(3, 4);

    expect(state.rows).toBe(3);
    expect(state.columns).toBe(4);
    expect(state.product).toBe(12);
    expect(state.equation).toBe("3 × 4 = 12");
    expect(M.arrayProblemKey(state)).toBe("multiplication:model:array:r=3:c=4:task=build");
    expect(M.arrayProblemKey(M.createArrayState(4, 3))).not.toBe(M.arrayProblemKey(state));
  });

  it("reconstructs an array as rows times columns", () => {
    const state = M.createArrayState(5, 3);
    expect(state.rows * state.columns).toBe(state.product);
    expect(state.product).toBe(15);
  });

  it("builds two-equations state with both commutative equations", () => {
    const state = M.createTwoEquationsForArrayState(3, 4);

    expect(state.equations).toEqual(["3 × 4 = 12", "4 × 3 = 12"]);
    expect(state.correctEquation).toBe("3 × 4 = 12 and 4 × 3 = 12");
    expect(M.twoEquationsForArrayProblemKey(state)).toBe(
      "multiplication:property:commutative:a=3:b=4:representation=array:task=two-equations",
    );

    const evaluated = evaluateEquationPair(state.correctEquation);
    expect(evaluated).toHaveLength(2);
    expect(evaluated[0].product).toBe(state.product);
    expect(evaluated[1].product).toBe(state.product);
    expect(evaluated[0].a).toBe(state.rows);
    expect(evaluated[0].b).toBe(state.columns);
    expect(evaluated[1].a).toBe(state.columns);
    expect(evaluated[1].b).toBe(state.rows);
  });

  it("builds number-line state with start 0 and endpoint equal to jumps times size", () => {
    const state = M.createNumberLineState(4, 3);

    expect(state.start).toBe(0);
    expect(state.endpoint).toBe(12);
    expect(state.product).toBe(12);
    expect(state.equation).toBe("4 × 3 = 12");
    expect(M.numberLineProblemKey(state)).toBe(
      "multiplication:model:number-line:j=4:s=3:start=0:task=represent",
    );

    const { a, b, product } = parseEquation(state.equation);
    expect(a).toBe(state.jumpCount);
    expect(b).toBe(state.jumpSize);
    expect(a * b).toBe(product);
    expect(product).toBe(state.endpoint);
  });

  it("builds connect state with shared ordered factors and product", () => {
    const state = M.createConnectModelsState(3, 4, "equation", "story");

    expect(state.factorA).toBe(3);
    expect(state.factorB).toBe(4);
    expect(state.product).toBe(12);
    expect(state.sourceEquation).toBe("3 × 4 = 12");
    expect(state.correctTarget).toBe("There are 3 groups with 4 items in each.");
    expect(state.orderedRoles).toEqual({ first: "groups", second: "items" });
    expect(M.connectModelsProblemKey(state)).toBe(
      "multiplication:model-connection:a=3:b=4:from=equation:to=story",
    );

    const source = parseEquation(state.sourceEquation);
    const target = parseStory(state.correctTarget);

    expect(source.a).toBe(target.groups);
    expect(source.b).toBe(target.items);
    expect(source.product).toBe(state.product);
    expect(target.groups).toBe(state.factorA);
    expect(target.items).toBe(state.factorB);
  });

  it("generates values inside the configured curriculum ranges", () => {
    const draw = M.generateDrawMultiplicationState(createSeededRng("draw-range"));
    const array = M.generateArrayState(createSeededRng("array-range"));
    const two = M.generateTwoEquationsForArrayState(createSeededRng("two-range"));
    const line = M.generateNumberLineState(createSeededRng("line-range"));
    const connect = M.generateConnectModelsState(createSeededRng("connect-range"));

    expect(draw.groups).toBeGreaterThanOrEqual(M.DRAW_MULTIPLICATION_RANGE.groups.min);
    expect(draw.groups).toBeLessThanOrEqual(M.DRAW_MULTIPLICATION_RANGE.groups.max);
    expect(draw.itemsPerGroup).toBeGreaterThanOrEqual(M.DRAW_MULTIPLICATION_RANGE.itemsPerGroup.min);
    expect(draw.itemsPerGroup).toBeLessThanOrEqual(M.DRAW_MULTIPLICATION_RANGE.itemsPerGroup.max);

    expect(array.rows).toBeGreaterThanOrEqual(M.BUILD_ARRAYS_RANGE.rows.min);
    expect(array.rows).toBeLessThanOrEqual(M.BUILD_ARRAYS_RANGE.rows.max);
    expect(array.columns).toBeGreaterThanOrEqual(M.BUILD_ARRAYS_RANGE.columns.min);
    expect(array.columns).toBeLessThanOrEqual(M.BUILD_ARRAYS_RANGE.columns.max);

    expect(two.rows).toBeGreaterThanOrEqual(M.TWO_EQUATIONS_FOR_ARRAY_RANGE.rows.min);
    expect(two.rows).toBeLessThanOrEqual(M.TWO_EQUATIONS_FOR_ARRAY_RANGE.rows.max);
    expect(two.columns).toBeGreaterThanOrEqual(M.TWO_EQUATIONS_FOR_ARRAY_RANGE.columns.min);
    expect(two.columns).toBeLessThanOrEqual(M.TWO_EQUATIONS_FOR_ARRAY_RANGE.columns.max);

    expect(line.jumpCount).toBeGreaterThanOrEqual(M.NUMBER_LINE_RANGE.jumpCount.min);
    expect(line.jumpCount).toBeLessThanOrEqual(M.NUMBER_LINE_RANGE.jumpCount.max);
    expect(line.jumpSize).toBeGreaterThanOrEqual(M.NUMBER_LINE_RANGE.jumpSize.min);
    expect(line.jumpSize).toBeLessThanOrEqual(M.NUMBER_LINE_RANGE.jumpSize.max);
    expect(line.start).toBe(0);
    expect(line.endpoint).toBe(line.jumpCount * line.jumpSize);

    expect(connect.factorA).toBeGreaterThanOrEqual(M.CONNECT_MODELS_RANGE.factorA.min);
    expect(connect.factorA).toBeLessThanOrEqual(M.CONNECT_MODELS_RANGE.factorA.max);
    expect(connect.factorB).toBeGreaterThanOrEqual(M.CONNECT_MODELS_RANGE.factorB.min);
    expect(connect.factorB).toBeLessThanOrEqual(M.CONNECT_MODELS_RANGE.factorB.max);
  });

  it("is deterministic for one seed and varies across seeds", () => {
    const generateDraw = (seed: string) => M.generateDrawMultiplicationState(createSeededRng(seed));

    expect(generateDraw("same")).toEqual(generateDraw("same"));
    expect(generateDraw("one")).not.toEqual(generateDraw("two"));
  });

  it("produces unique canonical keys for the full draw state space", () => {
    const keys = new Set<string>();
    for (
      let groups = M.DRAW_MULTIPLICATION_RANGE.groups.min;
      groups <= M.DRAW_MULTIPLICATION_RANGE.groups.max;
      groups += 1
    ) {
      for (
        let itemsPerGroup = M.DRAW_MULTIPLICATION_RANGE.itemsPerGroup.min;
        itemsPerGroup <= M.DRAW_MULTIPLICATION_RANGE.itemsPerGroup.max;
        itemsPerGroup += 1
      ) {
        const state = M.createDrawMultiplicationState(groups, itemsPerGroup);
        keys.add(M.drawMultiplicationProblemKey(state));
      }
    }

    const expected =
      (M.DRAW_MULTIPLICATION_RANGE.groups.max - M.DRAW_MULTIPLICATION_RANGE.groups.min + 1) *
      (M.DRAW_MULTIPLICATION_RANGE.itemsPerGroup.max - M.DRAW_MULTIPLICATION_RANGE.itemsPerGroup.min + 1);
    expect(keys.size).toBe(expected);
  });

  it("produces unique canonical keys for the full connect state space", () => {
    const keys = new Set<string>();
    for (
      let factorA = M.CONNECT_MODELS_RANGE.factorA.min;
      factorA <= M.CONNECT_MODELS_RANGE.factorA.max;
      factorA += 1
    ) {
      for (
        let factorB = M.CONNECT_MODELS_RANGE.factorB.min;
        factorB <= M.CONNECT_MODELS_RANGE.factorB.max;
        factorB += 1
      ) {
        for (const pair of M.CONNECT_REPRESENTATION_PAIRS) {
          const state = M.createConnectModelsState(factorA, factorB, pair.source, pair.target, {
            first: pair.firstRole,
            second: pair.secondRole,
          });
          keys.add(M.connectModelsProblemKey(state));
        }
      }
    }

    const expectedFactorPairs =
      (M.CONNECT_MODELS_RANGE.factorA.max - M.CONNECT_MODELS_RANGE.factorA.min + 1) *
      (M.CONNECT_MODELS_RANGE.factorB.max - M.CONNECT_MODELS_RANGE.factorB.min + 1);
    expect(keys.size).toBe(expectedFactorPairs * M.CONNECT_REPRESENTATION_PAIRS.length);
  });

  it("provides at least three unique draw distractors that are not the correct equation", () => {
    const state = M.createDrawMultiplicationState(4, 3);
    const candidates = M.getDrawMultiplicationMisconceptionCandidates(state);

    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(new Set(candidates).size).toBe(candidates.length);
    expect(candidates).not.toContain(state.equation);
    for (const candidate of candidates) {
      expect(candidate).not.toBe(state.equation);
    }
  });

  it("provides array distractors that are not the correct array state", () => {
    const state = M.createArrayState(3, 4);
    const candidates = M.getArrayMisconceptionCandidates(state);

    expect(candidates.length).toBeGreaterThanOrEqual(3);
    const correctKey = `${state.rows},${state.columns},${state.product}`;
    const keys = candidates.map((c) => `${c.rows},${c.columns},${c.product}`);
    expect(new Set(keys).size).toBe(candidates.length);
    expect(keys).not.toContain(correctKey);
  });

  it("provides two-equation distractors that are not the correct pair", () => {
    const state = M.createTwoEquationsForArrayState(3, 4);
    const candidates = M.getTwoEquationsForArrayDistractorCandidates(state);

    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(new Set(candidates).size).toBe(candidates.length);
    expect(candidates).not.toContain(state.correctEquation);
  });

  it("provides number-line distractors that are not the correct equation", () => {
    const state = M.createNumberLineState(4, 3);
    const candidates = M.getNumberLineMisconceptionCandidates(state);

    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(new Set(candidates).size).toBe(candidates.length);
    expect(candidates).not.toContain(state.equation);
  });

  it("provides connect distractors including role-reversed stories", () => {
    const state = M.createConnectModelsState(3, 4, "equation", "story");
    const candidates = M.getConnectMisconceptionCandidates(state);

    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(new Set(candidates).size).toBe(candidates.length);
    expect(candidates).not.toContain(state.correctTarget);
    expect(candidates).toContain("There are 4 groups with 3 items in each.");
  });
});
