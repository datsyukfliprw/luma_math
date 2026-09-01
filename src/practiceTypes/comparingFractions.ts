import {
  compareFractions,
  comparisonSymbol,
  createProperFractionState,
  formatFraction,
  fractionPairProblemKey,
  type FractionState,
} from "../lib/fractions/core";
import { createSeededRng, type SeededRng } from "./random";
import {
  buildUniqueFractionProblems,
  getFractionSeed,
  getFractionTargetCount,
  stringChoices,
} from "./fractionsShared";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const COMPARING_FRACTIONS_PRACTICE_TYPES = [
  "compare_like_denominators_models",
  "compare_like_denominators_number_line",
  "use_comparison_symbols",
  "comparison_word_problems_like_denominators",
  "compare_like_numerators_models",
  "compare_like_numerators_number_line",
  "same_whole_fractions",
  "compare_explain_fractions",
] as const;

export type ComparingFractionsPracticeType =
  (typeof COMPARING_FRACTIONS_PRACTICE_TYPES)[number];

type ComparisonRule = "like-denominator" | "like-numerator";
type Pair = { a: FractionState; b: FractionState; rule: ComparisonRule };

const NAME_PAIRS = [
  ["Maya", "Ava"],
  ["Sam", "Mia"],
  ["Tara", "Ben"],
  ["Lily", "Alex"],
  ["Ana", "Noah"],
] as const;
const FOODS = ["pizza", "cake", "pie", "sandwich"] as const;

function randomComparisonPair(rule: ComparisonRule, rng: SeededRng): Pair {
  if (rule === "like-denominator") {
    const denominator = rng.nextInt(3, 8);
    const aNumerator = rng.nextInt(1, denominator - 1);
    let bNumerator = rng.nextInt(1, denominator - 1);
    if (aNumerator === bNumerator) {
      bNumerator = bNumerator === denominator - 1 ? bNumerator - 1 : bNumerator + 1;
    }
    return {
      a: createProperFractionState(aNumerator, denominator),
      b: createProperFractionState(bNumerator, denominator),
      rule,
    };
  }

  const numerator = rng.nextInt(1, 4);
  const denominators = Array.from({ length: 8 - numerator }, (_, index) => numerator + 1 + index);
  const shuffled = rng.shuffle(denominators);
  return {
    a: createProperFractionState(numerator, shuffled[0]),
    b: createProperFractionState(numerator, shuffled[1]),
    rule,
  };
}

function largerFraction(pair: Pair): FractionState {
  return compareFractions(pair.a, pair.b) > 0 ? pair.a : pair.b;
}

function smallerFraction(pair: Pair): FractionState {
  return compareFractions(pair.a, pair.b) > 0 ? pair.b : pair.a;
}

function comparisonReason(pair: Pair): string {
  const aText = formatFraction(pair.a);
  const bText = formatFraction(pair.b);
  const larger = formatFraction(largerFraction(pair));
  if (pair.rule === "like-denominator") {
    return `${aText} and ${bText} have equal-size parts, so the fraction with more parts (${larger}) is larger`;
  }
  const smallerDenominator = Math.min(pair.a.denominator, pair.b.denominator);
  return `${aText} and ${bText} have the same numerator, so the fraction with denominator ${smallerDenominator} has larger parts and is larger`;
}

function wrongReasons(pair: Pair): string[] {
  const aText = formatFraction(pair.a);
  const bText = formatFraction(pair.b);
  const smaller = formatFraction(smallerFraction(pair));
  return [
    `${smaller} is larger because its number is written second`,
    `${aText} and ${bText} must be equal because they each have two numbers`,
    pair.rule === "like-denominator"
      ? "The fraction with the smaller numerator is always larger"
      : "The fraction with the larger denominator has larger pieces",
    "Fractions can only be compared when both numerator and denominator match",
  ];
}

function ruleForPracticeType(practiceType: ComparingFractionsPracticeType, rng: SeededRng): ComparisonRule {
  if (
    practiceType.includes("like_denominators") ||
    practiceType === "use_comparison_symbols" ||
    practiceType === "comparison_word_problems_like_denominators"
  ) {
    return "like-denominator";
  }
  if (practiceType.includes("like_numerators")) return "like-numerator";
  return rng.pick(["like-denominator", "like-numerator"] as const);
}

export function generateComparingFractionsProblems(
  practiceType: ComparingFractionsPracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getFractionTargetCount(options);
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const sameWholeSchedule = practiceType === "same_whole_fractions"
    ? rng.shuffle(Array.from({ length: count }, (_, index) => index % 2 === 0))
    : [];

  return buildUniqueFractionProblems(count, 900, (index) => {
    const rule = ruleForPracticeType(practiceType, rng);
    const pair = randomComparisonPair(rule, rng);
    const aText = formatFraction(pair.a);
    const bText = formatFraction(pair.b);
    const larger = formatFraction(largerFraction(pair));
    const smaller = formatFraction(smallerFraction(pair));
    let questionText: string;
    let correctAnswer: string;
    let task: string;
    let choices: string[];
    let extra: string | undefined;

    if (practiceType === "use_comparison_symbols") {
      correctAnswer = comparisonSymbol(pair.a, pair.b);
      questionText = `Compare ${aText} ___ ${bText}. Which symbol makes the statement true?`;
      task = "comparison-symbol";
      choices = rng.shuffle(["<", ">", "="]);
    } else if (practiceType === "comparison_word_problems_like_denominators") {
      const [nameA, nameB] = rng.pick(NAME_PAIRS);
      const food = rng.pick(FOODS);
      correctAnswer = compareFractions(pair.a, pair.b) > 0 ? nameA : nameB;
      questionText = `${nameA} ate ${aText} of a ${food}. ${nameB} ate ${bText} of the same-size ${food}. Who ate more?`;
      task = "word-problem-larger";
      choices = rng.shuffle([nameA, nameB, "They ate the same amount"]);
    } else if (practiceType === "same_whole_fractions") {
      const sameWhole = sameWholeSchedule[index];
      extra = `sameWhole=${sameWhole}`;
      task = "same-whole-reasoning";
      if (sameWhole) {
        correctAnswer = larger;
        questionText = `Two same-size wholes have ${aText} and ${bText} shaded. Which shaded fraction is larger?`;
        choices = rng.shuffle([larger, smaller, "They are equal"]);
      } else {
        correctAnswer = "Cannot determine the larger shaded amount because the wholes are different sizes";
        questionText = `A small whole has ${aText} shaded and a large whole has ${bText} shaded. Can the fractions alone tell which shaded amount is physically larger?`;
        choices = stringChoices(
          correctAnswer,
          [
            `${larger} must have the larger shaded amount`,
            `${smaller} must have the larger shaded amount`,
            "The shaded amounts must be equal",
          ],
          rng,
        );
      }
    } else if (practiceType === "compare_explain_fractions") {
      const symbol = comparisonSymbol(pair.a, pair.b);
      const reason = comparisonReason(pair);
      correctAnswer = `${aText} ${symbol} ${bText}; ${reason}`;
      questionText = `Which comparison and explanation for ${aText} and ${bText} are both correct?`;
      task = `compare-explain-${rule}`;
      choices = stringChoices(
        correctAnswer,
        [
          `${aText} ${symbol === ">" ? "<" : ">"} ${bText}; ${wrongReasons(pair)[0]}`,
          `${aText} = ${bText}; ${wrongReasons(pair)[1]}`,
          `${aText} ${symbol} ${bText}; ${wrongReasons(pair)[2]}`,
          `${aText} ${symbol === ">" ? "<" : ">"} ${bText}; ${wrongReasons(pair)[3]}`,
        ],
        rng,
      );
    } else {
      correctAnswer = larger;
      const isNumberLine = practiceType.endsWith("number_line");
      questionText = isNumberLine
        ? `${aText} and ${bText} are on the same number line from 0 to 1. Which fraction is farther right?`
        : `Two equal-size area models show ${aText} and ${bText}. Which fraction is larger?`;
      task = isNumberLine ? `number-line-larger-${rule}` : `model-larger-${rule}`;
      choices = rng.shuffle([larger, smaller, "They are equal"]);
    }

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer,
      visualType: "multiple_choice",
      problemKey: fractionPairProblemKey(practiceType, pair.a, pair.b, task, extra),
      visualData: {
        equation: `${aText} ${comparisonSymbol(pair.a, pair.b)} ${bText}`,
        sourceDescription: `${rule}: ${aText} and ${bText}`,
        choices,
      },
    };
  });
}
