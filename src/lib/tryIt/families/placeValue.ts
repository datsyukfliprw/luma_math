import type { TryItFamily } from "../types";
import { getDigitValueDistractorCandidates } from "../../placeValue/distractors";
import { generateDigitValueProblem } from "../../placeValue/generator";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

const PLACES = ["ones", "tens", "hundreds", "thousands", "ten thousands"];
const PLACE_VALUES = [1, 10, 100, 1000, 10000];

function numberToWords(n: number): string {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? tens[t] : `${tens[t]}-${ones[o]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return rest === 0 ? `${ones[h]} hundred` : `${ones[h]} hundred ${numberToWords(rest)}`;
  }
  const t = Math.floor(n / 1000);
  const rest = n % 1000;
  return rest === 0
    ? `${numberToWords(t)} thousand`
    : `${numberToWords(t)} thousand ${numberToWords(rest)}`;
}

export const placeValueFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const usesSharedDigitValue = ctx.practiceType === "place_value_digits";
    const digits = usesSharedDigitValue ? 0 : ctx.rng.nextInt(2, 5);
    const max = usesSharedDigitValue ? 0 : 10 ** digits - 1;
    const min = usesSharedDigitValue ? 0 : 10 ** (digits - 1);
    const number = usesSharedDigitValue ? 0 : ctx.rng.nextInt(min, max);

    let prompt: string;
    let correct: string;
    let key: string;
    let choices: string[] | undefined;

    switch (ctx.practiceType) {
      case "large_digit_value":
      {
        const placeIndex = ctx.rng.nextInt(0, digits - 1);
        const placeName = PLACES[placeIndex];
        const digit = Math.floor(number / PLACE_VALUES[placeIndex]) % 10;
        prompt = `In the number ${number}, what is the value of the ${placeName} digit?`;
        correct = String(digit * PLACE_VALUES[placeIndex]);
        key = mathProblemKey(ctx.practiceType, number, placeIndex, "digit_value");
        choices = buildNumberChoices(Number(correct), 0, PLACE_VALUES[placeIndex] * 9, ctx.rng);
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
        prompt = `Which number is "${numberToWords(number)}"?`;
        correct = String(number);
        key = mathProblemKey(ctx.practiceType, number, 0, "number_words");
        const distractors = new Set([
          String(number + ctx.rng.nextInt(1, 10)),
          String(number - ctx.rng.nextInt(1, 10)),
          String(number + 100),
        ]);
        distractors.delete(correct);
        choices = ctx.rng.shuffle([correct, ...distractors].slice(0, 4));
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

    if (!usesSharedDigitValue && ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

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
