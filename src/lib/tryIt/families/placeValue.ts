import type { TryItFamily } from "../types";
import { getDigitValueDistractorCandidates } from "../../placeValue/distractors";
import { generateDigitValueProblem } from "../../placeValue/generator";
import {
  formatNumberWords,
  generateNumberWordProblem,
  NUMBER_WORD_RANGES,
  type NumberWordProblem,
} from "../../placeValue/numberForms";
import {
  generateExpandedFormProblem,
  type ExpandedFormProblem,
  type ExpandedFormTerm,
} from "../../placeValue/numberForms";
import {
  generatePlaceValueCompositionProblem,
  getPlaceValueCompositionDistractorCandidates,
  type PlaceValueCompositionProblem,
} from "../../placeValue/placeValueComposition";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";
import type { SeededRng } from "../../../practiceTypes/random";

const PLACE_VALUES = [1, 10, 100, 1000, 10000];
const LARGE_NUMBER_RANGE = { min: 1_000, max: 99_999 } as const;
const NUMBER_WORD_CHOICE_COUNT = 4;
const EXPANDED_FORM_CHOICE_COUNT = 3;
const PLACE_VALUE_COMPOSITION_CHOICE_COUNT = 3;

function formatBlockCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatBaseTenBlocks(problem: Extract<PlaceValueCompositionProblem, { form: "base_ten_models" }>): string {
  const labels: Record<(typeof problem.blocks)[number]["place"], [string, string]> = {
    ones: ["unit cube", "unit cubes"],
    tens: ["ten rod", "ten rods"],
    hundreds: ["hundred flat", "hundred flats"],
    thousands: ["thousand cube", "thousand cubes"],
  };
  const lastRelevantIndex = problem.blocks.findLastIndex((block) => block.count > 0);
  return problem.blocks
    .slice(0, lastRelevantIndex + 1)
    .reverse()
    .map((block) => {
      const [singular, plural] = labels[block.place];
      return formatBlockCount(block.count, singular, plural);
    })
    .join(", ")
    .replace(/, ([^,]+)$/, " and $1");
}

function formatPlaceValueClues(
  problem: Extract<PlaceValueCompositionProblem, { form: "place_value_puzzles" }>,
): string {
  const labels: Record<(typeof problem.clues)[number]["place"], [string, string]> = {
    ones: ["one", "ones"],
    tens: ["ten", "tens"],
    hundreds: ["hundred", "hundreds"],
    thousands: ["thousand", "thousands"],
    "ten-thousands": ["ten-thousand", "ten-thousands"],
  };
  return problem.clues
    .slice()
    .reverse()
    .map((clue) => {
      const [singular, plural] = labels[clue.place];
      return formatBlockCount(clue.digit, singular, plural);
    })
    .join(", ")
    .replace(/, ([^,]+)$/, " and $1");
}

function buildPlaceValueCompositionChoices(
  problem: PlaceValueCompositionProblem,
  rng: SeededRng,
): string[] {
  const distractors = rng
    .shuffle(getPlaceValueCompositionDistractorCandidates(problem))
    .slice(0, PLACE_VALUE_COMPOSITION_CHOICE_COUNT - 1)
    .map(String);
  const choices = rng.shuffle([String(problem.correctAnswer), ...distractors]);

  if (
    choices.length !== PLACE_VALUE_COMPOSITION_CHOICE_COUNT ||
    new Set(choices).size !== PLACE_VALUE_COMPOSITION_CHOICE_COUNT
  ) {
    throw new Error(`Could not build three unique ${problem.form} choices`);
  }
  return choices;
}

function formatExpandedTerms(terms: readonly ExpandedFormTerm[]): string {
  return [...terms]
    .sort((left, right) => right.value - left.value)
    .map((term) => term.value.toLocaleString("en-US"))
    .join(" + ");
}

function expandedFormDistractors(problem: ExpandedFormProblem): string[] {
  const candidates = new Set<string>();
  const terms = problem.terms;

  for (const [index, term] of terms.entries()) {
    if (terms.length > 1) {
      candidates.add(formatExpandedTerms(terms.filter((_, termIndex) => termIndex !== index)));
    }

    const changedDigit = term.digit < 9 ? term.value + term.placeValue : term.value - term.placeValue;
    candidates.add(
      formatExpandedTerms(
        terms.map((current, termIndex) =>
          termIndex === index ? { ...current, digit: changedDigit / current.placeValue, value: changedDigit } : current,
        ),
      ),
    );
    candidates.add(
      formatExpandedTerms(
        terms.map((current, termIndex) =>
          termIndex === index ? { ...current, value: current.value * 10 } : current,
        ),
      ),
    );
  }

  return [...candidates].filter((candidate) => candidate !== problem.expandedForm);
}

function standardFormDistractors(problem: ExpandedFormProblem): string[] {
  const candidates = new Set<number>();
  for (const term of problem.terms) {
    if (problem.terms.length > 1) candidates.add(problem.sourceNumber - term.value);
    candidates.add(problem.sourceNumber - term.value + term.value * 10);
    candidates.add(
      problem.sourceNumber + (term.digit < 9 ? term.placeValue : -term.placeValue),
    );
  }

  return [...candidates]
    .filter((candidate) => candidate !== problem.sourceNumber && candidate >= 0)
    .map((candidate) => candidate.toLocaleString("en-US"));
}

function buildExpandedFormChoices(problem: ExpandedFormProblem, rng: SeededRng): string[] {
  const distractors =
    problem.direction === "standard_to_expanded"
      ? expandedFormDistractors(problem)
      : standardFormDistractors(problem);
  const uniqueDistractors = [...new Set(distractors)].slice(0, EXPANDED_FORM_CHOICE_COUNT - 1);
  if (uniqueDistractors.length !== EXPANDED_FORM_CHOICE_COUNT - 1) {
    throw new Error("Could not build three unique expanded-form choices");
  }
  return rng.shuffle([problem.correctAnswer, ...uniqueDistractors]);
}

function addNumberWordCandidate(
  candidates: Set<number>,
  candidate: number,
  correct: number,
  min: number,
  max: number,
): void {
  if (Number.isInteger(candidate) && candidate >= min && candidate <= max && candidate !== correct) {
    candidates.add(candidate);
  }
}

function getNumberWordDistractorCandidates(problem: NumberWordProblem): number[] {
  const candidates = new Set<number>();
  const { sourceNumber } = problem;
  const { min, max } = NUMBER_WORD_RANGES[problem.practiceType];

  for (const offset of [1, -1, 10, -10, 100, -100, 1_000, -1_000, 10_000, -10_000]) {
    addNumberWordCandidate(candidates, sourceNumber + offset, sourceNumber, min, max);
  }

  const digits = String(sourceNumber).split("");
  for (let left = 0; left < digits.length; left += 1) {
    for (let right = left + 1; right < digits.length; right += 1) {
      const swapped = [...digits];
      [swapped[left], swapped[right]] = [swapped[right], swapped[left]];
      addNumberWordCandidate(candidates, Number(swapped.join("")), sourceNumber, min, max);
    }
  }

  if (digits.includes("0")) {
    addNumberWordCandidate(
      candidates,
      Number(digits.join("").replace("0", "")),
      sourceNumber,
      min,
      max,
    );
  }

  for (let offset = 1; candidates.size < NUMBER_WORD_CHOICE_COUNT - 1; offset += 1) {
    addNumberWordCandidate(candidates, sourceNumber - offset, sourceNumber, min, max);
    addNumberWordCandidate(candidates, sourceNumber + offset, sourceNumber, min, max);
  }

  return [...candidates];
}

function buildNumberWordChoices(problem: NumberWordProblem, rng: SeededRng): string[] {
  const distractors = rng
    .shuffle(getNumberWordDistractorCandidates(problem))
    .slice(0, NUMBER_WORD_CHOICE_COUNT - 1)
    .map((number) =>
      problem.direction === "number_to_words" ? formatNumberWords(number) : String(number),
    );

  return rng.shuffle([problem.correctAnswer, ...distractors]);
}

export const placeValueFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const usesSharedCanonicalGenerator =
      ctx.practiceType === "place_value_digits" ||
      ctx.practiceType === "large_digit_value" ||
      ctx.practiceType === "reading_large_numbers" ||
      ctx.practiceType === "number_words" ||
      ctx.practiceType === "expanded_form" ||
      ctx.practiceType === "expanded_form_large" ||
      ctx.practiceType === "base_ten_models" ||
      ctx.practiceType === "place_value_puzzles";
    const digits = usesSharedCanonicalGenerator ? 0 : ctx.rng.nextInt(2, 5);
    const max = usesSharedCanonicalGenerator ? 0 : 10 ** digits - 1;
    const min = usesSharedCanonicalGenerator ? 0 : 10 ** (digits - 1);
    const number = usesSharedCanonicalGenerator ? 0 : ctx.rng.nextInt(min, max);

    let prompt: string;
    let correct: string;
    let key: string;
    let choices: string[] | undefined;

    switch (ctx.practiceType) {
      case "large_digit_value":
      {
        const digitValueProblem = generateDigitValueProblem(ctx.rng, {
          numberRange: LARGE_NUMBER_RANGE,
        });
        prompt = `In the number ${digitValueProblem.number}, what is the value of the ${digitValueProblem.targetPlace} digit?`;
        correct = String(digitValueProblem.correctAnswer);
        key = digitValueProblem.problemKey;
        if (ctx.usedKeys.has(key)) continue;
        ctx.usedKeys.add(key);
        choices = ctx.rng
          .shuffle(getDigitValueDistractorCandidates(digitValueProblem))
          .slice(0, 2)
          .map(String);
        choices = ctx.rng.shuffle([correct, ...choices]);
        break;
      }
      case "place_value_digits": {
        const digitValueProblem = generateDigitValueProblem(ctx.rng);
        prompt = `In the number ${digitValueProblem.number}, what is the value of the ${digitValueProblem.targetPlace} digit?`;
        correct = String(digitValueProblem.correctAnswer);
        key = digitValueProblem.problemKey;
        if (ctx.usedKeys.has(key)) continue;
        ctx.usedKeys.add(key);
        const distractors = ctx.rng
          .shuffle(getDigitValueDistractorCandidates(digitValueProblem))
          .slice(0, 2)
          .map(String);
        choices = ctx.rng.shuffle([correct, ...distractors]);
        break;
      }
      case "reading_large_numbers":
      case "number_words": {
        const numberWordPracticeType =
          ctx.practiceType === "reading_large_numbers"
            ? "reading_large_numbers"
            : "number_words";
        const numberWordProblem = generateNumberWordProblem(numberWordPracticeType, ctx.rng);
        key = numberWordProblem.problemKey;
        if (ctx.usedKeys.has(key)) continue;
        ctx.usedKeys.add(key);
        prompt =
          numberWordProblem.direction === "number_to_words"
            ? `Write ${numberWordProblem.sourceNumber.toLocaleString("en-US")} in words.`
            : `What number is "${numberWordProblem.wordForm}"?`;
        correct = numberWordProblem.correctAnswer;
        choices = buildNumberWordChoices(numberWordProblem, ctx.rng);
        break;
      }
      case "expanded_form":
      case "expanded_form_large": {
        const expandedFormProblem = generateExpandedFormProblem(ctx.practiceType, ctx.rng);
        key = expandedFormProblem.problemKey;
        if (ctx.usedKeys.has(key)) continue;
        ctx.usedKeys.add(key);
        prompt =
          expandedFormProblem.direction === "standard_to_expanded"
            ? `Write ${expandedFormProblem.sourceNumber.toLocaleString("en-US")} in expanded form.`
            : `What number is ${expandedFormProblem.expandedForm}?`;
        correct = expandedFormProblem.correctAnswer;
        choices = buildExpandedFormChoices(expandedFormProblem, ctx.rng);
        break;
      }
      case "round_ten":
      case "round_hundred":
      case "round_place_value": {
        const roundTo =
          ctx.practiceType === "round_ten" ? 10 : ctx.practiceType === "round_hundred" ? 100 : 1000;
        prompt = `Round ${number} to the nearest ${roundTo}.`;
        correct = String(Math.round(number / roundTo) * roundTo);
        key = mathProblemKey(ctx.practiceType, number, roundTo, "round");
        choices = buildNumberChoices(
          Number(correct),
          Number(correct) - roundTo * 3,
          Number(correct) + roundTo * 3,
          ctx.rng,
        );
        break;
      }
      case "base_ten_models": {
        const baseTenProblem = generatePlaceValueCompositionProblem(ctx.practiceType, ctx.rng);
        if (baseTenProblem.form !== "base_ten_models") {
          throw new Error("Generated the wrong place-value composition form");
        }
        key = baseTenProblem.problemKey;
        if (ctx.usedKeys.has(key)) continue;
        ctx.usedKeys.add(key);
        prompt = `What number is shown by ${formatBaseTenBlocks(baseTenProblem)}?`;
        correct = String(baseTenProblem.correctAnswer);
        choices = buildPlaceValueCompositionChoices(baseTenProblem, ctx.rng);
        break;
      }
      case "estimate_reasonable": {
        const target = ctx.rng.nextInt(10, 500);
        correct = String(target + ctx.rng.nextInt(-target / 10, target / 10));
        prompt = `Which is a reasonable estimate for ${target}?`;
        key = mathProblemKey(ctx.practiceType, target, Number(correct), "estimate");
        choices = buildNumberChoices(Number(correct), 0, target * 2, ctx.rng);
        break;
      }
      case "place_value_puzzles":
      {
        const puzzleProblem = generatePlaceValueCompositionProblem(ctx.practiceType, ctx.rng);
        if (puzzleProblem.form !== "place_value_puzzles") {
          throw new Error("Generated the wrong place-value composition form");
        }
        key = puzzleProblem.problemKey;
        if (ctx.usedKeys.has(key)) continue;
        ctx.usedKeys.add(key);
        prompt = `Build the number with ${formatPlaceValueClues(puzzleProblem)}.`;
        correct = String(puzzleProblem.correctAnswer);
        choices = buildPlaceValueCompositionChoices(puzzleProblem, ctx.rng);
        break;
      }
      default: {
        const hiddenPlace = ctx.rng.nextInt(0, digits - 1);
        const hiddenValue = Math.floor(number / PLACE_VALUES[hiddenPlace]) % 10;
        const mask = [...String(number)];
        mask[digits - 1 - hiddenPlace] = "_";
        prompt = `What digit goes in the blank? ${mask.join("")}`;
        correct = String(hiddenValue);
        key = mathProblemKey(ctx.practiceType, number, hiddenPlace, "puzzle");
        choices = buildNumberChoices(hiddenValue, 0, 9, ctx.rng);
      }
    }

    if (!usesSharedCanonicalGenerator && ctx.usedKeys.has(key)) continue;
    if (!usesSharedCanonicalGenerator) ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-placevalue-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! The answer is ${correct}.`,
        visualEmoji: "🔢",
        choices,
      }),
    );
  }

  return problems;
};
