import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import {
  EXPANDED_FORM_RANGES,
  NUMBER_WORD_RANGES,
  createExpandedFormProblem,
  createNumberWordProblem,
  formatNumberWords,
  generateExpandedFormProblem,
  generateNumberWordProblem,
  type ExpandedFormDirection,
  type ExpandedFormPracticeType,
  type NumberWordDirection,
  type NumberWordPracticeType,
} from "./numberForms";

describe("expanded-form mathematical core", () => {
  it("uses curriculum-backed high-to-low terms and preserves internal zeros", () => {
    expect(createExpandedFormProblem("expanded_form", 4_159, "standard_to_expanded")).toMatchObject({
      sourceNumber: 4_159,
      terms: [
        { digit: 4, placeValue: 1_000, value: 4_000 },
        { digit: 1, placeValue: 100, value: 100 },
        { digit: 5, placeValue: 10, value: 50 },
        { digit: 9, placeValue: 1, value: 9 },
      ],
      correctAnswer: "4,000 + 100 + 50 + 9",
      problemKey: "expanded_form:4159:standard_to_expanded",
    });
    expect(createExpandedFormProblem("expanded_form", 8_206, "standard_to_expanded").correctAnswer)
      .toBe("8,000 + 200 + 6");
    expect(createExpandedFormProblem("expanded_form_large", 90_607, "standard_to_expanded").correctAnswer)
      .toBe("90,000 + 600 + 7");
  });

  it("supports both directions and the exact 100,000 boundary", () => {
    const expandedToStandard = createExpandedFormProblem(
      "expanded_form_large",
      100_000,
      "expanded_to_standard",
    );
    expect(expandedToStandard).toMatchObject({
      terms: [{ digit: 1, placeValue: 100_000, value: 100_000 }],
      expandedForm: "100,000",
      correctAnswer: "100000",
      problemKey: "expanded_form:100000:expanded_to_standard",
    });

    const directions = new Set<ExpandedFormDirection>();
    for (let seed = 0; seed < 120; seed += 1) {
      directions.add(
        generateExpandedFormProblem("expanded_form_large", createSeededRng(`direction:${seed}`))
          .direction,
      );
    }
    expect(directions).toEqual(
      new Set<ExpandedFormDirection>(["standard_to_expanded", "expanded_to_standard"]),
    );
  });

  it("generates within each configured curriculum domain", () => {
    const samples: Record<ExpandedFormPracticeType, number[]> = {
      expanded_form: [],
      expanded_form_large: [],
    };
    for (const practiceType of Object.keys(samples) as ExpandedFormPracticeType[]) {
      for (let seed = 0; seed < 160; seed += 1) {
        samples[practiceType].push(
          generateExpandedFormProblem(practiceType, createSeededRng(`${practiceType}:${seed}`))
            .sourceNumber,
        );
      }
    }
    expect(Math.min(...samples.expanded_form)).toBeGreaterThanOrEqual(EXPANDED_FORM_RANGES.expanded_form.min);
    expect(Math.max(...samples.expanded_form)).toBeLessThanOrEqual(EXPANDED_FORM_RANGES.expanded_form.max);
    expect(new Set(samples.expanded_form.map((number) => String(number).length))).toEqual(
      new Set([2, 3, 4]),
    );
    expect(Math.min(...samples.expanded_form_large)).toBeGreaterThanOrEqual(
      EXPANDED_FORM_RANGES.expanded_form_large.min,
    );
    expect(Math.max(...samples.expanded_form_large)).toBeLessThanOrEqual(
      EXPANDED_FORM_RANGES.expanded_form_large.max,
    );
    expect(samples.expanded_form_large.some((number) => number >= 10_000)).toBe(true);
    expect(samples.expanded_form_large).toContain(100_000);
  });

  it("reconstructs every generated number from its non-zero terms", () => {
    for (let seed = 0; seed < 100; seed += 1) {
      const problem = generateExpandedFormProblem(
        "expanded_form_large",
        createSeededRng(`reconstruct:${seed}`),
      );
      expect(problem.terms.reduce((sum, term) => sum + term.value, 0)).toBe(problem.sourceNumber);
      expect(problem.terms.every((term) => term.digit !== 0)).toBe(true);
      expect(problem.terms.every((term, index, terms) => index === 0 || terms[index - 1].value > term.value))
        .toBe(true);
    }
  });
});

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
