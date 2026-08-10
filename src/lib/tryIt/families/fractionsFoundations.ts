import type { TryItFamily } from "../types";
import { makeSinglePartTryItProblem, mathProblemKey } from "../buildTryItProblem";

const SHAPES = ["circle", "rectangle", "square", "pizza", "chocolate bar"];

function fractionPrompt(
  denominator: number,
  numerator: number,
  ctx: {
    rng: {
      nextInt(min: number, max: number): number;
      pick<T>(items: T[]): T;
      shuffle<T>(items: T[]): T[];
    };
  },
): { prompt: string; correct: string; choices: string[]; form: string } {
  const whole = ctx.rng.pick(SHAPES);
  const fraction = `${numerator}/${denominator}`;

  const numeratorChoice = numerator.toString();
  const denominatorChoice = denominator.toString();
  const fractionChoice = fraction;

  const choices = ctx.rng
    .shuffle([...new Set([fractionChoice, numeratorChoice, denominatorChoice])])
    .slice(0, 3);

  return {
    prompt: `A ${whole} is cut into ${denominator} equal parts. ${numerator} part(s) are shaded. Which fraction is shaded?`,
    correct: fractionChoice,
    choices,
    form: "name",
  };
}

export const fractionsFoundationsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  function allowedDenominator(): number {
    if (ctx.practiceType === "halves_thirds_fourths") {
      return ctx.rng.pick([2, 3, 4]);
    }
    if (ctx.practiceType === "sixths_eighths") {
      return ctx.rng.pick([6, 8]);
    }
    if (ctx.practiceType === "name_unit_fractions") {
      return ctx.rng.pick([2, 3, 4, 5, 6, 8]);
    }
    return ctx.rng.nextInt(2, 8);
  }

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const denominator = allowedDenominator();
    const numerator = ctx.rng.nextInt(1, denominator - 1);
    let prompt = "";
    let correct = "";
    let choices: string[] | undefined;
    let form = "";

    if (ctx.practiceType === "equal_unequal_parts") {
      prompt = `Are ${denominator} equal parts of a shape the same size?`;
      correct = "Yes";
      form = "equal_parts";
      choices = ctx.rng.shuffle(["Yes", "No"]);
    } else if (
      ctx.practiceType === "halves_thirds_fourths" ||
      ctx.practiceType === "sixths_eighths" ||
      ctx.practiceType === "name_unit_fractions"
    ) {
      const result = fractionPrompt(denominator, 1, ctx);
      prompt = result.prompt;
      correct = result.correct;
      choices = result.choices;
      form = result.form;
    } else if (ctx.practiceType === "numerator_meaning") {
      prompt = `In the fraction ${numerator}/${denominator}, what does the numerator ${numerator} tell you?`;
      correct = `How many parts are shaded`;
      form = "numerator";
      choices = ctx.rng.shuffle([
        "How many parts are shaded",
        "How many parts in all",
        "The size of each part",
      ]);
    } else if (ctx.practiceType === "denominator_meaning") {
      prompt = `In the fraction ${numerator}/${denominator}, what does the denominator ${denominator} tell you?`;
      correct = `How many parts in all`;
      form = "denominator";
      choices = ctx.rng.shuffle([
        "How many parts in all",
        "How many parts are shaded",
        "The size of each part",
      ]);
    } else if (ctx.practiceType === "fraction_bars") {
      prompt = `A fraction bar shows ${numerator} out of ${denominator} equal parts shaded. Which fraction is it?`;
      correct = `${numerator}/${denominator}`;
      form = "bar";
      choices = ctx.rng.shuffle(
        [
          ...new Set([correct, `${denominator}/${numerator}`, `${numerator + 1}/${denominator}`]),
        ].slice(0, 3),
      );
    } else if (ctx.practiceType === "area_models_and_stories") {
      prompt = `A rectangle has ${denominator} equal parts and ${numerator} are shaded. What fraction is shaded?`;
      correct = `${numerator}/${denominator}`;
      form = "area";
      choices = ctx.rng.shuffle(
        [
          ...new Set([correct, `${denominator}/${numerator}`, `${numerator}/${denominator + 1}`]),
        ].slice(0, 3),
      );
    } else {
      const result = fractionPrompt(denominator, numerator, ctx);
      prompt = result.prompt;
      correct = result.correct;
      choices = result.choices;
      form = result.form;
    }

    const key = mathProblemKey(ctx.practiceType, numerator, denominator, form);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-fractions-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! The fraction is ${correct}.`,
        visualEmoji: "🍕",
        choices,
      }),
    );
  }

  return problems;
};
