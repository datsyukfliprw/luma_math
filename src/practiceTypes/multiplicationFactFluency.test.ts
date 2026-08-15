import { describe, expect, it } from "vitest";
import "../data/curriculum";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import { createPracticeSessionSeed } from "./random";
import {
  FIXED_FACTOR_FACT_PRACTICE_TYPES,
  generateFixedFactorFactFluencyProblems,
  type FixedFactorFactPracticeType,
} from "./multiplicationFactFluency";
import type { PracticeProblem } from "./types";

const PRACTICE_TYPES: FixedFactorFactPracticeType[] = [...FIXED_FACTOR_FACT_PRACTICE_TYPES];
const MODES = ["guided", "independent", "challenge"] as const;

function findLesson(practiceType: FixedFactorFactPracticeType) {
  for (const unitNumber of [12, 15, 16]) {
    const unit = getCurriculum(3, unitNumber);
    for (const week of unit?.weeks ?? []) {
      for (const lesson of week.lessons) {
        if (lesson.practice_type === practiceType) return lesson;
      }
    }
  }
  throw new Error(`Could not find curriculum lesson for ${practiceType}`);
}

function parseEquation(problem: PracticeProblem): { factorA: number; factorB: number; product: number } {
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

describe("fixed-factor multiplication fact fluency Practice adapter", () => {
  it.each(PRACTICE_TYPES)("generates the learner-visible fact for %s", (practiceType) => {
    const problems = generateFixedFactorFactFluencyProblems(practiceType, { seed: "semantic", count: 8 });
    const fixedFactor = Number(practiceType.replace("multiply_by_", ""));

    expect(problems).toHaveLength(8);
    for (const problem of problems) {
      const { factorA, factorB, product } = parseEquation(problem);
      expect([factorA, factorB]).toContain(fixedFactor);
      expect(factorA).toBeGreaterThanOrEqual(2);
      expect(factorB).toBeLessThanOrEqual(9);
      expect(factorA * factorB).toBe(product);
      expect(problem.answerData).toEqual({
        factorA: String(factorA),
        factorB: String(factorB),
        product: String(product),
      });
      expect(problem.questionText).toContain(`${factorA} × ${factorB} = ?`);
      expectValidChoices(problem, product);
      expect(problem.problemKey).toBe(
        `multiplication:fact:a=${Math.min(factorA, factorB)}:b=${Math.max(factorA, factorB)}`,
      );
    }
  });

  it.each(PRACTICE_TYPES)("fulfills the six-question curriculum block in every Practice mode for %s", (practiceType) => {
    const lesson = findLesson(practiceType);
    expect(lesson.practice_block?.question_count).toBe(6);

    for (const mode of MODES) {
      const problems = generateFixedFactorFactFluencyProblems(practiceType, { lesson, mode });
      expect(problems).toHaveLength(6);
      expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(6);
    }
  });

  it("gives an explicit count precedence over the curriculum practice block", () => {
    const lesson = findLesson("multiply_by_3");
    expect(generateFixedFactorFactFluencyProblems("multiply_by_3", { lesson, count: 5 })).toHaveLength(5);
  });

  it.each(PRACTICE_TYPES)("keeps square facts valid for %s", (practiceType) => {
    const square = generateFixedFactorFactFluencyProblems(practiceType, { seed: "squares", count: 8 }).find(
      (problem) => {
        const { factorA, factorB } = parseEquation(problem);
        return factorA === factorB;
      },
    );

    expect(square).toBeDefined();
    const { factorA, factorB, product } = parseEquation(square!);
    expect(factorA * factorB).toBe(product);
  });

  it("does not treat factor-order presentation as a second canonical fact", () => {
    const problems = generateFixedFactorFactFluencyProblems("multiply_by_6", { seed: "all-facts", count: 8 });
    const identities = problems.map((problem) => {
      const { factorA, factorB, product } = parseEquation(problem);
      return `${Math.min(factorA, factorB)}×${Math.max(factorA, factorB)}=${product}`;
    });

    expect(new Set(identities).size).toBe(8);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(8);
    expect(problems.some((problem) => parseEquation(problem).factorA > parseEquation(problem).factorB)).toBe(true);
  });

  it("is deterministic for one seed and varies meaningfully across seeds", () => {
    const first = generateFixedFactorFactFluencyProblems("multiply_by_7", { seed: "same", count: 6 });
    const second = generateFixedFactorFactFluencyProblems("multiply_by_7", { seed: "same", count: 6 });
    const different = generateFixedFactorFactFluencyProblems("multiply_by_7", { seed: "different", count: 6 });

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(different.map((problem) => problem.problemKey)).not.toEqual(
      first.map((problem) => problem.problemKey),
    );
  });

  it("gives an explicit seed precedence over lesson and mode-derived seeds", () => {
    const first = generateFixedFactorFactFluencyProblems("multiply_by_8", {
      seed: "explicit",
      mode: "guided",
      lesson: { lesson_id: "lesson-one" },
      count: 6,
    });
    const second = generateFixedFactorFactFluencyProblems("multiply_by_8", {
      seed: "explicit",
      mode: "challenge",
      lesson: { lesson_id: "lesson-two" },
      count: 6,
    });

    expect(stripIds(first)).toEqual(stripIds(second));
  });

  it.each(PRACTICE_TYPES)("uses lesson_id as its fallback seed for %s", (practiceType) => {
    const lesson = findLesson(practiceType);
    const lessonId = lesson.lesson_id;
    if (!lessonId) throw new Error(`Curriculum lesson for ${practiceType} has no lesson_id`);

    const fallback = generateFixedFactorFactFluencyProblems(practiceType, { lesson, mode: "guided" });
    const explicitFallback = generateFixedFactorFactFluencyProblems(practiceType, {
      seed: createPracticeSessionSeed(lessonId, practiceType, "guided"),
      mode: "guided",
      count: 6,
    });

    expect(fallback).toEqual(explicitFallback);
  });

  it.each(PRACTICE_TYPES)("uses the practice type as its fallback seed when no lesson is supplied for %s", (practiceType) => {
    const fallback = generateFixedFactorFactFluencyProblems(practiceType, { mode: "guided", count: 6 });
    const explicitFallback = generateFixedFactorFactFluencyProblems(practiceType, {
      seed: createPracticeSessionSeed(practiceType, practiceType, "guided"),
      mode: "guided",
      count: 6,
    });

    expect(fallback).toEqual(explicitFallback);
  });

  it("rejects a request that cannot be fulfilled without repeating a canonical fact", () => {
    expect(() => generateFixedFactorFactFluencyProblems("multiply_by_9", { count: 9 })).toThrow(
      "Requested count exceeds fixed-factor fact state space",
    );
  });
});
