import { describe, expect, it } from "vitest";
import {
  DIVISION_PRACTICE_TYPES,
  generateDivideBy6Problems,
  generateDivideBy7Problems,
  generateDivideBy8Problems,
  generateDivideBy9Problems,
  generateDivisionArraysProblems,
  generateDivisionCountingGroupsProblems,
  generateDivisionNumberLineProblems,
  generateDivisionSharingProblems,
  generateDivisionWithOneAndZeroProblems,
  generateFactFamiliesProblems,
  generateMissingNumbersDivisionProblems,
  generateMultiplicationForDivisionProblems,
  generateWriteDivisionEquationsProblems,
} from "./division";

const generators = [
  generateDivisionSharingProblems,
  generateDivisionCountingGroupsProblems,
  generateWriteDivisionEquationsProblems,
  generateDivisionWithOneAndZeroProblems,
  generateDivisionArraysProblems,
  generateDivisionNumberLineProblems,
  generateFactFamiliesProblems,
  generateMultiplicationForDivisionProblems,
  generateDivideBy6Problems,
  generateDivideBy7Problems,
  generateDivideBy8Problems,
  generateDivideBy9Problems,
  generateMissingNumbersDivisionProblems,
] as const;

function parseDivisionEquation(equation: string): {
  dividend: number;
  divisor: number;
  quotient: number;
} {
  const match = equation.match(/^(\d+) ÷ (\d+) = (\d+)$/);
  if (!match) throw new Error(`Unexpected division equation: ${equation}`);
  return {
    dividend: Number(match[1]),
    divisor: Number(match[2]),
    quotient: Number(match[3]),
  };
}

describe("division Practice adapters", () => {
  it("has one generator for every targeted division practice type", () => {
    expect(generators).toHaveLength(DIVISION_PRACTICE_TYPES.length);
    expect(DIVISION_PRACTICE_TYPES).toHaveLength(13);
  });

  it.each(generators)("is seeded and emits unique canonical keys", (generate) => {
    const first = generate({ seed: "division-semantic", count: 6 });
    const second = generate({ seed: "division-semantic", count: 6 });

    expect(first).toEqual(second);
    expect(first).toHaveLength(6);
    expect(new Set(first.map((problem) => problem.problemKey)).size).toBe(6);

    for (const problem of first) {
      if (problem.visualType === "multiple_choice") {
        expect(problem.visualData?.choices).toHaveLength(4);
        expect(problem.visualData?.choices).toContain(problem.correctAnswer);
        expect(new Set(problem.visualData?.choices).size).toBe(4);
      }
    }
  });

  it("models fair sharing as total ÷ number of groups = amount in each group", () => {
    for (const problem of generateDivisionSharingProblems({ seed: "sharing", count: 8 })) {
      const total = problem.visualData?.items;
      const groups = problem.visualData?.groupsToShare;
      const quotient = Number(problem.correctAnswer);

      expect(total).toBeDefined();
      expect(groups).toBeDefined();
      expect((total ?? 0) / (groups ?? 1)).toBe(quotient);
      expect(problem.answerData?.quotient).toBe(problem.correctAnswer);
      expect(problem.problemKey).toContain("division:model:sharing:");
    }
  });

  it("models counting groups as total ÷ group size = number of groups", () => {
    for (const problem of generateDivisionCountingGroupsProblems({ seed: "count-groups", count: 8 })) {
      const equation = problem.visualData?.equation;
      expect(equation).toBeDefined();
      const match = equation?.match(/^(\d+) ÷ (\d+) = \?$/);
      expect(match).not.toBeNull();
      if (!match) continue;

      const dividend = Number(match[1]);
      const groupSize = Number(match[2]);
      expect(dividend / groupSize).toBe(Number(problem.correctAnswer));
      expect(problem.problemKey).toContain("division:model:counting-groups:");
    }
  });

  it("asks for a division equation and supplies exactly one matching division equation", () => {
    for (const problem of generateWriteDivisionEquationsProblems({ seed: "write-equations", count: 10 })) {
      const choices = problem.visualData?.choices ?? [];
      expect(problem.correctAnswer).toMatch(/^\d+ ÷ \d+ = \d+$/);
      expect(choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);

      const fact = parseDivisionEquation(problem.correctAnswer);
      expect(fact.divisor * fact.quotient).toBe(fact.dividend);
      expect(problem.problemKey).toContain(":ask=equation");
    }
  });

  it("balances divide-by-one, zero-dividend, and divide-by-zero rules", () => {
    const problems = generateDivisionWithOneAndZeroProblems({ seed: "special-rules", count: 6 });
    const equations = problems.map((problem) => problem.visualData?.equation ?? "");

    expect(equations.some((equation) => /^\d+ ÷ 1 = \?$/.test(equation))).toBe(true);
    expect(equations.some((equation) => /^0 ÷ [2-9] = \?$/.test(equation))).toBe(true);
    expect(equations.some((equation) => /^[2-9] ÷ 0 = \?$/.test(equation))).toBe(true);
    expect(problems.some((problem) => problem.correctAnswer === "undefined")).toBe(true);
    expect(problems.some((problem) => problem.correctAnswer === "0")).toBe(true);
  });

  it("preserves whether rows or columns are the known array dimension", () => {
    const problems = generateDivisionArraysProblems({ seed: "arrays", count: 16 });
    const knownDimensions = new Set<string>();

    for (const problem of problems) {
      const rows = problem.visualData?.rows ?? 0;
      const columns = problem.visualData?.columns ?? 0;
      const product = problem.visualData?.product ?? 0;
      expect(rows * columns).toBe(product);

      const known = problem.problemKey.match(/:known=(rows|columns)$/)?.[1];
      if (known) {
        knownDimensions.add(known);
        expect(Number(problem.correctAnswer)).toBe(known === "rows" ? columns : rows);
      }
    }

    expect(knownDimensions).toEqual(new Set(["rows", "columns"]));
  });

  it("makes number-line jump count equal the quotient", () => {
    for (const problem of generateDivisionNumberLineProblems({ seed: "number-line", count: 8 })) {
      const jumpCount = problem.visualData?.jumpCount ?? 0;
      const jumpSize = problem.visualData?.jumpSize ?? 0;
      const endpoint = problem.visualData?.endpoint ?? 0;
      expect(jumpCount * jumpSize).toBe(endpoint);
      expect(Number(problem.correctAnswer)).toBe(jumpCount);
    }
  });

  it("builds four correct facts from the same three-number fact family", () => {
    for (const problem of generateFactFamiliesProblems({ seed: "families", count: 8 })) {
      const equations = problem.correctAnswer.split("; ");
      expect(equations).toHaveLength(4);

      const factors = problem.visualData?.factors ?? [];
      const product = problem.visualData?.product ?? 0;
      const [a, b] = factors;
      expect(a * b).toBe(product);
      expect(equations).toEqual([
        `${a} × ${b} = ${product}`,
        `${b} × ${a} = ${product}`,
        `${product} ÷ ${a} = ${b}`,
        `${product} ÷ ${b} = ${a}`,
      ]);
      expect(a).not.toBe(b);
    }
  });

  it("uses the inverse multiplication fact to solve division", () => {
    for (const problem of generateMultiplicationForDivisionProblems({ seed: "inverse", count: 8 })) {
      const division = problem.visualData?.equation?.match(/^(\d+) ÷ (\d+) = \?$/);
      const multiply = problem.correctAnswer.match(/^(\d+) × (\d+) = (\d+)$/);
      expect(division).not.toBeNull();
      expect(multiply).not.toBeNull();
      if (!division || !multiply) continue;

      const dividend = Number(division[1]);
      const divisor = Number(division[2]);
      expect(Number(multiply[1])).toBe(divisor);
      expect(Number(multiply[1]) * Number(multiply[2])).toBe(dividend);
      expect(Number(multiply[3])).toBe(dividend);
    }
  });

  it.each([
    [6, generateDivideBy6Problems],
    [7, generateDivideBy7Problems],
    [8, generateDivideBy8Problems],
    [9, generateDivideBy9Problems],
  ] as const)("keeps divide-by-%i facts exact", (divisor, generate) => {
    for (const problem of generate({ seed: `divide-${divisor}`, count: 6 })) {
      const match = problem.visualData?.equation?.match(/^(\d+) ÷ (\d+) = \?$/);
      expect(match).not.toBeNull();
      if (!match) continue;

      const dividend = Number(match[1]);
      const shownDivisor = Number(match[2]);
      expect(shownDivisor).toBe(divisor);
      expect(dividend / shownDivisor).toBe(Number(problem.correctAnswer));
    }
  });

  it("balances all three missing-number roles", () => {
    const problems = generateMissingNumbersDivisionProblems({ seed: "missing", count: 9 });
    const roles = problems.map((problem) =>
      problem.problemKey.match(/:ask=(dividend|divisor|quotient)$/)?.[1],
    );

    expect(new Set(roles)).toEqual(new Set(["dividend", "divisor", "quotient"]));

    for (const problem of problems) {
      const equation = problem.visualData?.equation ?? "";
      const values = equation.match(/^(\?|\d+) ÷ (\?|\d+) = (\?|\d+)$/);
      expect(values).not.toBeNull();
      if (!values) continue;

      const supplied = Number(problem.correctAnswer);
      const dividend = values[1] === "?" ? supplied : Number(values[1]);
      const divisor = values[2] === "?" ? supplied : Number(values[2]);
      const quotient = values[3] === "?" ? supplied : Number(values[3]);
      expect(divisor * quotient).toBe(dividend);
    }
  });
});
