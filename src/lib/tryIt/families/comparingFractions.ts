import type { TryItFamily, TryItAnswerPart } from "../types";
import { makeTryItProblem } from "../buildTryItProblem";

type FractionRule = "like_denominator" | "like_numerator";
type ReasonChoices = { correct: string; reversed: string; other: string };

function compareSymbol(a: number, b: number): string {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
}

function comparisonSentence(aFrac: string, bFrac: string, aVal: number, bVal: number): string {
  return `${aFrac} ${compareSymbol(aVal, bVal)} ${bFrac}`;
}

function largerFraction(aFrac: string, bFrac: string, aVal: number, bVal: number): string {
  return aVal > bVal ? aFrac : bFrac;
}

function smallerFraction(aFrac: string, bFrac: string, aVal: number, bVal: number): string {
  return aVal > bVal ? bFrac : aFrac;
}

function likeDenominatorReason(
  aNum: number,
  aDen: number,
  bNum: number,
  aVal: number,
  bVal: number,
): ReasonChoices {
  const largerNum = aVal > bVal ? aNum : bNum;
  const smallerNum = aVal > bVal ? bNum : aNum;
  return {
    correct: `The pieces are the same size because both fractions have a denominator of ${aDen}. ${moreThanPhrase(largerNum, smallerNum)}.`,
    reversed: `The pieces are the same size because both fractions have a denominator of ${aDen}. ${moreThanPhrase(smallerNum, largerNum)}.`,
    other: `The numerators are the same, so the fraction with the smaller denominator is larger.`,
  };
}

function likeNumeratorReason(
  aNum: number,
  aDen: number,
  bDen: number,
  aFrac: string,
  bFrac: string,
  aVal: number,
  bVal: number,
): ReasonChoices {
  const largerFrac = aVal > bVal ? aFrac : bFrac;
  const smallerDen = aVal > bVal ? aDen : bDen;
  const largerDen = aVal > bVal ? bDen : aDen;
  return {
    correct: `Both fractions have a numerator of ${aNum}. The fraction with the smaller denominator (${smallerDen}) has larger pieces, so ${largerFrac} is larger.`,
    reversed: `Both fractions have a numerator of ${aNum}. The fraction with the larger denominator (${largerDen}) has larger pieces.`,
    other: `The denominators are the same, so the fraction with the larger numerator is larger.`,
  };
}

function fractionProblemKey(
  practiceType: string,
  aNum: number,
  aDen: number,
  bNum: number,
  bDen: number,
  form: string,
): string {
  return `${practiceType}:${aNum}/${aDen}:${bNum}/${bDen}:${form}`;
}

const FOODS: [string, string][] = [
  ["pizza", "pizzas"],
  ["cake", "cakes"],
  ["pie", "pies"],
  ["cookie", "cookies"],
  ["sandwich", "sandwiches"],
];
const NAME_PAIRS: [string, string][] = [
  ["Maya", "Ava"],
  ["Sam", "Mia"],
  ["Tara", "Ben"],
  ["Lily", "Alex"],
  ["Ana", "Noah"],
];

function partWord(n: number): string {
  return n === 1 ? "part" : "parts";
}

function moreThanPhrase(larger: number, smaller: number): string {
  const largerVerb = larger === 1 ? "is" : "are";
  return `${larger} ${partWord(larger)} ${largerVerb} more than ${smaller} ${partWord(smaller)}`;
}

function pickWordProblemContext(rng: { pick<T>(items: readonly T[]): T }): {
  singular: string;
  nameA: string;
  nameB: string;
} {
  const [nameA, nameB] = rng.pick(NAME_PAIRS);
  const [singular] = rng.pick(FOODS);
  return { singular, nameA, nameB };
}

export const comparingFractionsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  const isLikeDenominator =
    ctx.practiceType.includes("like_denominators") ||
    ctx.practiceType === "use_comparison_symbols" ||
    ctx.lesson.skills.includes("like_denominators");

  const isLikeNumerator =
    ctx.practiceType.includes("like_numerators") || ctx.lesson.skills.includes("like_numerators");

  const isSameWhole = ctx.practiceType === "same_whole_fractions";
  const isWordProblem = ctx.practiceType.startsWith("comparison_word_problems");
  const isExplain = ctx.practiceType === "compare_explain_fractions";

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;

    let rule: FractionRule;
    if (isLikeDenominator) {
      rule = "like_denominator";
    } else if (isLikeNumerator) {
      rule = "like_numerator";
    } else if (isSameWhole || isExplain || ctx.practiceType.startsWith("compare_")) {
      rule = ctx.rng.pick(["like_denominator", "like_numerator"] as const);
    } else {
      rule = ctx.rng.pick(["like_denominator", "like_numerator"] as const);
    }

    let aNum: number;
    let aDen: number;
    let bNum: number;
    let bDen: number;

    if (rule === "like_denominator") {
      aDen = ctx.rng.nextInt(3, 8);
      aNum = ctx.rng.nextInt(1, aDen - 1);
      bNum = ctx.rng.nextInt(1, aDen - 1);
      if (aNum === bNum) continue;
      bDen = aDen;
    } else {
      aNum = ctx.rng.nextInt(1, 4);
      aDen = ctx.rng.nextInt(aNum + 1, 8);
      bDen = ctx.rng.nextInt(aNum + 1, 8);
      if (aDen === bDen) continue;
      bNum = aNum;
    }

    if (aNum / aDen === bNum / bDen) continue;

    const aFrac = `${aNum}/${aDen}`;
    const bFrac = `${bNum}/${bDen}`;
    const aVal = aNum / aDen;
    const bVal = bNum / bDen;
    const larger = largerFraction(aFrac, bFrac, aVal, bVal);
    const smaller = smallerFraction(aFrac, bFrac, aVal, bVal);

    let prompt: string;
    let form: string;
    let parts: TryItAnswerPart[];
    let successMessage: string;

    if (
      ctx.practiceType === "compare_like_denominators_models" ||
      ctx.practiceType === "compare_like_numerators_models"
    ) {
      prompt = `The area model shows two fractions: ${aFrac} and ${bFrac}. Which fraction is larger?`;
      form = `model:${rule}`;
      parts = [
        {
          key: "answer",
          label: "Your answer",
          correctAnswer: larger,
          choices: ctx.rng.shuffle([larger, smaller]),
        },
      ];
      successMessage = `Yes! ${larger} is larger than ${smaller}.`;
    } else if (
      ctx.practiceType === "compare_like_denominators_number_line" ||
      ctx.practiceType === "compare_like_numerators_number_line"
    ) {
      prompt = `The fractions ${aFrac} and ${bFrac} are on the same number line from 0 to 1. Which fraction is farther to the right (larger)?`;
      form = `number_line:${rule}`;
      parts = [
        {
          key: "answer",
          label: "Your answer",
          correctAnswer: larger,
          choices: ctx.rng.shuffle([larger, smaller]),
        },
      ];
      successMessage = `Yes! ${larger} is farther to the right than ${smaller}.`;
    } else if (ctx.practiceType === "use_comparison_symbols") {
      prompt = `Compare: ${aFrac} ___ ${bFrac}`;
      form = `symbol:${rule}`;
      const correct = compareSymbol(aVal, bVal);
      parts = [
        {
          key: "answer",
          label: "Your answer",
          correctAnswer: correct,
          choices: ctx.rng.shuffle(["<", ">", "="]),
        },
      ];
      successMessage = `Yes! ${aFrac} ${correct} ${bFrac}.`;
    } else if (isWordProblem) {
      const { singular, nameA, nameB } = pickWordProblemContext(ctx.rng);
      prompt = `${nameA} ate ${aFrac} of a ${singular}. ${nameB} ate ${bFrac} of the same-size ${singular}. Who ate more?`;
      form = `word_problem:${rule}`;
      const winner = aVal > bVal ? nameA : nameB;
      const reason = likeDenominatorReason(aNum, aDen, bNum, aVal, bVal);
      parts = [
        {
          key: "who",
          label: "Who ate more?",
          correctAnswer: winner,
          choices: ctx.rng.shuffle([nameA, nameB, "They ate the same amount"]),
        },
        {
          key: "why",
          label: "Why?",
          correctAnswer: reason.correct,
          choices: ctx.rng.shuffle([reason.correct, reason.reversed, reason.other]),
        },
      ];
      successMessage = `Yes! ${winner} ate more because ${aFrac} ${compareSymbol(aVal, bVal)} ${bFrac}.`;
    } else if (isSameWhole) {
      const sameWhole = ctx.rng.nextInt(0, 1) === 0;
      const [singular, plural] = ctx.rng.pick(FOODS);
      form = sameWhole ? `same_whole_same:${rule}` : `same_whole_different:${rule}`;
      if (sameWhole) {
        prompt = `Two same-size ${plural} are shown. One has ${aFrac} shaded. The other has ${bFrac} shaded. Which fraction is larger?`;
        parts = [
          {
            key: "answer",
            label: "Your answer",
            correctAnswer: larger,
            choices: ctx.rng.shuffle([larger, smaller]),
          },
        ];
        successMessage = `Yes! ${larger} is larger than ${smaller} because the wholes are the same size.`;
      } else {
        const [sizeA, sizeB] = ctx.rng.shuffle(["small", "large"]);
        prompt = `A ${sizeA} ${singular} has ${aFrac} shaded. A ${sizeB} ${singular} has ${bFrac} shaded. Can you tell which shaded amount is larger?`;
        const cannotTell =
          "Cannot tell which shaded amount is larger because the wholes are different sizes";
        const largerFraction = `The one with the larger fraction (${larger})`;
        const smallerFraction = `The one with the smaller fraction (${smaller})`;
        parts = [
          {
            key: "answer",
            label: "Your answer",
            correctAnswer: cannotTell,
            choices: ctx.rng.shuffle([cannotTell, largerFraction, smallerFraction]),
          },
        ];
        successMessage = `Yes! You cannot tell which shaded amount is larger because the wholes are different sizes. The fractions themselves can still be compared.`;
      }
    } else if (isExplain) {
      prompt = `Compare ${aFrac} and ${bFrac}. Which comparison is correct?`;
      form = `explain:${rule}`;
      const correctSentence = comparisonSentence(aFrac, bFrac, aVal, bVal);
      const oppositeSentence = `${aFrac} ${compareSymbol(bVal, aVal)} ${bFrac}`;
      const equalSentence = `${aFrac} = ${bFrac}`;
      const reason =
        rule === "like_denominator"
          ? likeDenominatorReason(aNum, aDen, bNum, aVal, bVal)
          : likeNumeratorReason(aNum, aDen, bDen, aFrac, bFrac, aVal, bVal);
      parts = [
        {
          key: "comparison",
          label: "Which comparison is correct?",
          correctAnswer: correctSentence,
          choices: ctx.rng.shuffle([correctSentence, oppositeSentence, equalSentence]),
        },
        {
          key: "reason",
          label: "Why is this comparison true?",
          correctAnswer: reason.correct,
          choices: ctx.rng.shuffle([reason.correct, reason.reversed, reason.other]),
        },
      ];
      successMessage = `Yes! ${correctSentence} because ${reason.correct}`;
    } else {
      // Fallback: symbolic comparison.
      prompt = `Compare: ${aFrac} ___ ${bFrac}`;
      form = `symbol:${rule}`;
      const correct = compareSymbol(aVal, bVal);
      parts = [
        {
          key: "answer",
          label: "Your answer",
          correctAnswer: correct,
          choices: ctx.rng.shuffle(["<", ">", "="]),
        },
      ];
      successMessage = `Yes! ${aFrac} ${correct} ${bFrac}.`;
    }

    const key = fractionProblemKey(ctx.practiceType, aNum, aDen, bNum, bDen, form);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeTryItProblem({
        id: `${ctx.lessonId}-compare-fracs-${problems.length + 1}`,
        problemKey: key,
        prompt,
        tip: ctx.lesson.objective,
        successMessage,
        visualEmoji: "🍕",
        parts,
      }),
    );
  }

  return problems;
};
