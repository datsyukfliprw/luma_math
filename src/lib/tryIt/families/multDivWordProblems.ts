import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

export const multDivWordProblemsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;
  const nouns = ["stickers", "markers", "sports balls", "building blocks", "toy cars", "erasers"];

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const groups = ctx.rng.nextInt(2, 9);
    const inEach = ctx.rng.nextInt(2, 9);
    const total = groups * inEach;
    const noun = ctx.rng.pick(nouns);
    let prompt = "";
    let correct = "";
    let form = "";
    let extra = "";

    if (ctx.practiceType === "strip_models") {
      prompt = `A strip model has ${groups} boxes with ${inEach} in each. What is the total?`;
      correct = String(total);
      form = "strip";
    } else if (ctx.practiceType === "equations_with_unknowns") {
      const missingFirst = ctx.rng.nextInt(0, 1) === 0;
      const known = missingFirst ? inEach : groups;
      const unknown = missingFirst ? groups : inEach;
      prompt = `${known} × ? = ${total}. What is the missing number?`;
      correct = String(unknown);
      form = missingFirst ? "unknown_groups" : "unknown_in_each";
      extra = `missing:${missingFirst ? "groups" : "inEach"}`;
    } else if (ctx.practiceType === "two_step_mult_div_patterns") {
      const factor2 = ctx.rng.nextInt(2, 5);
      const product2 = total * factor2;
      prompt = `There are ${groups} groups of ${inEach} ${noun}. Each ${noun} costs ${factor2} cents. How many cents in all?`;
      correct = String(product2);
      form = "two_step";
      extra = `cost:${factor2}`;
    } else if (ctx.practiceType === "equal_group_array_problems") {
      prompt = `An array has ${groups} rows and ${inEach} columns. How many ${noun} are there in all?`;
      correct = String(total);
      form = "array";
    } else {
      prompt = `There are ${groups} groups of ${noun} with ${inEach} in each group. How many ${noun} are there in all?`;
      correct = String(total);
      form = "total";
    }

    const key = mathProblemKey(ctx.practiceType, groups, inEach, form, extra);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-multdiv-word-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! ${groups} × ${inEach} = ${total}.`,
        visualEmoji: "✏️",
        choices: buildNumberChoices(Number(correct), 0, 100, ctx.rng),
      }),
    );
  }

  return problems;
};
