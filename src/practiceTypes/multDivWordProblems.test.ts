import { describe, expect, it } from "vitest";
import {
  MULT_DIV_WORD_PROBLEM_PRACTICE_TYPES,
  generateEqualGroupArrayProblems,
  generateEquationsWithUnknownsProblems,
  generateStripModelProblems,
  generateTwoStepMultDivPatternProblems,
} from "./multDivWordProblems";

const generators = [
  generateEqualGroupArrayProblems,
  generateStripModelProblems,
  generateEquationsWithUnknownsProblems,
  generateTwoStepMultDivPatternProblems,
] as const;

function assertFourUniqueChoices(problem: ReturnType<(typeof generators)[number]>[number]): void {
  const choices = problem.visualData?.choices ?? [];
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);
}

function parseFact(key: string): { a: number; b: number; total: number } {
  const match = key.match(/:a=(\d+):b=(\d+):(total|product)=(\d+)/);
  if (!match) throw new Error(`Cannot parse multiplication/division fact from ${key}`);
  return { a: Number(match[1]), b: Number(match[2]), total: Number(match[4]) };
}

describe("multiplication/division application Practice generators", () => {
  it("has one generator for every Unit 18 practice type", () => {
    expect(MULT_DIV_WORD_PROBLEM_PRACTICE_TYPES).toHaveLength(4);
    expect(generators).toHaveLength(MULT_DIV_WORD_PROBLEM_PRACTICE_TYPES.length);
  });

  it.each(generators)("is seeded and emits unique canonical problems", (generate) => {
    const first = generate({ seed: "multdiv-word-seed", count: 6 });
    const second = generate({ seed: "multdiv-word-seed", count: 6 });

    expect(first).toEqual(second);
    expect(first).toHaveLength(6);
    expect(new Set(first.map((problem) => problem.problemKey)).size).toBe(6);
    for (const problem of first) assertFourUniqueChoices(problem);
  });

  it("balances equal-group multiplication/division and array multiplication/division", () => {
    const problems = generateEqualGroupArrayProblems({ seed: "equal-group-semantics", count: 8 });
    const tasks = new Set<string>();

    for (const problem of problems) {
      const task = problem.problemKey.match(/task=([^:]+)/)?.[1];
      const { a, b, total } = parseFact(problem.problemKey);
      expect(a * b).toBe(total);
      tasks.add(task ?? "");
      const expected = task === "groups-multiply" || task === "array-multiply" ? total : b;
      expect(Number(problem.correctAnswer)).toBe(expected);
    }

    expect(tasks).toEqual(
      new Set(["groups-multiply", "groups-divide-sharing", "array-multiply", "array-divide-dimension"]),
    );
  });

  it("distinguishes all three strip-model unknown roles", () => {
    const problems = generateStripModelProblems({ seed: "strip-semantics", count: 6 });
    const tasks = new Set<string>();

    for (const problem of problems) {
      const key = problem.problemKey.match(/parts=(\d+):size=(\d+):total=(\d+):ask=([^:]+)/);
      expect(key).not.toBeNull();
      if (!key) continue;
      const parts = Number(key[1]);
      const size = Number(key[2]);
      const total = Number(key[3]);
      const task = key[4];
      expect(parts * size).toBe(total);
      tasks.add(task);
      const expected = task === "find-total" ? total : task === "find-part-size" ? size : parts;
      expect(Number(problem.correctAnswer)).toBe(expected);
      expect(problem.visualData?.sourceRepresentation).toBe("strip_model");
    }

    expect(tasks).toEqual(new Set(["find-total", "find-part-size", "find-part-count"]));
  });

  it("writes and solves multiplication/division equations for every unknown role", () => {
    const problems = generateEquationsWithUnknownsProblems({ seed: "unknown-semantics", count: 8 });
    const tasks = new Set<string>();

    for (const problem of problems) {
      const task = problem.problemKey.match(/task=([^:]+)/)?.[1] ?? "";
      const { a, b, total } = parseFact(problem.problemKey);
      expect(a * b).toBe(total);
      tasks.add(task);
      const expected = task === "division-missing-dividend"
        ? total
        : task === "division-missing-divisor"
          ? a
          : b;
      expect(problem.correctAnswer).toContain(`n = ${expected}`);
    }

    expect(tasks).toEqual(
      new Set([
        "multiply-missing-factor",
        "division-missing-dividend",
        "division-missing-divisor",
        "division-missing-quotient",
      ]),
    );
  });

  it("mixes genuine two-step applications with multiplication patterns", () => {
    const problems = generateTwoStepMultDivPatternProblems({ seed: "two-step-patterns", count: 9 });
    let twoStepCount = 0;
    let patternCount = 0;

    for (const problem of problems) {
      if (problem.problemKey.startsWith("multdiv:pattern:")) {
        patternCount += 1;
        const key = problem.problemKey.match(/task=([^:]+):a=(\d+):b=(\d+)/);
        expect(key).not.toBeNull();
        if (!key) continue;
        const [, task, aText, bText] = key;
        const a = Number(aText);
        const b = Number(bText);
        const expected = task === "double" ? a * 8 : a * (b + 3);
        expect(Number(problem.correctAnswer)).toBe(expected);
        continue;
      }

      twoStepCount += 1;
      const key = problem.problemKey.match(/task=([^:]+):a=(\d+):b=(\d+):c=(\d+)/);
      expect(key).not.toBeNull();
      if (!key) continue;
      const [, task, aText, bText, cText] = key;
      const a = Number(aText);
      const b = Number(bText);
      const c = Number(cText);
      let expected: number;
      if (task === "multiply-then-add") expected = a * b + c;
      else if (task === "multiply-then-subtract") expected = a * b - c;
      else if (task === "multiply-then-divide") expected = (a * b) / c;
      else expected = (a / b) * c;
      expect(Number.isInteger(expected)).toBe(true);
      expect(Number(problem.correctAnswer)).toBe(expected);
    }

    expect(twoStepCount).toBeGreaterThan(patternCount);
    expect(patternCount).toBeGreaterThan(0);
  });
});
