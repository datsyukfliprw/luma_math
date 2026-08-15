import { describe, expect, it } from "vitest";
import "../data/curriculum";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import { createPracticeSessionSeed } from "./random";
import { generateMultiplicationStrategyProblems } from "./multiplicationStrategy";
import type { PracticeProblem } from "./types";

type Equation = {
  left: number;
  operator: "×" | "+" | "-";
  right: number;
  result: number;
};

type StrategyChoice = {
  label: string;
  equations: Equation[];
};

const STRATEGY_IDS_BY_LABEL = {
  "Double and add one group": "double-plus-one",
  "Double twice": "double-twice",
  "Use five groups and one more": "five-plus-one",
  "Use five groups and two more": "five-plus-two",
  "Double three times": "double-three-times",
  "Use ten groups minus one": "ten-minus-one",
} as const;

function findLesson() {
  const unit = getCurriculum(3, 17);
  for (const week of unit?.weeks ?? []) {
    for (const lesson of week.lessons) {
      if (lesson.practice_type === "choose_strategy") return lesson;
    }
  }
  throw new Error("Could not find choose_strategy curriculum lesson");
}

function parseTarget(problem: PracticeProblem): { factorA: number; factorB: number; product: number } {
  const match = problem.questionText.match(/^Which shown strategy correctly solves (\d+) × (\d+)\?$/);
  if (!match) throw new Error(`Could not parse strategy prompt: ${problem.questionText}`);

  const factorA = Number(match[1]);
  const factorB = Number(match[2]);
  return { factorA, factorB, product: factorA * factorB };
}

function parseChoice(choice: string): StrategyChoice {
  const separator = choice.indexOf(": ");
  if (separator < 0) throw new Error(`Could not parse strategy label: ${choice}`);

  const label = choice.slice(0, separator);
  const equations = [...choice.matchAll(/(\d+) (×|\+|-) (\d+) = (\d+)/g)].map((match) => ({
    left: Number(match[1]),
    operator: match[2] as Equation["operator"],
    right: Number(match[3]),
    result: Number(match[4]),
  }));
  if (equations.length === 0) throw new Error(`Could not parse strategy equations: ${choice}`);

  return { label, equations };
}

function isEquationTrue(equation: Equation): boolean {
  switch (equation.operator) {
    case "×":
      return equation.left * equation.right === equation.result;
    case "+":
      return equation.left + equation.right === equation.result;
    case "-":
      return equation.left - equation.right === equation.result;
  }
}

function solvesTarget(choice: StrategyChoice, target: ReturnType<typeof parseTarget>): boolean {
  const finalEquation = choice.equations.at(-1);
  return (
    finalEquation !== undefined &&
    choice.equations.every(isEquationTrue) &&
    finalEquation.left === target.factorA &&
    finalEquation.operator === "×" &&
    finalEquation.right === target.factorB &&
    finalEquation.result === target.product
  );
}

describe("choose_strategy Practice family", () => {
  it("shows exactly one mathematically valid strategy that solves each visible multiplication fact", () => {
    const problems = generateMultiplicationStrategyProblems({ seed: "semantic", count: 48 });

    expect(problems).toHaveLength(48);
    for (const problem of problems) {
      const target = parseTarget(problem);
      const choices = problem.visualData?.choices ?? [];
      const parsedChoices = choices.map(parseChoice);
      const validChoices = parsedChoices.filter((choice) => solvesTarget(choice, target));

      expect(problem.visualType).toBe("multiple_choice");
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(validChoices).toHaveLength(1);
      expect(problem.correctAnswer).toBe(choices[parsedChoices.indexOf(validChoices[0])]);
      expect(problem.answerData).toEqual({
        factorA: String(target.factorA),
        factorB: String(target.factorB),
        product: String(target.product),
      });
      expect(problem.visualData?.equation).toBe(`${target.factorA} × ${target.factorB}`);

      const distractors = parsedChoices.filter((choice) => !solvesTarget(choice, target));
      expect(distractors.some((choice) => choice.equations.every(isEquationTrue))).toBe(true);
      expect(
        distractors.some((choice) => {
          const finalEquation = choice.equations.at(-1);
          return finalEquation !== undefined && isEquationTrue(finalEquation) && !choice.equations.every(isEquationTrue);
        }),
      ).toBe(true);
      expect(
        distractors.some((choice) => {
          const finalEquation = choice.equations.at(-1);
          return (
            finalEquation !== undefined &&
            choice.equations.slice(0, -1).every(isEquationTrue) &&
            finalEquation.left === target.factorA &&
            finalEquation.right === target.factorB &&
            !isEquationTrue(finalEquation)
          );
        }),
      ).toBe(true);
    }
  });

  it("uses the learner-visible fact and selected strategy label in each canonical key", () => {
    const problems = generateMultiplicationStrategyProblems({ seed: "keys", count: 48 });

    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(48);
    for (const problem of problems) {
      const target = parseTarget(problem);
      const selectedChoice = parseChoice(problem.correctAnswer);
      const strategyId = STRATEGY_IDS_BY_LABEL[selectedChoice.label as keyof typeof STRATEGY_IDS_BY_LABEL];

      expect(strategyId).toBeDefined();
      expect(problem.problemKey).toBe(
        `multiplication:strategy:a=${target.factorA}:b=${target.factorB}:strategy=${strategyId}:task=validate-and-solve`,
      );
      expect(problem.problemKey).not.toContain("seed");
      expect(problem.problemKey).not.toContain("guided");
    }
  });

  it("fulfills the six-question curriculum block without duplicate mathematical tasks", () => {
    const lesson = findLesson();
    expect(lesson.practice_block?.question_count).toBe(6);

    for (const mode of ["guided", "independent", "challenge"] as const) {
      const problems = generateMultiplicationStrategyProblems({ lesson, mode });
      expect(problems).toHaveLength(6);
      expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(6);
    }
  });

  it("replays exactly for one seed and varies learner-visible facts or strategies across seeds", () => {
    const first = generateMultiplicationStrategyProblems({ seed: "same", count: 6 });
    const second = generateMultiplicationStrategyProblems({ seed: "same", count: 6 });
    const different = generateMultiplicationStrategyProblems({ seed: "different", count: 6 });

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(different.map((problem) => problem.problemKey)).not.toEqual(
      first.map((problem) => problem.problemKey),
    );
  });

  it("uses the curriculum lesson identity for its deterministic fallback seed", () => {
    const lesson = findLesson();
    const lessonId = lesson.lesson_id;
    if (!lessonId) throw new Error("choose_strategy curriculum lesson has no lesson_id");

    const fallback = generateMultiplicationStrategyProblems({ lesson, mode: "guided" });
    const explicitFallback = generateMultiplicationStrategyProblems({
      seed: createPracticeSessionSeed(lessonId, "choose_strategy", "guided"),
      mode: "guided",
      count: 6,
    });

    expect(fallback).toEqual(explicitFallback);
  });

  it("rejects counts that would repeat a canonical strategy task", () => {
    expect(() => generateMultiplicationStrategyProblems({ count: 49 })).toThrow(
      "Requested count exceeds multiplication strategy state space",
    );
  });
});
