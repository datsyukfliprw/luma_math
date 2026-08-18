import { describe, expect, it } from "vitest";
import "../data/curriculum";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import { createPracticeSessionSeed } from "./random";
import { generateMixedMultiplicationFactsProblems } from "./mixedMultiplicationFacts";
import { mixedFactProblemKey } from "../lib/multiplication/mixedFacts";
import type { Lesson } from "../data/curriculum";
import type { PracticeProblem } from "./types";

const MODES = ["guided", "independent", "challenge"] as const;

function findLesson(): Lesson {
  const unit = getCurriculum(3, 17);
  if (!unit) throw new Error("Could not load Grade 3 Unit 17 curriculum");

  for (const week of unit.weeks) {
    for (const lesson of week.lessons) {
      if (lesson.practice_type === "mixed_multiplication_facts") {
        return lesson as Lesson;
      }
    }
  }

  throw new Error("Could not find mixed_multiplication_facts lesson");
}

function parseEquation(problem: PracticeProblem): {
  factorA: number;
  factorB: number;
  product: number;
} {
  const equation = problem.visualData?.equation ?? "";
  const match = equation.match(/^(\d+) × (\d+) = \?$/);
  if (!match) throw new Error(`Could not parse equation: ${equation}`);

  return {
    factorA: Number(match[1]),
    factorB: Number(match[2]),
    product: Number(problem.correctAnswer),
  };
}

function stripIds(problems: PracticeProblem[]): PracticeProblem[] {
  return problems.map((problem) => ({ ...problem, id: "" }));
}

function expectValidChoices(problem: PracticeProblem, product: number): void {
  const choices = problem.visualData?.choices ?? [];

  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.filter((choice) => Number(choice) === product)).toHaveLength(1);
  expect(problem.correctAnswer).toBe(String(product));
}

describe("mixed multiplication facts Practice adapter", () => {
  it("generates facts within 0-9 whose products match the correct answer", () => {
    const problems = generateMixedMultiplicationFactsProblems({
      seed: "semantic",
      count: 10,
    });

    expect(problems).toHaveLength(10);

    for (const problem of problems) {
      const { factorA, factorB, product } = parseEquation(problem);

      expect(factorA).toBeGreaterThanOrEqual(0);
      expect(factorA).toBeLessThanOrEqual(9);
      expect(factorB).toBeGreaterThanOrEqual(0);
      expect(factorB).toBeLessThanOrEqual(9);
      expect(factorA * factorB).toBe(product);
      expect(problem.questionText).toContain(`${factorA} × ${factorB}?`);
      expect(problem.answerData).toEqual({
        factorA: String(factorA),
        factorB: String(factorB),
        product: String(product),
      });
      expectValidChoices(problem, product);
    }
  });

  it("deliberately includes a 0-factor fact and a 1-factor fact when count >= 2", () => {
    for (let count = 2; count <= 12; count += 1) {
      const problems = generateMixedMultiplicationFactsProblems({
        seed: `zero-one-${count}`,
        count,
      });

      const hasZero = problems.some((problem) => {
        const { factorA, factorB } = parseEquation(problem);
        return factorA === 0 || factorB === 0;
      });
      const hasOne = problems.some((problem) => {
        const { factorA, factorB } = parseEquation(problem);
        return factorA === 1 || factorB === 1;
      });

      expect(hasZero).toBe(true);
      expect(hasOne).toBe(true);
    }
  });

  it("fills the remaining slots with 2-9 facts for typical session counts", () => {
    for (let count = 2; count <= 12; count += 1) {
      const problems = generateMixedMultiplicationFactsProblems({
        seed: `two-nine-${count}`,
        count,
      });

      const nonZeroOne = problems.filter((problem) => {
        const { factorA, factorB } = parseEquation(problem);
        return factorA !== 0 && factorB !== 0 && factorA !== 1 && factorB !== 1;
      });

      for (const problem of nonZeroOne) {
        const { factorA, factorB } = parseEquation(problem);
        expect(factorA).toBeGreaterThanOrEqual(2);
        expect(factorB).toBeGreaterThanOrEqual(2);
      }

      expect(problems).toHaveLength(count);
    }
  });

  it("covers 0 and 1 factors across a sample of count-1 sessions", () => {
    const seenZero = new Set<number>();
    const seenOne = new Set<number>();

    for (let i = 0; i < 200; i += 1) {
      const problems = generateMixedMultiplicationFactsProblems({
        seed: `count-one-${i}`,
        count: 1,
      });

      const { factorA, factorB } = parseEquation(problems[0]);
      if (factorA === 0 || factorB === 0) seenZero.add(factorA + factorB);
      if (factorA === 1 || factorB === 1) seenOne.add(factorA + factorB);
    }

    expect(seenZero.size).toBeGreaterThan(0);
    expect(seenOne.size).toBeGreaterThan(0);
  });

  it("keeps problem keys sorted, unique, and free of seed or mode", () => {
    const problems = generateMixedMultiplicationFactsProblems({
      seed: "keys",
      count: 20,
    });
    const keys = problems.map((problem) => problem.problemKey);

    expect(new Set(keys).size).toBe(keys.length);

    for (const problem of problems) {
      const { factorA, factorB } = parseEquation(problem);
      const expectedKey = `multiplication:fact:a=${Math.min(factorA, factorB)}:b=${Math.max(factorA, factorB)}`;

      expect(problem.problemKey).toBe(expectedKey);
      expect(problem.problemKey).toBe(
        mixedFactProblemKey({
          factorA: Math.min(factorA, factorB),
          factorB: Math.max(factorA, factorB),
          product: factorA * factorB,
          fact: {
            factorA: Math.min(factorA, factorB),
            factorB: Math.max(factorA, factorB),
            product: factorA * factorB,
          },
        }),
      );
      expect(problem.problemKey).not.toContain("seed");
      expect(problem.problemKey).not.toContain("mixed");
      expect(problem.problemKey).not.toContain("guided");
    }
  });

  it("does not treat displayed factor order as a second canonical fact", () => {
    const problems = generateMixedMultiplicationFactsProblems({
      seed: "order",
      count: 12,
    });
    const identities = problems.map((problem) => {
      const { factorA, factorB, product } = parseEquation(problem);
      return `${Math.min(factorA, factorB)}×${Math.max(factorA, factorB)}=${product}`;
    });

    expect(new Set(identities).size).toBe(problems.length);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(problems.length);
    expect(
      problems.some((problem) => parseEquation(problem).factorA > parseEquation(problem).factorB),
    ).toBe(true);
  });

  it("is deterministic for the same seed and varies across different seeds", () => {
    const first = generateMixedMultiplicationFactsProblems({
      seed: "same",
      count: 8,
    });
    const second = generateMixedMultiplicationFactsProblems({
      seed: "same",
      count: 8,
    });
    const different = generateMixedMultiplicationFactsProblems({
      seed: "different",
      count: 8,
    });

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(new Set(different.map((problem) => problem.problemKey)).size).toBeGreaterThan(1);
  });

  it("gives explicit seed precedence over lesson and mode-derived seeds", () => {
    const first = generateMixedMultiplicationFactsProblems({
      seed: "explicit",
      mode: "guided",
      lesson: { lesson_id: "lesson-one" },
      count: 8,
    });
    const second = generateMixedMultiplicationFactsProblems({
      seed: "explicit",
      mode: "challenge",
      lesson: { lesson_id: "lesson-two" },
      count: 8,
    });

    expect(stripIds(first)).toEqual(stripIds(second));
  });

  it("uses lesson_id as its fallback seed identity", () => {
    const lesson = findLesson();
    const lessonId = lesson.lesson_id;
    if (!lessonId) throw new Error("mixed_multiplication_facts lesson has no lesson_id");

    const fallback = generateMixedMultiplicationFactsProblems({
      lesson,
      mode: "guided",
    });
    const explicitFallback = generateMixedMultiplicationFactsProblems({
      seed: createPracticeSessionSeed(lessonId, "mixed_multiplication_facts", "guided"),
      mode: "guided",
      count: 6,
    });

    expect(fallback).toEqual(explicitFallback);
  });

  it("uses the practice type as its fallback lesson identity when no lesson is supplied", () => {
    const fallback = generateMixedMultiplicationFactsProblems({
      mode: "guided",
      count: 6,
    });
    const explicitFallback = generateMixedMultiplicationFactsProblems({
      seed: createPracticeSessionSeed(
        "mixed_multiplication_facts",
        "mixed_multiplication_facts",
        "guided",
      ),
      mode: "guided",
      count: 6,
    });

    expect(fallback).toEqual(explicitFallback);
  });

  it("fulfills the curriculum practice block count in every Practice mode", () => {
    const lesson = findLesson();
    expect(lesson.practice_block?.question_count).toBe(6);

    for (const mode of MODES) {
      const problems = generateMixedMultiplicationFactsProblems({ lesson, mode });
      expect(problems).toHaveLength(6);
      expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(6);
    }
  });

  it("gives an explicit count precedence over the curriculum practice block", () => {
    const lesson = findLesson();
    const problems = generateMixedMultiplicationFactsProblems({
      lesson,
      count: 5,
    });

    expect(problems).toHaveLength(5);
  });

  it("rejects a request that cannot be fulfilled without repeating a canonical fact", () => {
    expect(() => generateMixedMultiplicationFactsProblems({ count: 56 })).toThrow(RangeError);

    expect(() => generateMixedMultiplicationFactsProblems({ count: -1 })).toThrow(RangeError);
  });
});
