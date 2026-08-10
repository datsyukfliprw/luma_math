import { describe, expect, it } from "vitest";
import {
  NUMBER_WORD_RANGES,
  createNumberWordProblem,
  formatNumberWords,
  type NumberWordDirection,
  type NumberWordPracticeType,
} from "../lib/placeValue/numberForms";
import type { PracticeProblem } from "./types";
import { generateNumberWordsProblems } from "./numberWords";

const PRACTICE_TYPES: NumberWordPracticeType[] = ["number_words", "reading_large_numbers"];

function sourceFromKey(problemKey: string): number {
  const match = problemKey.match(/^number_words:(\d+):(number_to_words|words_to_number)$/);
  expect(match).not.toBeNull();
  return Number(match?.[1]);
}

function directionFromKey(problemKey: string): NumberWordDirection {
  const match = problemKey.match(/^number_words:\d+:(number_to_words|words_to_number)$/);
  expect(match).not.toBeNull();
  return match?.[1] as NumberWordDirection;
}

function plausibleWrongNumber(source: number, candidate: number): boolean {
  if (candidate === source || candidate < 0 || candidate > 100_000) return false;
  if ([1, 10, 100, 1_000, 10_000].some((offset) => Math.abs(candidate - source) === offset)) {
    return true;
  }

  const sourceDigits = String(source).split("").sort().join("");
  const candidateDigits = String(candidate).split("").sort().join("");
  if (sourceDigits === candidateDigits && String(source).length === String(candidate).length) {
    return true;
  }
  const sourceWithoutZeros = String(source).replaceAll("0", "").split("").sort().join("");
  if (sourceWithoutZeros === candidateDigits && String(source).includes("0")) return true;

  const digits = String(source).split("");
  for (let index = 0; index < digits.length; index += 1) {
    const digit = Number(digits[index]);
    if (digit === 0) continue;
    const place = 10 ** (digits.length - index - 1);
    if (
      candidate === source - digit * place + digit * place * 10 ||
      candidate === source - digit * place + digit * Math.floor(place / 10)
    ) {
      return true;
    }
  }

  return source > 0 && String(source).includes("0") && Number(String(source).replaceAll("0", "")) === candidate;
}

function plausibleWrongNumbers(source: number): number[] {
  const candidates = new Set<number>();
  for (const offset of [1, -1, 10, -10, 100, -100, 1_000, -1_000, 10_000, -10_000]) {
    if (source + offset >= 0 && source + offset <= 100_000) candidates.add(source + offset);
  }

  const digits = String(source).split("");
  for (let left = 0; left < digits.length; left += 1) {
    for (let right = left + 1; right < digits.length; right += 1) {
      const swapped = [...digits];
      [swapped[left], swapped[right]] = [swapped[right], swapped[left]];
      const candidate = Number(swapped.join(""));
      if (candidate !== source && candidate <= 100_000) candidates.add(candidate);
    }
  }
  if (digits.includes("0")) candidates.add(Number(digits.join("").replace("0", "")));
  for (let index = 0; index < digits.length; index += 1) {
    const digit = Number(digits[index]);
    if (digit === 0) continue;
    const place = 10 ** (digits.length - index - 1);
    for (const candidate of [
      source - digit * place + digit * place * 10,
      source - digit * place + digit * Math.floor(place / 10),
    ]) {
      if (candidate >= 0 && candidate <= 100_000 && candidate !== source) candidates.add(candidate);
    }
  }
  return [...candidates];
}

function verifyProblem(problem: PracticeProblem, practiceType: NumberWordPracticeType): void {
  const sourceNumber = sourceFromKey(problem.problemKey);
  const direction = directionFromKey(problem.problemKey);
  const canonical = createNumberWordProblem(practiceType, sourceNumber, direction);
  const choices = problem.visualData?.choices ?? [];

  expect(problem.visualType).toBe("multiple_choice");
  expect(problem.problemKey).toBe(canonical.problemKey);
  expect(problem.correctAnswer).toBe(canonical.correctAnswer);
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.filter((choice) => choice === canonical.correctAnswer)).toHaveLength(1);

  if (direction === "number_to_words") {
    expect(problem.questionText).toBe(
      `Write ${sourceNumber.toLocaleString("en-US")} in words.`,
    );
    expect(choices.filter((choice) => choice !== canonical.correctAnswer).every((choice) => {
      return plausibleWrongNumbers(sourceNumber).some(
        (candidate) => formatNumberWords(candidate) === choice,
      );
    })).toBe(true);
  } else {
    expect(problem.questionText).toBe(`What number is "${canonical.wordForm}"?`);
    const wrongChoicesArePlausible = choices.filter((choice) => choice !== canonical.correctAnswer).every((choice) => {
      return plausibleWrongNumber(sourceNumber, Number(choice));
    });
    expect(wrongChoicesArePlausible).toBe(true);
  }
}

describe("number-word Practice adapter", () => {
  it("honors requested counts and produces four unique semantically grounded choices", () => {
    for (const practiceType of PRACTICE_TYPES) {
      const problems = generateNumberWordsProblems({
        seed: `${practiceType}:semantic`,
        count: 24,
        lesson: { practice_type: practiceType },
      });

      expect(problems).toHaveLength(24);
      expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(24);

      for (const problem of problems) {
        const sourceNumber = sourceFromKey(problem.problemKey);
        const range = NUMBER_WORD_RANGES[practiceType];
        expect(sourceNumber).toBeGreaterThanOrEqual(range.min);
        expect(sourceNumber).toBeLessThanOrEqual(range.max);
        verifyProblem(problem, practiceType);
      }
    }
  });

  it("supports both directions for both practice types", () => {
    for (const practiceType of PRACTICE_TYPES) {
      const problems = generateNumberWordsProblems({
        seed: `${practiceType}:directions`,
        count: 40,
        lesson: { practice_type: practiceType },
      });
      expect(new Set(problems.map((problem) => directionFromKey(problem.problemKey)))).toEqual(
        new Set<NumberWordDirection>(["number_to_words", "words_to_number"]),
      );
    }
  });

  it("is deterministic for a session seed and varies for a different seed", () => {
    const first = generateNumberWordsProblems({ seed: "same", count: 12 });
    const second = generateNumberWordsProblems({ seed: "same", count: 12 });
    const different = generateNumberWordsProblems({ seed: "different", count: 12 });

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
  });

  it("uses stable flow-specific IDs without registering either type", () => {
    const problems = generateNumberWordsProblems({
      seed: "ids",
      count: 2,
      mode: "independent",
      lesson: { practice_type: "reading_large_numbers" },
    });

    expect(problems.map((problem) => problem.id)).toEqual([
      "number-words-reading_large_numbers-independent-1",
      "number-words-reading_large_numbers-independent-2",
    ]);
  });
});
