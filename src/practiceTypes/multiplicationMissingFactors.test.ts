import { describe, expect, it } from "vitest";
import { unknownFactorProblemKey } from "../lib/multiplication/unknownFactors";
import { createPracticeSessionSeed } from "./random";
import { generateMissingFactorsProblems } from "./multiplicationMissingFactors";

type ParsedEquation = {
  left: number | "?";
  right: number | "?";
  product: number;
};

function parseEquation(problem: ReturnType<typeof generateMissingFactorsProblems>[number]): ParsedEquation {
  const equation = problem.visualData?.equation;
  const match = equation?.match(/^(\?|\d+) × (\?|\d+) = (\d+)$/);
  if (!match) throw new Error(`Could not parse missing-factor equation: ${equation}`);

  return {
    left: match[1] === "?" ? "?" : Number(match[1]),
    right: match[2] === "?" ? "?" : Number(match[2]),
    product: Number(match[3]),
  };
}

function stripIds(problems: ReturnType<typeof generateMissingFactorsProblems>) {
  return problems.map((problem) =>
    Object.fromEntries(Object.entries(problem).filter(([key]) => key !== "id")),
  );
}

describe("missing_factors Practice adapter", () => {
  it("exposes equations whose missing factor and answer data agree independently", () => {
    const problems = generateMissingFactorsProblems({ seed: "semantic", count: 24 });

    for (const problem of problems) {
      const { left, right, product } = parseEquation(problem);
      const missing = left === "?" ? product / Number(right) : product / Number(left);
      const factorA = left === "?" ? missing : Number(left);
      const factorB = right === "?" ? missing : Number(right);

      expect(Number.isInteger(missing)).toBe(true);
      expect(factorA * factorB).toBe(product);
      expect(problem.correctAnswer).toBe(String(missing));
      expect(problem.answerData).toEqual({
        factorA: String(factorA),
        factorB: String(factorB),
        product: String(product),
      });
      expect(problem.questionText).toContain(problem.visualData?.equation ?? "");
    }
  });

  it("offers four unique choices with exactly one mathematically correct answer", () => {
    const problems = generateMissingFactorsProblems({ seed: "choices", count: 32 });

    for (const problem of problems) {
      const { left, right, product } = parseEquation(problem);
      const missing = left === "?" ? product / Number(right) : product / Number(left);
      const choices = problem.visualData?.choices ?? [];

      expect(problem.visualType).toBe("multiple_choice");
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices.filter((choice) => Number(choice) === missing)).toHaveLength(1);
      expect(choices.every((choice) => Number(choice) >= 2 && Number(choice) <= 9)).toBe(true);
      expect(Number(problem.correctAnswer)).toBe(missing);
      expect((left === "?" ? missing : Number(left)) * (right === "?" ? missing : Number(right))).toBe(
        product,
      );
    }
  });

  it("fulfills requested counts, keeps keys unique, and supports both blank positions", () => {
    const problems = generateMissingFactorsProblems({ seed: "session", count: 64 });
    const positions = problems.map((problem) => parseEquation(problem));

    expect(problems).toHaveLength(64);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(64);
    expect(positions.some(({ left }) => left === "?")).toBe(true);
    expect(positions.some(({ right }) => right === "?")).toBe(true);

    for (const problem of problems) {
      const { left, right, product } = parseEquation(problem);
      const factorA = left === "?" ? Number(problem.correctAnswer) : Number(left);
      const factorB = right === "?" ? Number(problem.correctAnswer) : Number(right);
      const unknownPosition = left === "?" ? "left" : "right";
      const knownFactor = unknownPosition === "left" ? factorB : factorA;
      const missingFactor = unknownPosition === "left" ? factorA : factorB;
      expect(problem.problemKey).toBe(
        unknownFactorProblemKey({ knownFactor, missingFactor, product }),
      );
    }
  });

  it("is deterministic for the same seed and varies across different seeds", () => {
    const first = generateMissingFactorsProblems({ seed: "same", count: 12 });
    const second = generateMissingFactorsProblems({ seed: "same", count: 12 });
    const different = generateMissingFactorsProblems({ seed: "different", count: 12 });

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(new Set(different.map((problem) => problem.problemKey)).size).toBeGreaterThan(1);
  });

  it("gives an explicit seed precedence over lesson and mode-derived seeds", () => {
    const first = generateMissingFactorsProblems({
      seed: "explicit",
      mode: "guided",
      lesson: { lesson_id: "lesson-one" },
      count: 8,
    });
    const second = generateMissingFactorsProblems({
      seed: "explicit",
      mode: "guided",
      lesson: { lesson_id: "lesson-two" },
      count: 8,
    });

    expect(stripIds(first)).toEqual(stripIds(second));
  });

  it("uses lesson_id as the fallback seed identity", () => {
    const lessonId = "g3-u17-w1-l2";
    const fallback = generateMissingFactorsProblems({
      mode: "independent",
      lesson: { lesson_id: lessonId },
      count: 8,
    });
    const explicitFallback = generateMissingFactorsProblems({
      mode: "independent",
      seed: createPracticeSessionSeed(lessonId, "missing_factors", "independent"),
      count: 8,
    });

    expect(fallback).toEqual(explicitFallback);
  });

  it("uses practiceType as the fallback lesson identity when lesson_id is absent", () => {
    const fallback = generateMissingFactorsProblems({ mode: "challenge", count: 8 });
    const explicitFallback = generateMissingFactorsProblems({
      mode: "challenge",
      seed: createPracticeSessionSeed("missing_factors", "missing_factors", "challenge"),
      count: 8,
    });

    expect(fallback).toEqual(explicitFallback);
  });
});
