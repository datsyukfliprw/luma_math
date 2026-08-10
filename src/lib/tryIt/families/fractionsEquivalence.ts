import type { TryItFamily } from "../types";
import { makeSinglePartTryItProblem, mathProblemKey } from "../buildTryItProblem";

// Number-line / interval lessons only use proper fractions between 0 and 1.

function formatFraction(numerator: number, denominator: number): string {
  return `${numerator}/${denominator}`;
}

function areEquivalent(aNum: number, aDen: number, bNum: number, bDen: number): boolean {
  return aNum * bDen === bNum * aDen;
}

function reducedFraction(num: number, den: number): [number, number] {
  let a = num;
  let b = den;
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  const g = a || 1;
  return [num / g, den / g];
}

function nonEquivalentDistractor(
  targetNum: number,
  targetDen: number,
  rng: { nextInt(min: number, max: number): number },
): { num: number; den: number } {
  let guard = 0;
  while (guard < 200) {
    guard += 1;
    const den = rng.nextInt(2, 8);
    const num = rng.nextInt(1, den - 1);
    if (!areEquivalent(num, den, targetNum, targetDen)) {
      return { num, den };
    }
  }
  return targetNum === 1 && targetDen === 2 ? { num: 2, den: 3 } : { num: 1, den: 2 };
}

function buildFractionChoices(
  correctNum: number,
  correctDen: number,
  rng: { nextInt(min: number, max: number): number; shuffle<T>(items: readonly T[]): T[] },
  count = 3,
  fixedDen?: number,
): string[] {
  const correct = formatFraction(correctNum, correctDen);
  const choices = new Set<string>([correct]);

  if (fixedDen !== undefined) {
    const nums = rng.shuffle(Array.from({ length: fixedDen - 1 }, (_, i) => i + 1));
    for (const n of nums) {
      if (choices.size >= count) break;
      if (n === correctNum && fixedDen === correctDen) continue;
      if (!areEquivalent(n, fixedDen, correctNum, correctDen)) {
        choices.add(formatFraction(n, fixedDen));
      }
    }
  }

  let guard = 0;
  while (choices.size < count && guard < 200) {
    guard += 1;
    const den = rng.nextInt(2, 8);
    const num = rng.nextInt(1, den - 1);
    if (!areEquivalent(num, den, correctNum, correctDen)) {
      choices.add(formatFraction(num, den));
    }
  }
  return rng.shuffle([...choices]);
}

function buildNumberChoices(
  correct: number,
  rng: { nextInt(min: number, max: number): number; shuffle<T>(items: readonly T[]): T[] },
): string[] {
  const candidates = [correct - 1, correct + 1, correct + 2].filter((n) => n >= 2 && n !== correct);
  const wrongs = rng.shuffle([...new Set(candidates)]).slice(0, 2);
  return rng.shuffle([String(correct), ...wrongs.map(String)]);
}

export const fractionsEquivalenceFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;

    let denominator: number;
    let numerator: number;

    if (ctx.practiceType === "locate_unit_fractions_number_line") {
      denominator = ctx.rng.nextInt(2, 8);
      numerator = 1;
    } else if (ctx.practiceType === "locate_non_unit_fractions_number_line") {
      denominator = ctx.rng.nextInt(3, 8);
      numerator = ctx.rng.nextInt(2, denominator - 1);
    } else {
      denominator = ctx.rng.nextInt(2, 8);
      numerator = ctx.rng.nextInt(1, denominator - 1);
    }

    const multiplier = ctx.rng.nextInt(2, 3);
    const equivalentNumerator = numerator * multiplier;
    const equivalentDenominator = denominator * multiplier;

    const usesEquivalent =
      ctx.practiceType !== "zero_to_one_interval" &&
      ctx.practiceType !== "partition_number_lines" &&
      ctx.practiceType !== "locate_unit_fractions_number_line" &&
      ctx.practiceType !== "locate_non_unit_fractions_number_line";
    if (usesEquivalent && equivalentDenominator > 12) continue;

    const fraction = formatFraction(numerator, denominator);
    const equivalent = formatFraction(equivalentNumerator, equivalentDenominator);

    let prompt: string;
    let correct: string;
    let choices: string[];
    let form: string;
    let extra: string;
    let successMessage: string;

    if (ctx.practiceType === "zero_to_one_interval") {
      const unit = numerator === 1 ? "space" : "spaces";
      prompt = `A number line from 0 to 1 is divided into ${denominator} equal parts. Which fraction is ${numerator} ${unit} from 0?`;
      correct = fraction;
      form = "interval";
      choices = buildFractionChoices(numerator, denominator, ctx.rng);
      extra = `pos${fraction}`;
      successMessage = `Yes! ${correct} is correct.`;
    } else if (ctx.practiceType === "partition_number_lines") {
      prompt = `How many equal parts should a number line from 0 to 1 have to show ${fraction}?`;
      correct = String(denominator);
      form = "partition";
      choices = buildNumberChoices(denominator, ctx.rng);
      extra = `frac${fraction}`;
      successMessage = `Yes! ${correct} equal parts are needed.`;
    } else if (ctx.practiceType === "locate_unit_fractions_number_line") {
      prompt = `On a number line from 0 to 1 divided into ${denominator} equal parts, which tick mark is the unit fraction ${fraction}?`;
      correct = fraction;
      form = "locate_unit";
      choices = buildFractionChoices(numerator, denominator, ctx.rng);
      extra = `pos${fraction}:den${denominator}`;
      successMessage = `Yes! ${correct} is the unit fraction.`;
    } else if (ctx.practiceType === "locate_non_unit_fractions_number_line") {
      prompt = `On a number line from 0 to 1 divided into ${denominator} equal parts, which tick mark is ${fraction}?`;
      correct = fraction;
      form = "locate_nonunit";
      choices = buildFractionChoices(numerator, denominator, ctx.rng);
      extra = `pos${fraction}:den${denominator}`;
      successMessage = `Yes! ${correct} is at ${numerator} space${numerator === 1 ? "" : "s"} from 0.`;
    } else if (ctx.practiceType === "equivalence_same_amount") {
      const isSame = ctx.rng.nextInt(0, 1) === 1;
      let secondNum: number;
      let secondDen: number;
      let answer: "yes" | "no";
      if (isSame) {
        secondNum = equivalentNumerator;
        secondDen = equivalentDenominator;
        answer = "yes";
      } else {
        const d = nonEquivalentDistractor(numerator, denominator, ctx.rng);
        secondNum = d.num;
        secondDen = d.den;
        answer = "no";
      }
      const second = formatFraction(secondNum, secondDen);
      prompt = `Do ${fraction} and ${second} name the same amount?`;
      correct = answer;
      form = "same_amount";
      choices = ctx.rng.shuffle(["yes", "no"]);
      extra = `second${second}:ans${answer}`;
      successMessage =
        answer === "yes"
          ? "Yes! They name the same amount."
          : "No! They do not name the same amount.";
    } else if (ctx.practiceType === "fraction_strips_equivalence") {
      prompt = `A ${fraction} fraction strip lines up with an equivalent strip made of 1/${equivalentDenominator} pieces. What fraction is equivalent to ${fraction}?`;
      correct = equivalent;
      form = "strip";
      choices = buildFractionChoices(
        equivalentNumerator,
        equivalentDenominator,
        ctx.rng,
        3,
        equivalentDenominator,
      );
      extra = `m${multiplier}:eq${equivalent}`;
      successMessage = `Yes! ${equivalent} is the same length as ${fraction}.`;
    } else if (ctx.practiceType === "area_models_equivalence") {
      prompt = `An area model shows ${fraction} of the same whole shaded. An equivalent model is split into ${equivalentDenominator} equal parts. What fraction is shaded in the equivalent model?`;
      correct = equivalent;
      form = "area";
      choices = buildFractionChoices(
        equivalentNumerator,
        equivalentDenominator,
        ctx.rng,
        3,
        equivalentDenominator,
      );
      extra = `m${multiplier}:eq${equivalent}`;
      successMessage = `Yes! ${equivalent} shows the same shaded amount as ${fraction}.`;
    } else if (ctx.practiceType === "generate_explain_equivalent") {
      const wrongDistractor = nonEquivalentDistractor(
        equivalentNumerator,
        equivalentDenominator,
        ctx.rng,
      );
      const wrongFraction = formatFraction(wrongDistractor.num, wrongDistractor.den);
      const correctPhrase = `${equivalent} — the numerator and denominator are both multiplied by ${multiplier}`;
      const wrongReasonPhrase = `${wrongFraction} — the numerator and denominator are both multiplied by ${multiplier}`;
      const wrongSameFracPhrase = `${equivalent} — add ${multiplier} to the numerator and denominator`;
      prompt = `Which statement gives an equivalent fraction for ${fraction} and explains why?`;
      correct = correctPhrase;
      form = "explain";
      choices = ctx.rng.shuffle([correctPhrase, wrongReasonPhrase, wrongSameFracPhrase]);
      extra = `m${multiplier}:eq${equivalent}`;
      successMessage = `Yes! ${equivalent} is equivalent to ${fraction} because the numerator and denominator are both multiplied by ${multiplier}.`;
    } else if (ctx.practiceType === "same_location_number_line") {
      prompt = `Which fraction is at the same point as ${fraction} on a number line from 0 to 1?`;
      correct = equivalent;
      form = "same_location";
      choices = buildFractionChoices(equivalentNumerator, equivalentDenominator, ctx.rng);
      extra = `m${multiplier}:eq${equivalent}`;
      successMessage = `Yes! ${equivalent} is at the same point as ${fraction}.`;
    } else if (ctx.practiceType === "find_equivalents_number_line") {
      prompt = `A number line from 0 to 1 is divided into ${equivalentDenominator} equal parts. What fraction is at the same point as ${fraction}?`;
      correct = equivalent;
      form = "find_equivalent";
      choices = buildFractionChoices(
        equivalentNumerator,
        equivalentDenominator,
        ctx.rng,
        3,
        equivalentDenominator,
      );
      extra = `m${multiplier}:target${equivalentDenominator}:eq${equivalent}`;
      successMessage = `Yes! ${equivalent} is equivalent to ${fraction}.`;
    } else if (ctx.practiceType === "graph_equivalent_fractions") {
      const [redNum, redDen] = reducedFraction(numerator, denominator);
      const reduced = formatFraction(redNum, redDen);
      prompt = `Where do ${fraction} and ${equivalent} both land on a number line from 0 to 1?`;
      correct = reduced;
      form = "graph";
      choices = buildFractionChoices(redNum, redDen, ctx.rng);
      extra = `m${multiplier}:eq${equivalent}:red${reduced}`;
      successMessage = `Yes! ${fraction} and ${equivalent} both land at ${reduced}.`;
    } else if (ctx.practiceType === "connect_models_number_lines_equations") {
      const [redNum, redDen] = reducedFraction(numerator, denominator);
      const reduced = formatFraction(redNum, redDen);
      prompt = `A fraction strip, an area model, a number line, and the equation ${fraction} = ${equivalent} all show the same amount. What simplest fraction do they name?`;
      correct = reduced;
      form = "connect";
      choices = buildFractionChoices(redNum, redDen, ctx.rng);
      extra = `m${multiplier}:eq${equivalent}:red${reduced}`;
      successMessage = `Yes! All the representations name ${reduced}.`;
    } else {
      prompt = `Which fraction is equivalent to ${fraction}?`;
      correct = equivalent;
      form = "equivalent";
      choices = buildFractionChoices(equivalentNumerator, equivalentDenominator, ctx.rng);
      extra = `m${multiplier}:eq${equivalent}`;
      successMessage = `Yes! ${equivalent} is equivalent to ${fraction}.`;
    }

    const key = mathProblemKey(ctx.practiceType, numerator, denominator, form, extra);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-fractions-equiv-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage,
        visualEmoji: "🍕",
        choices,
      }),
    );
  }

  return problems;
};
