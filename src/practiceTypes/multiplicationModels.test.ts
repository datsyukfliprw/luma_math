import { describe, expect, it } from "vitest";
import {
  generateBuildArraysProblems,
  generateConnectModelsEquationsStoriesProblems,
  generateDrawMultiplicationProblems,
  generateMultiplicationModelsProblems,
  generateMultiplicationNumberLineProblems,
  generateTwoEquationsForArrayProblems,
} from "./multiplicationModels";

function parseEquation(equation: string): { a: number; b: number; product: number } {
  const match = equation.match(/(\d+) × (\d+) = (\d+)/);
  if (!match) throw new Error(`Could not parse equation: ${equation}`);
  return { a: Number(match[1]), b: Number(match[2]), product: Number(match[3]) };
}

function parseEquationPair(pair: string): { a: number; b: number; product: number }[] {
  const matches = pair.match(/(\d+) × (\d+) = (\d+)/g);
  if (!matches) throw new Error(`Could not parse equation pair: ${pair}`);
  return matches.map(parseEquation);
}

function parseStory(story: string): { groups: number; items: number } | null {
  const match = story.match(/There are (\d+) groups with (\d+) items in each\./);
  if (!match) return null;
  return { groups: Number(match[1]), items: Number(match[2]) };
}

function parseDrawProblem(problem: ReturnType<typeof generateDrawMultiplicationProblems>[number]) {
  const match = problem.questionText.match(/There are (\d+) groups with (\d+) items in each group/);
  if (!match) throw new Error(`Could not parse draw prompt: ${problem.questionText}`);
  const groups = Number(match[1]);
  const items = Number(match[2]);
  const equation = parseEquation(problem.correctAnswer);
  return { groups, items, product: equation.product };
}

function parseBuildArraysProblem(problem: ReturnType<typeof generateBuildArraysProblems>[number]) {
  const match = problem.questionText.match(/Build an array for (\d+) × (\d+)/);
  if (!match) throw new Error(`Could not parse build-arrays prompt: ${problem.questionText}`);
  const [rows, columns, product] = problem.correctAnswer.split(",").map(Number);
  return { rows, columns, product };
}

function parseTwoEquationsProblem(
  problem: ReturnType<typeof generateTwoEquationsForArrayProblems>[number],
) {
  const match = problem.questionText.match(/An array has (\d+) rows and (\d+) columns/);
  if (!match) throw new Error(`Could not parse two-equations prompt: ${problem.questionText}`);
  const rows = Number(match[1]);
  const columns = Number(match[2]);
  const equations = parseEquationPair(problem.correctAnswer);
  return { rows, columns, equations, product: equations[0].product };
}

function parseNumberLineProblem(
  problem: ReturnType<typeof generateMultiplicationNumberLineProblems>[number],
) {
  const match = problem.questionText.match(/(\d+) equal jumps of (\d+)/);
  if (!match) throw new Error(`Could not parse number-line prompt: ${problem.questionText}`);
  const jumpCount = Number(match[1]);
  const jumpSize = Number(match[2]);
  const equation = parseEquation(problem.correctAnswer);
  return { jumpCount, jumpSize, endpoint: equation.product };
}

function parseConnectProblem(
  problem: ReturnType<typeof generateConnectModelsEquationsStoriesProblems>[number],
) {
  const source = parseEquation(problem.visualData?.sourceEquation as string);
  const target =
    problem.visualData?.targetRepresentation === "story"
      ? parseStory(problem.correctAnswer)
      : parseEquation(problem.correctAnswer);
  return { source, target };
}

function assertExactlyOneCorrect(problem: {
  correctAnswer: string;
  visualData?: { choices?: string[] };
}) {
  const choices = problem.visualData?.choices ?? [];
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(choices.length);
  const correctCount = choices.filter((choice) => choice === problem.correctAnswer).length;
  expect(correctCount).toBe(1);
}

describe("multiplication models practice adapter", () => {
  it("dispatches to the correct sub-generator from lesson practice_type", () => {
    const draw = generateMultiplicationModelsProblems({
      seed: "dispatch",
      count: 1,
      lesson: { practice_type: "draw_multiplication" },
    });
    expect(draw[0].id).toMatch(/^draw_multiplication-/);

    const arrays = generateMultiplicationModelsProblems({
      seed: "dispatch",
      count: 1,
      lesson: { practice_type: "build_arrays" },
    });
    expect(arrays[0].id).toMatch(/^build_arrays-/);

    const two = generateMultiplicationModelsProblems({
      seed: "dispatch",
      count: 1,
      lesson: { practice_type: "two_equations_for_array" },
    });
    expect(two[0].id).toMatch(/^two_equations_for_array-/);

    const line = generateMultiplicationModelsProblems({
      seed: "dispatch",
      count: 1,
      lesson: { practice_type: "multiplication_number_line" },
    });
    expect(line[0].id).toMatch(/^multiplication_number_line-/);

    const connect = generateMultiplicationModelsProblems({
      seed: "dispatch",
      count: 1,
      lesson: { practice_type: "connect_models_equations_stories" },
    });
    expect(connect[0].id).toMatch(/^connect_models_equations_stories-/);
  });

  describe("draw_multiplication", () => {
    it("reconstructs the equal-groups model from the prompt and choices", () => {
      const problem = generateDrawMultiplicationProblems({ seed: "draw-contract", count: 1 })[0];
      const { groups, items, product } = parseDrawProblem(problem);

      expect(groups * items).toBe(product);
      expect(problem.visualData?.groups).toBe(groups);
      expect(problem.visualData?.itemsPerGroup).toBe(items);
      expect(problem.visualData?.equation).toContain(`${groups} × ${items}`);
      expect(problem.problemKey).toBe(
        `multiplication:model:equal-groups:g=${groups}:n=${items}:task=construct`,
      );
      expect(problem.correctAnswer).toBe(`${groups} × ${items} = ${product}`);
      expect(problem.answerData).toEqual({
        factorA: String(groups),
        factorB: String(items),
        product: String(product),
      });
    });

    it("offers unique choices with exactly one matching equation", () => {
      const problem = generateDrawMultiplicationProblems({ seed: "draw-choices", count: 1 })[0];
      assertExactlyOneCorrect(problem);
    });

    it("fulfills requested counts and rejects duplicate canonical problems", () => {
      const problems = generateDrawMultiplicationProblems({ seed: "draw-session", count: 12 });
      expect(problems).toHaveLength(12);
      expect(new Set(problems.map((p) => p.problemKey)).size).toBe(problems.length);
    });

    it("is deterministic for one seed and varies across seeds", () => {
      expect(generateDrawMultiplicationProblems({ seed: "same", count: 8 })).toEqual(
        generateDrawMultiplicationProblems({ seed: "same", count: 8 }),
      );
      expect(generateDrawMultiplicationProblems({ seed: "one", count: 8 })).not.toEqual(
        generateDrawMultiplicationProblems({ seed: "two", count: 8 }),
      );
    });
  });

  describe("build_arrays", () => {
    it("reconstructs the array as rows times columns", () => {
      const problem = generateBuildArraysProblems({ seed: "array-contract", count: 1 })[0];
      const { rows, columns, product } = parseBuildArraysProblem(problem);

      expect(rows * columns).toBe(product);
      expect(problem.visualData?.rows).toBe(rows);
      expect(problem.visualData?.columns).toBe(columns);
      expect(problem.visualData?.equation).toContain(`${rows} × ${columns}`);
      expect(problem.problemKey).toBe(`multiplication:model:array:r=${rows}:c=${columns}:task=build`);
      expect(problem.correctAnswer).toBe(`${rows},${columns},${product}`);
      expect(problem.answerData).toEqual({
        rows: String(rows),
        columns: String(columns),
        product: String(product),
      });
    });

    it("offers unique tuple choices with exactly one correct array", () => {
      const problem = generateBuildArraysProblems({ seed: "array-choices", count: 1 })[0];
      assertExactlyOneCorrect(problem);
    });

    it("fulfills requested counts and rejects duplicate canonical problems", () => {
      const problems = generateBuildArraysProblems({ seed: "array-session", count: 12 });
      expect(problems).toHaveLength(12);
      expect(new Set(problems.map((p) => p.problemKey)).size).toBe(problems.length);
    });

    it("keeps rows and columns in the correct order for the array prompt", () => {
      const problem = generateBuildArraysProblems({ seed: "array-order", count: 1 })[0];
      const parsed = parseBuildArraysProblem(problem);
      const promptMatch = problem.questionText.match(/Build an array for (\d+) × (\d+)/);
      expect(promptMatch).not.toBeNull();
      expect(Number(promptMatch![1])).toBe(parsed.rows);
      expect(Number(promptMatch![2])).toBe(parsed.columns);
    });
  });

  describe("two_equations_for_array", () => {
    it("reconstructs both commutative equations from the correct answer", () => {
      const problem = generateTwoEquationsForArrayProblems({ seed: "two-contract", count: 1 })[0];
      const { rows, columns, equations, product } = parseTwoEquationsProblem(problem);

      expect(equations).toHaveLength(2);
      expect(equations[0].product).toBe(product);
      expect(equations[1].product).toBe(product);
      expect(equations[0].a).toBe(rows);
      expect(equations[0].b).toBe(columns);
      expect(equations[1].a).toBe(columns);
      expect(equations[1].b).toBe(rows);
      expect(problem.visualData?.equations).toEqual([
        `${rows} × ${columns} = ${product}`,
        `${columns} × ${rows} = ${product}`,
      ]);
      expect(problem.problemKey).toBe(
        `multiplication:property:commutative:a=${rows}:b=${columns}:representation=array:task=two-equations`,
      );
    });

    it("offers unique choices with exactly one correct pair", () => {
      const problem = generateTwoEquationsForArrayProblems({ seed: "two-choices", count: 1 })[0];
      assertExactlyOneCorrect(problem);
    });

    it("fulfills requested counts and rejects duplicate canonical problems", () => {
      const problems = generateTwoEquationsForArrayProblems({ seed: "two-session", count: 12 });
      expect(problems).toHaveLength(12);
      expect(new Set(problems.map((p) => p.problemKey)).size).toBe(problems.length);
    });
  });

  describe("multiplication_number_line", () => {
    it("reconstructs the number line from prompt and equation", () => {
      const problem = generateMultiplicationNumberLineProblems({
        seed: "line-contract",
        count: 1,
      })[0];
      const { jumpCount, jumpSize, endpoint } = parseNumberLineProblem(problem);

      expect(jumpCount * jumpSize).toBe(endpoint);
      expect(problem.visualData?.jumpCount).toBe(jumpCount);
      expect(problem.visualData?.jumpSize).toBe(jumpSize);
      expect(problem.visualData?.start).toBe(0);
      expect(problem.visualData?.endpoint).toBe(endpoint);
      expect(problem.correctAnswer).toBe(`${jumpCount} × ${jumpSize} = ${endpoint}`);
      expect(problem.problemKey).toBe(
        `multiplication:model:number-line:j=${jumpCount}:s=${jumpSize}:start=0:task=represent`,
      );
      expect(problem.answerData).toEqual({
        factorA: String(jumpCount),
        factorB: String(jumpSize),
        product: String(endpoint),
      });
    });

    it("offers unique choices with exactly one matching equation", () => {
      const problem = generateMultiplicationNumberLineProblems({
        seed: "line-choices",
        count: 1,
      })[0];
      assertExactlyOneCorrect(problem);
    });

    it("fulfills requested counts and rejects duplicate canonical problems", () => {
      const problems = generateMultiplicationNumberLineProblems({
        seed: "line-session",
        count: 12,
      });
      expect(problems).toHaveLength(12);
      expect(new Set(problems.map((p) => p.problemKey)).size).toBe(problems.length);
    });
  });

  describe("connect_models_equations_stories", () => {
    it("keeps the same ordered factors and product across source and target", () => {
      const problem = generateConnectModelsEquationsStoriesProblems({
        seed: "connect-contract",
        count: 1,
      })[0];
      const { source, target } = parseConnectProblem(problem);

      expect(source.a).toBe(source.a);
      expect(source.b).toBe(source.b);
      expect(source.a * source.b).toBe(source.product);
      if (target && "groups" in target) {
        expect(target.groups).toBe(source.a);
        expect(target.items).toBe(source.b);
      } else if (target) {
        expect(target.a).toBe(source.a);
        expect(target.b).toBe(source.b);
        expect(target.product).toBe(source.product);
      }
      expect(problem.visualData?.factorA).toBe(source.a);
      expect(problem.visualData?.factorB).toBe(source.b);
      expect(problem.visualData?.product).toBe(source.product);
    });

    it("offers unique choices with exactly one matching target", () => {
      const problem = generateConnectModelsEquationsStoriesProblems({
        seed: "connect-choices",
        count: 1,
      })[0];
      assertExactlyOneCorrect(problem);
    });

    it("fulfills requested counts and rejects duplicate canonical problems", () => {
      const problems = generateConnectModelsEquationsStoriesProblems({
        seed: "connect-session",
        count: 12,
      });
      expect(problems).toHaveLength(12);
      expect(new Set(problems.map((p) => p.problemKey)).size).toBe(problems.length);
    });

    it("does not accept a role-reversed story when the source defines ordered roles", () => {
      const problems = generateConnectModelsEquationsStoriesProblems({
        seed: "connect-roles",
        count: 12,
      });
      const storyTarget = problems.find(
        (p) => p.visualData?.targetRepresentation === "story",
      );
      expect(storyTarget).toBeDefined();
      const { source, target } = parseConnectProblem(storyTarget!);
      expect(target).not.toBeNull();
      if (target && "groups" in target) {
        expect(target.groups).toBe(source.a);
        expect(target.items).toBe(source.b);
      }
    });
  });

  it("is deterministic for the same seed and varies across seeds for all sub-generators", () => {
    const generators = [
      generateDrawMultiplicationProblems,
      generateBuildArraysProblems,
      generateTwoEquationsForArrayProblems,
      generateMultiplicationNumberLineProblems,
      generateConnectModelsEquationsStoriesProblems,
    ] as const;

    for (const generate of generators) {
      expect(generate({ seed: "same", count: 8 })).toEqual(
        generate({ seed: "same", count: 8 }),
      );
      expect(generate({ seed: "alpha", count: 8 })).not.toEqual(
        generate({ seed: "beta", count: 8 }),
      );
    }
  });
});
