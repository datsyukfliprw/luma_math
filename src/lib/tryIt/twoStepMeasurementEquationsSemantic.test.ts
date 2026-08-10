import { describe, it, expect } from "vitest";
import { getResolvedTryItExperience } from "../tryItResolver";

const LESSON_ID = "g3-u36-w1-l3";

function getExperience(attemptKey: string) {
  const exp = getResolvedTryItExperience(LESSON_ID, { attemptKey });
  if (!exp) throw new Error(`No Try It experience resolved for ${LESSON_ID}`);
  return exp;
}

function tokenize(expr: string): (number | string)[] {
  const tokens = expr.match(/\d+|×|÷|\+|-/g);
  if (!tokens) throw new Error(`Could not tokenize expression: ${expr}`);
  return tokens.map((t) => (/^\d+$/.test(t) ? Number(t) : t));
}

function applyOp(values: number[], op: string): void {
  const b = values.pop()!;
  const a = values.pop()!;
  let result: number;
  if (op === "+") result = a + b;
  else if (op === "-") result = a - b;
  else if (op === "×") result = a * b;
  else if (op === "÷") result = a / b;
  else throw new Error(`Unknown operator: ${op}`);
  values.push(result);
}

function evaluateEquation(equation: string): number {
  const expr = equation.replace(/= n$/, "").trim();
  const tokens = tokenize(expr);
  const values: number[] = [];
  const ops: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "×": 2, "÷": 2 };
  for (const token of tokens) {
    if (typeof token === "number") {
      values.push(token);
    } else {
      while (ops.length && precedence[ops[ops.length - 1]] >= precedence[token]) {
        applyOp(values, ops.pop()!);
      }
      ops.push(token);
    }
  }
  while (ops.length) applyOp(values, ops.pop()!);
  return values[0];
}

function extractNumbers(s: string): number[] {
  return (s.match(/\d+/g) ?? []).map(Number);
}

function formFromKey(key: string): string {
  return key.split(":")[1] ?? "";
}

function unitFromSolution(correct: string): string {
  return correct.split(" ").slice(1).join(" ");
}

describe("two_step_measurement_equations Try It semantics", () => {
  it("has exactly two parts named equation and solution", () => {
    const exp = getExperience("two-step-parts");
    for (const problem of exp.problems) {
      expect(problem.parts.length).toBe(2);
      const keys = problem.parts.map((p) => p.key);
      expect(keys).toContain("equation");
      expect(keys).toContain("solution");
      const equationPart = problem.parts.find((p) => p.key === "equation");
      const solutionPart = problem.parts.find((p) => p.key === "solution");
      expect(equationPart!.label).toBe("Equation");
      expect(solutionPart!.label).toBe("Solution");
    }
  });

  it("generated equation matches the story and uses the unknown n", () => {
    for (let i = 0; i < 10; i++) {
      for (const problem of getExperience(`two-step-match-${i}`).problems) {
        const equationPart = problem.parts.find((p) => p.key === "equation")!;
        const solutionPart = problem.parts.find((p) => p.key === "solution")!;
        expect(equationPart.correctAnswer).toMatch(/= n$/);
        const nums = extractNumbers(equationPart.correctAnswer);
        expect(nums.length).toBeGreaterThanOrEqual(3);
        let searchFrom = 0;
        for (const n of nums) {
          const idx = problem.prompt.indexOf(String(n), searchFrom);
          expect(idx).toBeGreaterThanOrEqual(searchFrom);
          searchFrom = idx + 1;
        }
        const unit = unitFromSolution(solutionPart.correctAnswer);
        expect(problem.prompt).toContain(unit);
      }
    }
  });

  it("solution evaluates from the equation", () => {
    for (let i = 0; i < 10; i++) {
      for (const problem of getExperience(`two-step-eval-${i}`).problems) {
        const equationPart = problem.parts.find((p) => p.key === "equation")!;
        const solutionPart = problem.parts.find((p) => p.key === "solution")!;
        const expected = evaluateEquation(equationPart.correctAnswer);
        const actual = Number(solutionPart.correctAnswer.split(" ")[0]);
        expect(actual).toBe(expected);
      }
    }
  });

  it("uses multiple operation-sequence forms across seeds", () => {
    const forms = new Set<string>();
    for (let i = 0; i < 30; i++) {
      for (const problem of getExperience(`two-step-forms-${i}`).problems) {
        expect(problem.problemKey).toBeDefined();
        forms.add(formFromKey(problem.problemKey!));
      }
    }
    expect(forms.size).toBeGreaterThanOrEqual(4);
  });

  it("division forms, if generated, divide evenly", () => {
    for (let i = 0; i < 30; i++) {
      for (const problem of getExperience(`two-step-div-${i}`).problems) {
        const equationPart = problem.parts.find((p) => p.key === "equation")!;
        if (!equationPart.correctAnswer.includes("÷")) continue;
        const nums = extractNumbers(equationPart.correctAnswer);
        expect(nums.length).toBeGreaterThanOrEqual(2);
        const [dividend, divisor] = [nums[0], nums[1]];
        expect(dividend % divisor).toBe(0);
      }
    }
  });

  it("never produces negative or zero results", () => {
    for (let i = 0; i < 30; i++) {
      for (const problem of getExperience(`two-step-neg-${i}`).problems) {
        const equationPart = problem.parts.find((p) => p.key === "equation")!;
        const result = evaluateEquation(equationPart.correctAnswer);
        expect(result).toBeGreaterThan(0);
      }
    }
  });

  it("actual operands and unit are represented in the canonical key", () => {
    for (let i = 0; i < 10; i++) {
      for (const problem of getExperience(`two-step-key-${i}`).problems) {
        const equationPart = problem.parts.find((p) => p.key === "equation")!;
        const solutionPart = problem.parts.find((p) => p.key === "solution")!;
        const key = problem.problemKey ?? "";
        const keyParts = key.split(":");
        expect(keyParts[0]).toBe("two_step_measurement_equations");
        const keyNumbers = keyParts.slice(3, 6).map(Number);
        const equationNumbers = extractNumbers(equationPart.correctAnswer);
        expect(new Set(keyNumbers)).toEqual(new Set(equationNumbers));
        const unit = unitFromSolution(solutionPart.correctAnswer);
        expect(key).toContain(unit);
      }
    }
  });

  it("is deterministic for the same seed and has no duplicate keys", () => {
    const a = getExperience("two-step-det");
    const b = getExperience("two-step-det");
    expect(JSON.stringify(a.problems)).toBe(JSON.stringify(b.problems));
    const keys = a.problems.map((p) => p.problemKey ?? p.id);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
