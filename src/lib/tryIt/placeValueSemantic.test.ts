import { describe, expect, it } from "vitest";
import { getAllCurricula } from "../../data/curriculum";
import { createSeededRng, derivePracticeSeed } from "../../practiceTypes/random";
import { generateExpandedFormProblem } from "../placeValue/numberForms";
import {
  generateBaseTenModelProblem,
  generatePlaceValuePuzzleProblem,
} from "../placeValue/placeValueComposition";
import { getDigitValueDistractorCandidates } from "../placeValue/distractors";
import { generateDigitValueProblem } from "../placeValue/generator";
import type { DigitValueProblem } from "../placeValue/types";
import { getResolvedTryItExperience } from "../tryItResolver";
import { getLessonById } from "../lessonLookup";
import { placeValueFamily } from "./families/placeValue";
import type { TryItFamilyContext } from "./types";

const PLACE_VALUES = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1_000,
  "ten thousands": 10_000,
} as const;

const NUMBER_WORD_VALUES: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

function parseNumberWords(words: string): number {
  let total = 0;
  let current = 0;

  for (const token of words
    .toLowerCase()
    .replaceAll(",", "")
    .replaceAll("-", " ")
    .split(/\s+/)) {
    if (token === "hundred") {
      current *= 100;
    } else if (token === "thousand") {
      total += current * 1_000;
      current = 0;
    } else {
      current += NUMBER_WORD_VALUES[token];
    }
  }

  return total + current;
}

function findLessonId(practiceType = "place_value_digits"): string {
  for (const unit of getAllCurricula()) {
    for (const week of unit.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.lesson_type === "lesson" && lesson.practice_type === practiceType) {
          return `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`;
        }
      }
    }
  }
  throw new Error("No place_value_digits lesson found");
}

function resolve(attemptKey: string | number, practiceType = "place_value_digits") {
  return getResolvedTryItExperience(findLessonId(practiceType), { attemptKey })!;
}

describe("place_value_digits Try It semantics", () => {
  it("adapts the shared mathematical state into the existing presentation", () => {
    const lessonId = findLessonId();
    const attemptKey = "shared-state";
    const experience = getResolvedTryItExperience(lessonId, { attemptKey })!;
    const shared = generateDigitValueProblem(
      createSeededRng(derivePracticeSeed(String(attemptKey), "tryit", lessonId)),
    );
    const problem = experience.problems[0];

    expect(problem.problemKey).toBe(shared.problemKey);
    expect(problem.prompt).toBe(
      `In the number ${shared.number}, what is the value of the ${shared.targetPlace} digit?`,
    );
    expect(problem.parts).toHaveLength(1);
    expect(problem.parts[0].correctAnswer).toBe(String(shared.correctAnswer));
  });

  it("produces three unique choices with exactly one mathematically correct answer", () => {
    for (const problem of resolve("choice-semantics").problems) {
      const match = problem.prompt.match(
        /^In the number (\d+), what is the value of the (ones|tens|hundreds|thousands|ten thousands) digit\?$/,
      );
      expect(match).not.toBeNull();
      const number = Number(match![1]);
      const targetPlace = match![2] as keyof typeof PLACE_VALUES;
      const placeValue = PLACE_VALUES[targetPlace];
      const targetDigit = Math.floor(number / placeValue) % 10;
      const expected = targetDigit * placeValue;
      const choices = problem.parts[0].choices ?? [];
      const canonicalProblem: DigitValueProblem = {
        form: "digit_value",
        number,
        targetPlace,
        targetDigit,
        placeValue,
        correctAnswer: expected,
        problemKey: problem.problemKey ?? "",
      };
      const domainCandidates = new Set(
        getDigitValueDistractorCandidates(canonicalProblem).map(String),
      );

      expect(choices).toHaveLength(3);
      expect(new Set(choices).size).toBe(3);
      expect(problem.parts[0].correctAnswer).toBe(String(expected));
      expect(choices.filter((choice) => choice === String(expected))).toHaveLength(1);
      for (const choice of choices.filter((choice) => choice !== String(expected))) {
        expect(domainCandidates).toContain(choice);
      }
    }
  });

  it("is deterministic for the same attempt and has no duplicate keys", () => {
    const first = resolve("deterministic");
    expect(resolve("deterministic")).toEqual(first);
    expect(new Set(first.problems.map((problem) => problem.problemKey)).size).toBe(
      first.problems.length,
    );
  });

  it("keeps ten-thousands answers finite and valid", () => {
    let encounteredTenThousandsProblems = 0;

    for (let index = 0; index < 100; index += 1) {
      const experience = resolve(`ten-thousands-${index}`);
      for (const problem of experience.problems) {
        if (!problem.prompt.includes("ten thousands")) continue;
        encounteredTenThousandsProblems += 1;
        const answer = Number(problem.parts[0].correctAnswer);
        expect(Number.isFinite(answer)).toBe(true);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(answer).toBeLessThanOrEqual(90_000);
        expect(answer % 10_000).toBe(0);
      }
    }

    expect(encounteredTenThousandsProblems).toBeGreaterThan(0);
  });
});

describe("large_digit_value Try It semantics", () => {
  it("uses the displayed large number and place for one finite, domain-grounded answer", () => {
    let encounteredFiveDigitProblem = false;

    for (let index = 0; index < 100; index += 1) {
      for (const problem of resolve(`large-digit-semantics-${index}`, "large_digit_value").problems) {
        const match = problem.prompt.match(
          /^In the number (\d+), what is the value of the (ones|tens|hundreds|thousands|ten thousands) digit\?$/,
        );
        expect(match).not.toBeNull();

        const number = Number(match![1]);
        const targetPlace = match![2] as keyof typeof PLACE_VALUES;
        const placeValue = PLACE_VALUES[targetPlace];
        const targetDigit = Math.floor(number / placeValue) % 10;
        const expected = targetDigit * placeValue;
        const choices = problem.parts[0].choices ?? [];

        expect(number).toBeGreaterThanOrEqual(1_000);
        expect(number).toBeLessThanOrEqual(99_999);
        expect(placeValue).toBeLessThanOrEqual(10 ** (String(number).length - 1));
        expect(problem.problemKey).toBe(`digit_value:${number}:${targetPlace}`);
        expect(problem.parts[0].correctAnswer).toBe(String(expected));
        expect(Number.isFinite(expected)).toBe(true);
        expect(choices).toHaveLength(3);
        expect(new Set(choices).size).toBe(3);
        expect(choices.filter((choice) => choice === String(expected))).toHaveLength(1);

        const canonicalProblem: DigitValueProblem = {
          form: "digit_value",
          number,
          targetPlace,
          targetDigit,
          placeValue,
          correctAnswer: expected,
          problemKey: problem.problemKey ?? "",
        };
        for (const choice of choices.filter((choice) => choice !== String(expected))) {
          expect(getDigitValueDistractorCandidates(canonicalProblem).map(String)).toContain(choice);
          expect(Number.isFinite(Number(choice))).toBe(true);
        }

        if (String(number).length === 5) encounteredFiveDigitProblem = true;
      }
    }

    expect(encounteredFiveDigitProblem).toBe(true);
  });

  it("keeps the same attempt deterministic and rejects duplicate canonical keys", () => {
    const first = resolve("large-digit-deterministic", "large_digit_value");
    expect(resolve("large-digit-deterministic", "large_digit_value")).toEqual(first);
    expect(new Set(first.problems.map((problem) => problem.problemKey)).size).toBe(
      first.problems.length,
    );
  });
});

describe("number-word Try It semantics", () => {
  it("keeps canonical direction, prompt, answer, and choices aligned across both domains", () => {
    const directions = new Set<string>();
    let encounteredInternalZero = false;
    let encounteredReadingBoundary = false;

    for (const practiceType of ["reading_large_numbers", "number_words"] as const) {
      for (let index = 0; index < 120; index += 1) {
        for (const problem of resolve(`number-word-semantics-${practiceType}-${index}`, practiceType).problems) {
          const keyMatch = (problem.problemKey ?? "").match(
            /^number_words:(\d+):(number_to_words|words_to_number)$/,
          );
          expect(keyMatch).not.toBeNull();

          const sourceNumber = Number(keyMatch![1]);
          const direction = keyMatch![2];
          directions.add(direction);
          expect(problem.problemKey).toBe(`number_words:${sourceNumber}:${direction}`);
          expect(problem.parts[0].choices).toHaveLength(4);
          expect(new Set(problem.parts[0].choices).size).toBe(4);
          expect(
            problem.parts[0].choices!.filter(
              (choice) => choice === problem.parts[0].correctAnswer,
            ),
          ).toHaveLength(1);

          if (direction === "number_to_words") {
            expect(problem.prompt).toBe(
              `Write ${sourceNumber.toLocaleString("en-US")} in words.`,
            );
            expect(parseNumberWords(problem.parts[0].correctAnswer)).toBe(sourceNumber);
            for (const choice of problem.parts[0].choices!) {
              expect(parseNumberWords(choice)).toBeGreaterThanOrEqual(0);
              if (choice !== problem.parts[0].correctAnswer) {
                expect(parseNumberWords(choice)).not.toBe(sourceNumber);
              }
            }
          } else {
            const wordForm = problem.prompt.match(/^What number is "(.+)"\?$/)?.[1];
            expect(wordForm).toBeDefined();
            expect(parseNumberWords(wordForm!)).toBe(sourceNumber);
            expect(problem.parts[0].correctAnswer).toBe(String(sourceNumber));
            for (const choice of problem.parts[0].choices!) {
              expect(Number.isInteger(Number(choice))).toBe(true);
              expect(Number(choice)).toBeGreaterThanOrEqual(
                practiceType === "reading_large_numbers" ? 1_000 : 10,
              );
              expect(Number(choice)).toBeLessThanOrEqual(
                practiceType === "reading_large_numbers" ? 100_000 : 9_999,
              );
              if (choice !== problem.parts[0].correctAnswer) {
                expect(Number(choice)).not.toBe(sourceNumber);
              }
            }
          }

          if (String(sourceNumber).slice(1, -1).includes("0")) encounteredInternalZero = true;
          if (practiceType === "reading_large_numbers" && sourceNumber === 100_000) {
            encounteredReadingBoundary = true;
          }
        }
      }
    }

    expect(parseNumberWords("one thousand, twenty-four")).toBe(1_024);
    expect(parseNumberWords("ninety-one thousand, thirty-four")).toBe(91_034);
    expect(directions).toEqual(new Set(["number_to_words", "words_to_number"]));
    expect(encounteredInternalZero).toBe(true);
    expect(encounteredReadingBoundary).toBe(true);
  }, 60000);

  it("is deterministic for the same attempt for both practice types", () => {
    for (const practiceType of ["reading_large_numbers", "number_words"] as const) {
      const first = resolve(`number-word-deterministic-${practiceType}`, practiceType);
      expect(resolve(`number-word-deterministic-${practiceType}`, practiceType)).toEqual(first);
    }
  });
});

function parseExpandedExpression(expression: string): number[] {
  return expression.split("+").map((term) => {
    const value = Number(term.trim().replaceAll(",", ""));
    expect(Number.isInteger(value)).toBe(true);
    return value;
  });
}

describe("expanded-form Try It semantics", () => {
  it("uses the shared canonical state for both directions in both curriculum domains", () => {
    const encounteredDirections = {
      expanded_form: new Set<string>(),
      expanded_form_large: new Set<string>(),
    };
    const encounteredInternalZero = new Set<string>();
    let encounteredOneHundredThousand = false;

    for (const practiceType of ["expanded_form", "expanded_form_large"] as const) {
      const min = practiceType === "expanded_form" ? 10 : 1_000;
      const max = practiceType === "expanded_form" ? 9_999 : 100_000;

      for (let index = 0; index < 240; index += 1) {
        for (const problem of resolve(`expanded-form-semantics-${practiceType}-${index}`, practiceType).problems) {
          const keyMatch = (problem.problemKey ?? "").match(
            /^expanded_form:(\d+):(standard_to_expanded|expanded_to_standard)$/,
          );
          expect(keyMatch).not.toBeNull();

          const sourceNumber = Number(keyMatch![1]);
          const direction = keyMatch![2];
          encounteredDirections[practiceType].add(direction);
          expect(sourceNumber).toBeGreaterThanOrEqual(min);
          expect(sourceNumber).toBeLessThanOrEqual(max);
          expect(problem.problemKey).toBe(`expanded_form:${sourceNumber}:${direction}`);

          const part = problem.parts[0];
          const choices = part.choices ?? [];
          expect(choices).toHaveLength(3);
          expect(new Set(choices).size).toBe(3);
          expect(choices.filter((choice) => choice === part.correctAnswer)).toHaveLength(1);

          if (direction === "standard_to_expanded") {
            expect(problem.prompt).toBe(`Write ${sourceNumber.toLocaleString("en-US")} in expanded form.`);
            const terms = parseExpandedExpression(part.correctAnswer);
            expect(terms.every((term) => term > 0)).toBe(true);
            expect(terms.every((term, termIndex) => termIndex === 0 || term < terms[termIndex - 1])).toBe(true);
            expect(terms.reduce((sum, term) => sum + term, 0)).toBe(sourceNumber);
          } else {
            const expression = problem.prompt.match(/^What number is (.+)\?$/)?.[1];
            expect(expression).toBeDefined();
            expect(parseExpandedExpression(expression!).reduce((sum, term) => sum + term, 0)).toBe(sourceNumber);
            expect(part.correctAnswer).toBe(String(sourceNumber));
          }

          if (String(sourceNumber).slice(1, -1).includes("0")) {
            encounteredInternalZero.add(practiceType);
          }
          if (practiceType === "expanded_form_large" && sourceNumber === 100_000) {
            encounteredOneHundredThousand = true;
          }
        }
      }
    }

    for (const practiceType of ["expanded_form", "expanded_form_large"] as const) {
      expect(encounteredDirections[practiceType]).toEqual(
        new Set(["standard_to_expanded", "expanded_to_standard"]),
      );
    }
    expect(encounteredInternalZero).toEqual(new Set(["expanded_form", "expanded_form_large"]));
    expect(encounteredOneHundredThousand).toBe(true);
  }, 60000);

  it("is deterministic and rejects duplicate canonical keys before presentation RNG", () => {
    for (const practiceType of ["expanded_form", "expanded_form_large"] as const) {
      const attempt = `expanded-form-deterministic-${practiceType}`;
      const first = resolve(attempt, practiceType);
      expect(resolve(attempt, practiceType)).toEqual(first);
      expect(new Set(first.problems.map((problem) => problem.problemKey)).size).toBe(
        first.problems.length,
      );
    }

    const lessonId = findLessonId("expanded_form");
    const lesson = getLessonById(lessonId).lesson;
    const seed = "expanded-form-duplicate-presentation-rng";
    const expectedRng = createSeededRng(seed);
    const firstCanonical = generateExpandedFormProblem("expanded_form", expectedRng);
    const secondCanonical = generateExpandedFormProblem("expanded_form", expectedRng);
    const afterDuplicate = placeValueFamily({
      lessonId,
      lesson,
      family: "place_value",
      practiceType: "expanded_form",
      attemptKey: seed,
      rng: createSeededRng(seed),
      usedKeys: new Set([firstCanonical.problemKey]),
      count: 1,
    });
    expect(afterDuplicate).toHaveLength(1);
    expect(afterDuplicate[0].problemKey).toBe(secondCanonical.problemKey);
  });
});

type BaseTenBlockLabel = "unit cube" | "ten rod" | "hundred flat" | "thousand cube";
type PlaceValueClueLabel = "ones" | "tens" | "hundreds" | "thousands" | "ten-thousands";

const BASE_TEN_BLOCK_VALUES: Record<BaseTenBlockLabel, number> = {
  "unit cube": 1,
  "ten rod": 10,
  "hundred flat": 100,
  "thousand cube": 1_000,
};

const PLACE_VALUE_CLUE_VALUES: Record<PlaceValueClueLabel, number> = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1_000,
  "ten-thousands": 10_000,
};

function parseBaseTenBlocks(prompt: string): Array<{ count: number; label: BaseTenBlockLabel }> {
  const body = prompt.match(/^What number is shown by (.+)\?$/)?.[1];
  expect(body).toBeDefined();

  return body!.split(/, | and /).map((part) => {
    const match = part.match(
      /^(\d+) (unit cube|unit cubes|ten rod|ten rods|hundred flat|hundred flats|thousand cube|thousand cubes)$/,
    );
    expect(match).not.toBeNull();
    const singular = match![2].replace(/s$/, "") as BaseTenBlockLabel;
    const count = Number(match![1]);
    expect(match![2]).toBe(count === 1 ? singular : `${singular}s`);
    return { count, label: singular };
  });
}

function parsePlaceValueClues(
  prompt: string,
): Array<{ digit: number; label: PlaceValueClueLabel }> {
  const body = prompt.match(/^Build the number with (.+)\.$/)?.[1];
  expect(body).toBeDefined();

  return body!.split(/, | and /).map((part) => {
    const match = part.match(
      /^(\d+) (one|ones|ten|tens|hundred|hundreds|thousand|thousands|ten-thousand|ten-thousands)$/,
    );
    expect(match).not.toBeNull();
    const label = match![2].replace(/s$/, "") as
      | "one"
      | "ten"
      | "hundred"
      | "thousand"
      | "ten-thousand";
    const digit = Number(match![1]);
    expect(match![2]).toBe(digit === 1 ? label : `${label}s`);
    const normalizedLabel: PlaceValueClueLabel =
      label === "one"
        ? "ones"
        : label === "ten"
          ? "tens"
          : label === "hundred"
            ? "hundreds"
            : label === "thousand"
              ? "thousands"
              : "ten-thousands";
    return { digit, label: normalizedLabel };
  });
}

describe("base_ten_models Try It semantics", () => {
  it("describes actual base-ten blocks and reconstructs the whole number", () => {
    let encounteredZeroPlace = false;

    for (let index = 0; index < 200; index += 1) {
      for (const problem of resolve(`base-ten-semantics-${index}`, "base_ten_models").problems) {
        const keyMatch = (problem.problemKey ?? "").match(/^base_ten:(\d+)$/);
        expect(keyMatch).not.toBeNull();
        const number = Number(keyMatch![1]);
        expect(number).toBeGreaterThanOrEqual(10);
        expect(number).toBeLessThanOrEqual(9_999);

        const blocks = parseBaseTenBlocks(problem.prompt);
        expect(blocks.length).toBeGreaterThanOrEqual(2);
        const reconstructed = blocks.reduce(
          (total, block) => total + block.count * BASE_TEN_BLOCK_VALUES[block.label],
          0,
        );
        expect(reconstructed).toBe(number);
        expect(problem.parts[0].correctAnswer).toBe(String(reconstructed));

        for (const block of blocks) {
          expect(block.count).toBeGreaterThanOrEqual(0);
          expect(block.count).toBeLessThanOrEqual(9);
          if (block.count === 0) encounteredZeroPlace = true;
        }

        const choices = problem.parts[0].choices ?? [];
        expect(choices).toHaveLength(3);
        expect(new Set(choices).size).toBe(3);
        expect(choices.filter((choice) => choice === String(reconstructed))).toHaveLength(1);
        for (const choice of choices) {
          expect(Number.isFinite(Number(choice))).toBe(true);
          expect(Number.isInteger(Number(choice))).toBe(true);
          expect(Number(choice)).toBeGreaterThanOrEqual(10);
          expect(Number(choice)).toBeLessThanOrEqual(9_999);
        }
      }
    }

    expect(encounteredZeroPlace).toBe(true);
  }, 60000);

  it("uses canonical keys, is deterministic, and rejects duplicates before presentation RNG", () => {
    const first = resolve("base-ten-deterministic", "base_ten_models");
    expect(resolve("base-ten-deterministic", "base_ten_models")).toEqual(first);
    expect(new Set(first.problems.map((problem) => problem.problemKey)).size).toBe(
      first.problems.length,
    );

    const lessonId = findLessonId("base_ten_models");
    const lesson = getLessonById(lessonId).lesson;
    const seed = "base-ten-duplicate-presentation-rng";
    const expectedRng = createSeededRng(seed);
    const firstCanonical = generateBaseTenModelProblem(expectedRng);
    const secondCanonical = generateBaseTenModelProblem(expectedRng);
    const afterDuplicate = placeValueFamily({
      lessonId,
      lesson,
      family: "place_value",
      practiceType: "base_ten_models",
      attemptKey: seed,
      rng: createSeededRng(seed),
      usedKeys: new Set([firstCanonical.problemKey]),
      count: 1,
    });

    expect(afterDuplicate).toHaveLength(1);
    expect(afterDuplicate[0].problemKey).toBe(secondCanonical.problemKey);
  });
});

describe("place_value_puzzles Try It semantics", () => {
  it("describes all five place clues and reconstructs the whole number", () => {
    let encounteredZeroClue = false;
    let encounteredInternalZero = false;
    let encounteredImplicitLeadingZero = false;

    for (let index = 0; index < 240; index += 1) {
      for (const problem of resolve(`place-value-puzzle-semantics-${index}`, "place_value_puzzles").problems) {
        const keyMatch = (problem.problemKey ?? "").match(/^place_value_puzzle:(\d+):riddle$/);
        expect(keyMatch).not.toBeNull();
        const number = Number(keyMatch![1]);
        expect(number).toBeGreaterThanOrEqual(1_000);
        expect(number).toBeLessThanOrEqual(99_999);

        const clues = parsePlaceValueClues(problem.prompt);
        expect(clues).toHaveLength(5);
        expect(new Set(clues.map((clue) => clue.label))).toEqual(
          new Set(["ones", "tens", "hundreds", "thousands", "ten-thousands"]),
        );
        const reconstructed = clues.reduce(
          (total, clue) => total + clue.digit * PLACE_VALUE_CLUE_VALUES[clue.label],
          0,
        );
        expect(reconstructed).toBe(number);
        expect(problem.parts[0].correctAnswer).toBe(String(reconstructed));

        for (const clue of clues) {
          expect(clue.digit).toBeGreaterThanOrEqual(0);
          expect(clue.digit).toBeLessThanOrEqual(9);
          if (clue.digit === 0) encounteredZeroClue = true;
        }
        if (String(number).length === 4) encounteredImplicitLeadingZero = true;
        if (String(number).slice(1).includes("0")) encounteredInternalZero = true;

        const choices = problem.parts[0].choices ?? [];
        expect(choices).toHaveLength(3);
        expect(new Set(choices).size).toBe(3);
        expect(choices.filter((choice) => choice === String(reconstructed))).toHaveLength(1);
        for (const choice of choices) {
          expect(Number.isFinite(Number(choice))).toBe(true);
          expect(Number.isInteger(Number(choice))).toBe(true);
          expect(Number(choice)).toBeGreaterThanOrEqual(1_000);
          expect(Number(choice)).toBeLessThanOrEqual(99_999);
        }
      }
    }

    expect(encounteredZeroClue).toBe(true);
    expect(encounteredInternalZero).toBe(true);
    expect(encounteredImplicitLeadingZero).toBe(true);
  }, 60000);

  it("uses canonical keys, is deterministic, and rejects duplicates before presentation RNG", () => {
    const first = resolve("place-value-puzzle-deterministic", "place_value_puzzles");
    expect(resolve("place-value-puzzle-deterministic", "place_value_puzzles")).toEqual(first);
    expect(new Set(first.problems.map((problem) => problem.problemKey)).size).toBe(
      first.problems.length,
    );

    const lessonId = findLessonId("place_value_puzzles");
    const lesson = getLessonById(lessonId).lesson;
    const seed = "place-value-puzzle-duplicate-presentation-rng";
    const expectedRng = createSeededRng(seed);
    const firstCanonical = generatePlaceValuePuzzleProblem(expectedRng);
    const secondCanonical = generatePlaceValuePuzzleProblem(expectedRng);
    const afterDuplicate = placeValueFamily({
      lessonId,
      lesson,
      family: "place_value",
      practiceType: "place_value_puzzles",
      attemptKey: seed,
      rng: createSeededRng(seed),
      usedKeys: new Set([firstCanonical.problemKey]),
      count: 1,
    });

    expect(afterDuplicate).toHaveLength(1);
    expect(afterDuplicate[0].problemKey).toBe(secondCanonical.problemKey);
  });
});

describe("shared place-value Try It semantics", () => {
  it("does not consume presentation RNG while rejecting a shared duplicate", () => {
    const lessonId = findLessonId();
    const lesson = getLessonById(lessonId).lesson;
    const seed = "duplicate-presentation-rng";
    const expectedRng = createSeededRng(seed);
    const first = generateDigitValueProblem(expectedRng);
    const second = generateDigitValueProblem(expectedRng);
    const baseContext = (usedKeys: Set<string>, rngSeed: string): TryItFamilyContext => ({
      lessonId,
      lesson,
      family: "place_value",
      practiceType: "place_value_digits",
      attemptKey: seed,
      rng: createSeededRng(rngSeed),
      usedKeys,
      count: 1,
    });

    const afterDuplicate = placeValueFamily(baseContext(new Set([first.problemKey]), seed))[0];
    expect(afterDuplicate.problemKey).toBe(second.problemKey);
  });
});
