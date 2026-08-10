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
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";
import type { SeededRng } from "../../../practiceTypes/random";

const PLACE_VALUES = [1, 10, 100, 1000, 10000];
const LARGE_NUMBER_RANGE = { min: 1_000, max: 99_999 } as const;
const NUMBER_WORD_CHOICE_COUNT = 4;

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
      ctx.practiceType === "number_words";
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
        const terms: number[] = [];
        let n = number;
        let p = 1;
        while (n > 0) {
          const d = n % 10;
          if (d > 0) terms.push(d * p);
          n = Math.floor(n / 10);
          p *= 10;
        }
        prompt = `What is the expanded form of ${number}?`;
        correct = terms.join(" + ");
        key = mathProblemKey(ctx.practiceType, number, 0, "expanded");
        const wrong1 = terms.map((t, i) => (i === 0 ? t + 1 : t)).join(" + ");
        const wrong2 = terms.map((t, i) => (i === 0 ? t - 1 : t)).join(" + ");
        choices = ctx.rng.shuffle([correct, wrong1, wrong2]);
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
        prompt = `What number is shown by ${number} unit squares?`;
        correct = String(number);
        key = mathProblemKey(ctx.practiceType, number, 0, "base_ten");
        choices = buildNumberChoices(number, number - 50, number + 50, ctx.rng);
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
