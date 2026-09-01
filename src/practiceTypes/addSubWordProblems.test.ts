import { describe, expect, it } from "vitest";
import {
  ADD_SUB_WORD_PROBLEM_PRACTICE_TYPES,
  generateChooseOperationProblems,
  generateEstimateThenSolveProblems,
  generateOneStepWordProblems,
  generateTwoStepMeasurementEquationProblems,
  generateTwoStepUnknownProblems,
} from "./addSubWordProblems";

const generators = [
  generateChooseOperationProblems,
  generateEstimateThenSolveProblems,
  generateOneStepWordProblems,
  generateTwoStepUnknownProblems,
  generateTwoStepMeasurementEquationProblems,
] as const;

function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

function assertFourUniqueChoices(problem: ReturnType<(typeof generators)[number]>[number]): void {
  const choices = problem.visualData?.choices ?? [];
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);
}

function resultForTwoStep(form: string, a: number, b: number, c: number): number {
  if (form === "add_then_add") return a + b + c;
  if (form === "add_then_subtract") return a + b - c;
  if (form === "subtract_then_add") return a - b + c;
  if (form === "subtract_then_subtract") return a - b - c;
  throw new Error(`Unknown two-step form: ${form}`);
}

function resultForMeasurement(form: string, a: number, b: number, c: number): number {
  if (form === "add_then_subtract") return a + b - c;
  if (form === "subtract_then_add") return a - b + c;
  if (form === "multiply_then_add") return a * b + c;
  if (form === "multiply_then_subtract") return a * b - c;
  if (form === "divide_then_add") return a / b + c;
  if (form === "divide_then_subtract") return a / b - c;
  throw new Error(`Unknown measurement form: ${form}`);
}

describe("add/sub word-problem Practice generators", () => {
  it("has one generator for every family practice type", () => {
    expect(ADD_SUB_WORD_PROBLEM_PRACTICE_TYPES).toHaveLength(5);
    expect(generators).toHaveLength(ADD_SUB_WORD_PROBLEM_PRACTICE_TYPES.length);
  });

  it.each(generators)("is deterministic and emits unique answerable problems", (generate) => {
    const first = generate({ seed: "addsub-word-seed", count: 6 });
    const second = generate({ seed: "addsub-word-seed", count: 6 });

    expect(first).toEqual(second);
    expect(first).toHaveLength(6);
    expect(new Set(first.map((problem) => problem.problemKey)).size).toBe(6);
    for (const problem of first) assertFourUniqueChoices(problem);
  });

  it("varies learner-facing mathematical state when the seed changes", () => {
    const first = generateOneStepWordProblems({ seed: "seed-a", count: 6 });
    const second = generateOneStepWordProblems({ seed: "seed-b", count: 6 });
    expect(first.map((problem) => problem.problemKey)).not.toEqual(
      second.map((problem) => problem.problemKey),
    );
  });

  it("balances addition and subtraction when choosing the operation", () => {
    const problems = generateChooseOperationProblems({ seed: "choose-balanced", count: 6 });
    const operations = problems.map((problem) => problem.problemKey.match(/:op=(add|subtract):/)?.[1]);
    expect(operations.filter((operation) => operation === "add")).toHaveLength(3);
    expect(operations.filter((operation) => operation === "subtract")).toHaveLength(3);

    for (const problem of problems) {
      const match = problem.correctAnswer.match(/^(\d+) ([+-]) (\d+) = (\d+)$/);
      expect(match).not.toBeNull();
      if (!match) continue;
      const a = Number(match[1]);
      const b = Number(match[3]);
      const result = Number(match[4]);
      expect(match[2] === "+" ? a + b : a - b).toBe(result);
    }
  });

  it("rounds to the nearest hundred, then reports the exact answer", () => {
    const problems = generateEstimateThenSolveProblems({ seed: "estimate-semantics", count: 8 });
    const operations = new Set<string>();

    for (const problem of problems) {
      const key = problem.problemKey.match(/op=(add|subtract):a=(\d+):b=(\d+)/);
      expect(key).not.toBeNull();
      if (!key) continue;
      const [, operation, aText, bText] = key;
      const a = Number(aText);
      const b = Number(bText);
      operations.add(operation);
      const estimate = operation === "add"
        ? roundToHundred(a) + roundToHundred(b)
        : roundToHundred(a) - roundToHundred(b);
      const exact = operation === "add" ? a + b : a - b;
      expect(problem.correctAnswer).toBe(`Estimate ${estimate}; exact ${exact}`);
      expect(problem.visualData?.equations).toContain(
        `${roundToHundred(a)} ${operation === "add" ? "+" : "-"} ${roundToHundred(b)} = ${estimate}`,
      );
    }

    expect(operations).toEqual(new Set(["add", "subtract"]));
  });

  it("solves one-step additive stories with the operation encoded in canonical identity", () => {
    for (const problem of generateOneStepWordProblems({ seed: "one-step-semantics", count: 8 })) {
      const key = problem.problemKey.match(/op=(add|subtract):a=(\d+):b=(\d+)/);
      expect(key).not.toBeNull();
      if (!key) continue;
      const [, operation, aText, bText] = key;
      const a = Number(aText);
      const b = Number(bText);
      const expected = operation === "add" ? a + b : a - b;
      expect(Number(problem.correctAnswer)).toBe(expected);
      expect(expected).toBeGreaterThanOrEqual(0);
    }
  });

  it("genuinely requires two ordered additive steps", () => {
    const problems = generateTwoStepUnknownProblems({ seed: "two-step-semantics", count: 8 });
    const forms = new Set<string>();

    for (const problem of problems) {
      const key = problem.problemKey.match(/form=([^:]+):a=(\d+):b=(\d+):c=(\d+)/);
      expect(key).not.toBeNull();
      if (!key) continue;
      const [, form, aText, bText, cText] = key;
      const a = Number(aText);
      const b = Number(bText);
      const c = Number(cText);
      forms.add(form);
      expect(Number(problem.correctAnswer)).toBe(resultForTwoStep(form, a, b, c));
      expect(Number(problem.correctAnswer)).toBeGreaterThanOrEqual(0);
    }

    expect(forms).toEqual(
      new Set(["add_then_add", "add_then_subtract", "subtract_then_add", "subtract_then_subtract"]),
    );
  });

  it("covers all four operations in the six-form measurement equation lesson", () => {
    const problems = generateTwoStepMeasurementEquationProblems({
      seed: "measurement-semantics",
      count: 6,
    });
    const forms = new Set<string>();

    for (const problem of problems) {
      const key = problem.problemKey.match(
        /form=([^:]+):a=(\d+):b=(\d+):c=(\d+):unit=([^:]+):/,
      );
      expect(key).not.toBeNull();
      if (!key) continue;
      const [, form, aText, bText, cText, unit] = key;
      const result = resultForMeasurement(form, Number(aText), Number(bText), Number(cText));
      forms.add(form);
      expect(Number.isInteger(result)).toBe(true);
      expect(problem.correctAnswer).toContain(`n = ${result} ${unit}`);
      expect(problem.visualData?.equation).toContain("n =");
    }

    expect(forms).toEqual(
      new Set([
        "add_then_subtract",
        "subtract_then_add",
        "multiply_then_add",
        "multiply_then_subtract",
        "divide_then_add",
        "divide_then_subtract",
      ]),
    );
  });
});
