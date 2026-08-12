import { describe, expect, it } from "vitest";
import {
  generateAssociativeMultiplicationProblems,
  generateCommutativeMultiplicationProblems,
} from "./multiplicationProperties";
import { createPracticeSessionSeed } from "./random";
import type { PracticeProblem } from "./types";

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

function digitsOf(text: string): number[] {
  return (text.match(/\d+/g) ?? []).map(Number);
}

function isNumeric(text: string): boolean {
  return /^\d+$/.test(text.trim());
}

function choicesOf(problem: PracticeProblem): string[] {
  const choices = problem.visualData?.choices;
  expect(choices).toBeDefined();
  return choices as string[];
}

/** The equation shown in the stem, e.g. "You know 7 × 4 = 28." */
function shownCommutativeEquation(problem: PracticeProblem): { a: number; b: number; product: number } {
  const match = problem.questionText.match(/You know (\d+) × (\d+) = (\d+)\./);
  expect(match).not.toBeNull();
  const [, a, b, product] = match as RegExpMatchArray;
  return { a: Number(a), b: Number(b), product: Number(product) };
}

/** Every parenthesised three-factor grouping visible in a piece of text. */
function groupingsIn(text: string): string[] {
  return text.match(/\(\d+ × \d+\) × \d+|\d+ × \(\d+ × \d+\)/g) ?? [];
}

const COMMUTATIVE_SEED = "properties-commutative-test";
const ASSOCIATIVE_SEED = "properties-associative-test";

describe("commutative_multiplication practice", () => {
  const problems = generateCommutativeMultiplicationProblems({ seed: COMMUTATIVE_SEED, count: 12 });

  it("shows a true multiplication equation whose reversed factors keep the product", () => {
    for (const problem of problems) {
      const shown = shownCommutativeEquation(problem);
      expect(shown.a * shown.b).toBe(shown.product);
      expect(evaluateExpression(`${shown.b} × ${shown.a}`)).toBe(shown.product);
      // Squares would make the turn-around indistinguishable from the prompt.
      expect(shown.a).not.toBe(shown.b);
    }
  });

  it("asks either for the turn-around equation or for the turn-around product", () => {
    for (const problem of problems) {
      const shown = shownCommutativeEquation(problem);
      if (isNumeric(problem.correctAnswer)) {
        const asked = problem.questionText.match(/What is (\d+) × (\d+)\?/);
        expect(asked).not.toBeNull();
        const [, first, second] = asked as RegExpMatchArray;
        expect(Number(first)).toBe(shown.b);
        expect(Number(second)).toBe(shown.a);
        expect(Number(problem.correctAnswer)).toBe(shown.product);
      } else {
        const factors = digitsOf(problem.correctAnswer.split("=")[0]);
        expect(factors).toEqual([shown.b, shown.a]);
        expect(evaluateExpression(problem.correctAnswer.split("=")[0])).toBe(shown.product);
        expect(Number(problem.correctAnswer.split("=")[1])).toBe(shown.product);
      }
    }
  });

  it("offers exactly one correct choice", () => {
    for (const problem of problems) {
      const shown = shownCommutativeEquation(problem);
      const choices = choicesOf(problem);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain(problem.correctAnswer);

      const correctCount = choices.filter((choice) => {
        if (isNumeric(problem.correctAnswer)) return Number(choice) === shown.product;
        if (!choice.includes("=") || !choice.includes("×")) return false;
        const [left, right] = choice.split("=");
        const factors = digitsOf(left).sort((l, r) => l - r);
        const samePair = factors.join(",") === [shown.a, shown.b].sort((l, r) => l - r).join(",");
        return samePair && evaluateExpression(left) === Number(right);
      }).length;
      expect(correctCount).toBe(1);
    }
  });

  it("keys the sorted factor pair and the task, and nothing else", () => {
    for (const problem of problems) {
      const shown = shownCommutativeEquation(problem);
      const [low, high] = [shown.a, shown.b].sort((l, r) => l - r);
      const task = isNumeric(problem.correctAnswer) ? "turnaround-product" : "equivalent-equation";
      expect(problem.problemKey).toBe(
        `multiplication:property:commutative:a=${low}:b=${high}:representation=equation:task=${task}`,
      );
    }
  });

  it("fulfils the requested count with unique problem keys", () => {
    for (const count of [6, 8, 12]) {
      const generated = generateCommutativeMultiplicationProblems({ seed: COMMUTATIVE_SEED, count });
      expect(generated).toHaveLength(count);
      expect(new Set(generated.map((problem) => problem.problemKey)).size).toBe(count);
      expect(new Set(generated.map((problem) => problem.id)).size).toBe(count);
    }
    expect(generateCommutativeMultiplicationProblems({ mode: "independent" })).toHaveLength(12);
    expect(generateCommutativeMultiplicationProblems({ mode: "challenge" })).toHaveLength(10);
  });

  it("is deterministic for one seed and varies across seeds", () => {
    const again = generateCommutativeMultiplicationProblems({ seed: COMMUTATIVE_SEED, count: 12 });
    expect(again).toEqual(problems);

    const other = generateCommutativeMultiplicationProblems({ seed: "another-seed", count: 12 });
    const first = problems.map((problem) => problem.problemKey);
    const second = other.map((problem) => problem.problemKey);
    expect(second).not.toEqual(first);
    expect(second.filter((key) => !first.includes(key)).length).toBeGreaterThanOrEqual(3);
  });

  it("exercises both factor orders and both tasks across seeds", () => {
    const keys = new Set<string>();
    const orders = new Set<string>();
    for (let seed = 0; seed < 8; seed += 1) {
      for (const problem of generateCommutativeMultiplicationProblems({ seed: `seed-${seed}`, count: 12 })) {
        keys.add(problem.problemKey);
        const shown = shownCommutativeEquation(problem);
        orders.add(shown.a < shown.b ? "ascending" : "descending");
      }
    }
    expect(orders).toEqual(new Set(["ascending", "descending"]));
    expect([...keys].some((key) => key.endsWith("task=equivalent-equation"))).toBe(true);
    expect([...keys].some((key) => key.endsWith("task=turnaround-product"))).toBe(true);
    expect(keys.size).toBeGreaterThan(20);
  });
});

describe("associative_multiplication practice", () => {
  const problems = generateAssociativeMultiplicationProblems({ seed: ASSOCIATIVE_SEED, count: 12 });

  it("keeps the three factors in the same order under both groupings", () => {
    for (const problem of problems) {
      const groupings = [
        ...groupingsIn(problem.questionText),
        ...groupingsIn(problem.correctAnswer),
      ];
      expect(groupings.length).toBeGreaterThanOrEqual(2);
      const triples = groupings.map((grouping) => digitsOf(grouping).join(","));
      expect(new Set(triples).size).toBe(1);

      const [a, b, c] = digitsOf(groupings[0]);
      expect(evaluateExpression(`(${a} × ${b}) × ${c}`)).toBe(a * b * c);
      expect(evaluateExpression(`${a} × (${b} × ${c})`)).toBe(a * b * c);
      expect(evaluateExpression(`(${a} × ${b}) × ${c}`)).toBe(
        evaluateExpression(`${a} × (${b} × ${c})`),
      );
      // Both groupings, never only one, are put in front of the learner.
      expect(new Set(groupings).size).toBe(2);
    }
  });

  it("stays inside the Grade 3 range the lesson demonstrates", () => {
    for (const problem of problems) {
      const [a, b, c] = digitsOf(groupingsIn(problem.questionText)[0]);
      for (const factor of [a, b, c]) {
        expect(factor).toBeGreaterThanOrEqual(2);
        expect(factor).toBeLessThanOrEqual(6);
      }
      expect(a * b * c).toBeLessThanOrEqual(60);
    }
  });

  it("assesses regrouping rather than plain product computation", () => {
    const tasks = new Set<string>();
    for (const problem of problems) {
      const [a, b, c] = digitsOf(groupingsIn(problem.questionText)[0]);
      const product = a * b * c;
      if (isNumeric(problem.correctAnswer)) {
        tasks.add("equal-product");
        // The stem supplies the other grouping's value, so the learner must know
        // the product is unchanged; the intermediates are offered as traps.
        const worked = problem.questionText.split(".")[0];
        const values = worked.split("=").map((part) => evaluateExpression(part));
        expect(new Set(values).size).toBe(1);
        expect(values[0]).toBe(product);
        expect(Number(problem.correctAnswer)).toBe(product);
        const choices = choicesOf(problem).map(Number);
        expect(choices.some((choice) => choice === a * b || choice === b * c)).toBe(true);
      } else {
        tasks.add("regroup-equivalent");
        // The answer is an expression, so it cannot be reached by multiplying alone.
        expect(problem.correctAnswer).toMatch(/[()]/);
        expect(groupingsIn(problem.correctAnswer)).toHaveLength(1);
        expect(problem.correctAnswer).not.toBe(groupingsIn(problem.questionText)[0]);
      }
    }
    expect(tasks.size).toBe(2);
  });

  it("offers exactly one correct choice and no accidentally equivalent distractor", () => {
    for (const problem of problems) {
      const [a, b, c] = digitsOf(groupingsIn(problem.questionText)[0]);
      const product = a * b * c;
      const choices = choicesOf(problem);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain(problem.correctAnswer);

      const correctCount = choices.filter((choice) => evaluateExpression(choice) === product).length;
      expect(correctCount).toBe(1);

      if (!isNumeric(problem.correctAnswer)) {
        for (const choice of choices) {
          if (choice === problem.correctAnswer) continue;
          const sameOrderedFactors = digitsOf(choice).join(",") === [a, b, c].join(",");
          const multiplicationOnly = !choice.includes("+");
          // A distractor may never be the same ordered factors joined only by ×.
          expect(sameOrderedFactors && multiplicationOnly).toBe(false);
        }
      }
    }
  });

  it("keys the ordered triple and the task, and nothing else", () => {
    for (const problem of problems) {
      const [a, b, c] = digitsOf(groupingsIn(problem.questionText)[0]);
      const task = isNumeric(problem.correctAnswer) ? "equal-product" : "regroup-equivalent";
      expect(problem.problemKey).toBe(
        `multiplication:property:associative:a=${a}:b=${b}:c=${c}:task=${task}`,
      );
    }
  });

  it("fulfils the requested count with unique problem keys", () => {
    for (const count of [6, 8, 12]) {
      const generated = generateAssociativeMultiplicationProblems({ seed: ASSOCIATIVE_SEED, count });
      expect(generated).toHaveLength(count);
      expect(new Set(generated.map((problem) => problem.problemKey)).size).toBe(count);
      expect(new Set(generated.map((problem) => problem.id)).size).toBe(count);
    }
    expect(generateAssociativeMultiplicationProblems({ mode: "independent" })).toHaveLength(12);
    expect(generateAssociativeMultiplicationProblems({ mode: "challenge" })).toHaveLength(10);
  });

  it("is deterministic for one seed and varies across seeds", () => {
    const again = generateAssociativeMultiplicationProblems({ seed: ASSOCIATIVE_SEED, count: 12 });
    expect(again).toEqual(problems);

    const other = generateAssociativeMultiplicationProblems({ seed: "another-seed", count: 12 });
    const first = problems.map((problem) => problem.problemKey);
    const second = other.map((problem) => problem.problemKey);
    expect(second).not.toEqual(first);
    expect(second.filter((key) => !first.includes(key)).length).toBeGreaterThanOrEqual(3);
  });

  it("shows both grouping directions across seeds without keying them", () => {
    const shown = new Set<string>();
    for (let seed = 0; seed < 8; seed += 1) {
      for (const problem of generateAssociativeMultiplicationProblems({ seed: `seed-${seed}`, count: 12 })) {
        shown.add(groupingsIn(problem.questionText)[0].startsWith("(") ? "left" : "right");
        expect(problem.problemKey).not.toContain("grouping");
      }
    }
    expect(shown).toEqual(new Set(["left", "right"]));
  });
});

describe("seed convention", () => {
  const cases = [
    ["commutative_multiplication", generateCommutativeMultiplicationProblems],
    ["associative_multiplication", generateAssociativeMultiplicationProblems],
  ] as const;

  it("prefers an explicit seed over the lesson id", () => {
    for (const [, generate] of cases) {
      const withLesson = generate({ seed: "explicit", lesson: { lesson_id: "g3-u12-w1-l3" }, count: 8 });
      const otherLesson = generate({ seed: "explicit", lesson: { lesson_id: "g3-u99-w9-l9" }, count: 8 });
      expect(withLesson).toEqual(otherLesson);
    }
  });

  it("falls back to the lesson id, then to the practice type", () => {
    for (const [practiceType, generate] of cases) {
      const lessonId = "g3-u12-w1-l3";
      expect(generate({ lesson: { lesson_id: lessonId }, count: 8 })).toEqual(
        generate({ seed: createPracticeSessionSeed(lessonId, practiceType, "guided"), count: 8 }),
      );
      expect(generate({ count: 8 })).toEqual(
        generate({
          seed: createPracticeSessionSeed(practiceType, practiceType, "guided"),
          count: 8,
        }),
      );
      expect(generate({ mode: "challenge", count: 8 })).toEqual(
        generate({
          mode: "challenge",
          seed: createPracticeSessionSeed(practiceType, practiceType, "challenge"),
          count: 8,
        }),
      );
    }
  });

  it("keeps rng and presentation state out of every canonical key", () => {
    for (const [, generate] of cases) {
      for (const problem of generate({ seed: "key-shape", count: 12 })) {
        expect(problem.problemKey).toMatch(
          /^multiplication:property:(commutative:a=\d+:b=\d+:representation=equation|associative:a=\d+:b=\d+:c=\d+):task=[a-z-]+$/,
        );
        expect(problem.problemKey).not.toContain("seed");
        expect(problem.problemKey).not.toContain("guided");
      }
    }
  });
});
