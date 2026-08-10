import type { TryItFamily } from "../types";
import { makeSinglePartTryItProblem, mathProblemKey } from "../buildTryItProblem";

export const fractionsEquivalenceFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;

    // Number-line / interval lessons only use proper fractions between 0 and 1.
    const properOnly =
      ctx.practiceType.startsWith("locate_") ||
      ctx.practiceType === "zero_to_one_interval" ||
      ctx.practiceType === "partition_number_lines" ||
      ctx.practiceType === "same_location_number_line" ||
      ctx.practiceType === "find_equivalents_number_line" ||
      ctx.practiceType === "graph_equivalent_fractions";

    let numerator: number;
    let denominator: number;
    if (properOnly) {
      denominator = ctx.rng.nextInt(2, 8);
      numerator = ctx.rng.nextInt(1, denominator - 1);
    } else {
      denominator = ctx.rng.nextInt(2, 8);
      numerator = ctx.rng.nextInt(1, 4);
    }

    const multiplier = ctx.rng.nextInt(2, 4);
    const equivalentNumerator = numerator * multiplier;
    const equivalentDenominator = denominator * multiplier;
    const value = numerator / denominator;

    let prompt = "";
    let correct = "";
    let choices: string[] = [];
    let form = "";

    if (ctx.practiceType.startsWith("locate_")) {
      prompt = `Where is the fraction ${numerator}/${denominator} on a number line from 0 to 1?`;
      correct = String(value.toFixed(2));
      form = "locate";
      const higher = Math.min(0.99, value + 0.1).toFixed(2);
      const lower = Math.max(0.01, value - 0.1).toFixed(2);
      choices = ctx.rng.shuffle([...new Set([correct, higher, lower])]);
    } else if (
      ctx.practiceType.startsWith("equivalence") ||
      ctx.practiceType === "generate_explain_equivalent"
    ) {
      prompt = `Which fraction is equivalent to ${numerator}/${denominator}?`;
      correct = `${equivalentNumerator}/${equivalentDenominator}`;
      form = "equivalent";
      choices = ctx.rng.shuffle(
        [
          ...new Set([
            correct,
            `${equivalentNumerator}/${equivalentDenominator + 1}`,
            `${numerator + 1}/${denominator}`,
          ]),
        ].slice(0, 3),
      );
    } else if (
      ctx.practiceType === "same_location_number_line" ||
      ctx.practiceType === "find_equivalents_number_line"
    ) {
      prompt = `Which fraction has the same location on the number line as ${numerator}/${denominator}?`;
      correct = `${equivalentNumerator}/${equivalentDenominator}`;
      form = "same_location";
      choices = ctx.rng.shuffle(
        [
          ...new Set([
            correct,
            `${numerator + 1}/${denominator + multiplier}`,
            `${Math.max(1, equivalentNumerator - 1)}/${equivalentDenominator}`,
          ]),
        ].slice(0, 3),
      );
    } else if (ctx.practiceType === "graph_equivalent_fractions") {
      prompt = `Which fraction is at the same point as ${numerator}/${denominator} on a number line?`;
      correct = `${equivalentNumerator}/${equivalentDenominator}`;
      form = "graph";
      choices = ctx.rng.shuffle(
        [
          ...new Set([
            correct,
            `${numerator}/${denominator + multiplier}`,
            `${Math.max(1, equivalentNumerator - 1)}/${equivalentDenominator}`,
          ]),
        ].slice(0, 3),
      );
    } else if (ctx.practiceType === "connect_models_number_lines_equations") {
      prompt = `The equation ${numerator}/${denominator} = ${equivalentNumerator}/${equivalentDenominator} shows which idea?`;
      correct = "Equivalent fractions";
      form = "connect";
      choices = ctx.rng.shuffle([
        "Equivalent fractions",
        "Adding fractions",
        "Comparing fractions",
      ]);
    } else if (ctx.practiceType === "zero_to_one_interval") {
      prompt = `A number line from 0 to 1 is divided into ${denominator} equal parts. Which fraction is at the ${numerator} mark?`;
      correct = `${numerator}/${denominator}`;
      form = "interval";
      const wrong1 = `${numerator}/${denominator + 1}`;
      const wrong2 = `${Math.max(1, numerator - 1)}/${denominator}`;
      choices = ctx.rng.shuffle([...new Set([correct, wrong1, wrong2])]);
    } else if (ctx.practiceType === "partition_number_lines") {
      prompt = `How many equal parts should a number line from 0 to 1 have to show ${numerator}/${denominator}?`;
      correct = String(denominator);
      form = "partition";
      choices = ctx.rng.shuffle([
        correct,
        String(denominator + 1),
        String(Math.max(2, denominator - 1)),
      ]);
    } else {
      prompt = `Which fraction is equivalent to ${numerator}/${denominator}?`;
      correct = `${equivalentNumerator}/${equivalentDenominator}`;
      form = "equivalent";
      choices = ctx.rng.shuffle(
        [
          ...new Set([
            correct,
            `${equivalentNumerator}/${equivalentDenominator + 1}`,
            `${numerator + 1}/${denominator}`,
          ]),
        ].slice(0, 3),
      );
    }

    const key = mathProblemKey(
      ctx.practiceType,
      numerator,
      denominator,
      form,
      `m${multiplier}:eq${equivalentNumerator}/${equivalentDenominator}`,
    );
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-fractions-equiv-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! ${correct} is correct.`,
        visualEmoji: "🍕",
        choices,
      }),
    );
  }

  return problems;
};
