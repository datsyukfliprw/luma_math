import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import {
  NUMBER_WORD_RANGES,
  createNumberWordProblem,
  formatNumberWords,
  generateNumberWordProblem,
  type NumberWordDirection,
  type NumberWordPracticeType,
} from "./numberForms";

describe("number-word formatting", () => {
  it("follows the curriculum's whole-number conventions", () => {
    expect(formatNumberWords(47)).toBe("forty-seven");
    expect(formatNumberWords(605)).toBe("six hundred five");
    expect(formatNumberWords(1_024)).toBe("one thousand, twenty-four");
    expect(formatNumberWords(3_508)).toBe("three thousand, five hundred eight");
    expect(formatNumberWords(34_506)).toBe("thirty-four thousand, five hundred six");
    expect(formatNumberWords(100_000)).toBe("one hundred thousand");
  });

  it("handles internal zeros without inventing place words", () => {
    expect(formatNumberWords(91_034)).toBe("ninety-one thousand, thirty-four");
    expect(formatNumberWords(70_040)).toBe("seventy thousand, forty");
    expect(formatNumberWords(1_005)).toBe("one thousand, five");
  });

  it("rejects values outside the supported formatter boundary", () => {
    expect(() => formatNumberWords(-1)).toThrow(RangeError);
    expect(() => formatNumberWords(100_001)).toThrow(RangeError);
    expect(() => formatNumberWords(1.5)).toThrow(RangeError);
  });
});

describe("number-word mathematical core", () => {
  it("builds canonical state and direction-aware keys", () => {
    const numberToWords = createNumberWordProblem(
      "number_words",
      1_024,
      "number_to_words",
    );
    const wordsToNumber = createNumberWordProblem(
      "number_words",
      1_024,
      "words_to_number",
    );

    expect(numberToWords).toMatchObject({
      practiceType: "number_words",
      sourceNumber: 1_024,
      direction: "number_to_words",
      wordForm: "one thousand, twenty-four",
      correctAnswer: "one thousand, twenty-four",
      problemKey: "number_words:1024:number_to_words",
    });
    expect(wordsToNumber.correctAnswer).toBe("1024");
    expect(wordsToNumber.wordForm).toBe(numberToWords.wordForm);
    expect(wordsToNumber.problemKey).toBe("number_words:1024:words_to_number");
    expect(wordsToNumber.problemKey).not.toBe(numberToWords.problemKey);
  });

  it("generates each practice domain across intentional digit lengths", () => {
    const samples: Record<NumberWordPracticeType, number[]> = {
      number_words: [],
      reading_large_numbers: [],
    };

    for (const practiceType of Object.keys(samples) as NumberWordPracticeType[]) {
      for (let seed = 0; seed < 120; seed += 1) {
        samples[practiceType].push(
          generateNumberWordProblem(practiceType, createSeededRng(`${practiceType}:${seed}`))
            .sourceNumber,
        );
      }
    }

    expect(Math.min(...samples.number_words)).toBeGreaterThanOrEqual(
      NUMBER_WORD_RANGES.number_words.min,
    );
    expect(Math.max(...samples.number_words)).toBeLessThanOrEqual(
      NUMBER_WORD_RANGES.number_words.max,
    );
    expect(new Set(samples.number_words.map((number) => String(number).length))).toEqual(
      new Set([2, 3, 4]),
    );

    expect(Math.min(...samples.reading_large_numbers)).toBeGreaterThanOrEqual(
      NUMBER_WORD_RANGES.reading_large_numbers.min,
    );
    expect(Math.max(...samples.reading_large_numbers)).toBeLessThanOrEqual(
      NUMBER_WORD_RANGES.reading_large_numbers.max,
    );
    expect(samples.reading_large_numbers.some((number) => number >= 10_000)).toBe(true);
    expect(samples.reading_large_numbers).toContain(100_000);
  });

  it("supports both directions and deterministic seeded generation", () => {
    const first = Array.from({ length: 12 }, (_, index) =>
      generateNumberWordProblem(
        "reading_large_numbers",
        createSeededRng(`same:${index}`),
      ),
    );
    const second = Array.from({ length: 12 }, (_, index) =>
      generateNumberWordProblem(
        "reading_large_numbers",
        createSeededRng(`same:${index}`),
      ),
    );
    const different = Array.from({ length: 12 }, (_, index) =>
      generateNumberWordProblem(
        "reading_large_numbers",
        createSeededRng(`different:${index}`),
      ),
    );
    const directions = new Set<NumberWordDirection>(first.map((problem) => problem.direction));

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(directions).toEqual(
      new Set<NumberWordDirection>(["number_to_words", "words_to_number"]),
    );
    for (const problem of first) {
      expect(problem.problemKey).toBe(
        `number_words:${problem.sourceNumber}:${problem.direction}`,
      );
      expect(problem.correctAnswer).toBe(
        problem.direction === "number_to_words"
          ? problem.wordForm
          : String(problem.sourceNumber),
      );
    }
  });

  it("can represent the exact reading_large_numbers boundary", () => {
    const problem = createNumberWordProblem(
      "reading_large_numbers",
      100_000,
      "number_to_words",
    );

    expect(problem.wordForm).toBe("one hundred thousand");
    expect(problem.correctAnswer).toBe("one hundred thousand");
    expect(problem.problemKey).toBe("number_words:100000:number_to_words");
  });
});
